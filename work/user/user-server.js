const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');


const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

const UserBase = "/user";
const FileBase = "/file";

function createServer(model, port) {
  const app = express();
  app.locals.model = model;
  app.locals.port = port;
  setupRoutes(app);
  const server = app.listen(port, async function() {
    console.log(`listening on port ${port}`);
  });
  return server;
}

module.exports = {
  createServer
}

function setupRoutes(app) {
  app.use(cors());
  app.use(bodyParser.json());

  app.get(`/login`, doCheckLogin(app));
  app.get(`/search`, doSearch(app));

  app.get(`${UserBase}`, setUserFlag(app), doCheckName(app));
  app.post(`${UserBase}`, setUserFlag(app), doCreate(app));
  app.get(`${UserBase}/:id`, setUserFlag(app), doGet(app));
  app.post(`${UserBase}/:id`, setUserFlag(app), doUpdate(app));
  app.delete(`${UserBase}/:id`, setUserFlag(app), doDelete(app));
  
  app.get(`${FileBase}`, setFileFlag(app), doCheckName(app));
  app.post(`${FileBase}`, setFileFlag(app), doCreate(app));
  app.get(`${FileBase}/:id`, setFileFlag(app), doGet(app));
  app.post(`${FileBase}/:id`, setFileFlag(app), doUpdate(app));
  app.delete(`${FileBase}/:id`, setFileFlag(app), doDelete(app));
  
  app.use(doErrors()); //must be last   
}

function setUserFlag(app) {
  return async function (req, res, next){
    if (req.isUser === undefined) 
      req.isUser = true;
    next();
  };
};

function setFileFlag(app) {
  return async function (req, res, next){
    if (req.isFile === undefined) 
      req.isFile = true;
    next();
  };
};


function doCheckLogin(app) {
  return errorWrap(async function(req, res) {
    const q = req.query || {};
    if (q.username === undefined || q.password === undefined) {
      res.status(BAD_REQUEST).json(q);
    } else {
      let user = {_id:q.username, password: q.password};
      console.log(user);
      user = await app.locals.model.check_pwd(user);
      console.log(user);
      if (user !== null) {
        user.username = user._id;
        res.status(OK).json(user);
      } else res.status(NOT_FOUND).json(q);
    }
    
  });
}

function doSearch(app) {
  return errorWrap(async function(req, res) {
    const q = req.query || {};
    let files = await app.locals.model.search({userId:q.username}, true);
    if (files.length !== 0) {
      res.status(OK).json(files);
    } else res.status(NOT_FOUND).json(q);
  });
}

function doCheckName(app) {
  return errorWrap(async function(req, res) {
    const q = req.query || {};
    if ((req.isFile && q.filename === undefined) 
          || (req.isUser && q.username === undefined)
          || (!req.isFile && !req.isUser)) {
      res.status(BAD_REQUEST).json(q);
    } else {
      const name = (req.isFile)?q.filename:q.username;
      let obj = await app.locals.model.search({_id:name}, req.isFile);
      if (obj.length === 0) {
        res.status(OK).json(obj[0]);
      } else res.status(CONFLICT).json(q);
    }
  });
}

function doCreate(app) {
  return errorWrap(async function(req, res) {
    try {
      let obj = req.body;
      obj._id = (req.isFile)?obj.filename:obj.username;
      const results = await app.locals.model.insert(obj,req.isFile);
      // res.append('Location', requestUrl(req) + '/' + obj.id);
      res.sendStatus(CREATED);
    }
    catch(err) {
      console.log(err);
      res.status(err.code).json({error: err.error.toString()});
    }
  });
}


function doGet(app) {
  return errorWrap(async function(req, res) {
    
    const id = req.params.id;
    const results = await app.locals.model.search({ _id: id}, req.isFile);
    if (results.length === 0) {
    	res.status(NOT_FOUND).json(mapped);
    }
    else {
     res.json(results[0]);
    }

  });
}

function doUpdate(app) {
  return errorWrap(async function(req, res) {
    try {
      const patch = Object.assign({}, req.body);
      patch._id = req.params.id;
      const results = await app.locals.model.update(patch, req.isFile);
      res.sendStatus(OK);
    }
    catch(err) {
      res.status(err.code).json({error: err.error.toString()});;
    }
  });
}

function doDelete(app) {
  return errorWrap(async function(req, res) {
    try {
      const id = req.params.id;
      const results = await app.locals.model.delete({ _id: id });
      res.sendStatus(OK);
    }
    catch(err) {
      console.log(err.error);
      res.status(err.code).json({error: err.error.toString()});;
    }
  });
}





/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR).json({ code: 'SERVER_ERROR', message: err.message });
    console.error(err);
  };
}

/** Set up error handling for handler by wrapping it in a 
 *  try-catch with chaining to error handler on error.
 */
function errorWrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    }
    catch (err) {
      next(err);
    }
  };
}

