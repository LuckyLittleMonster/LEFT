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
  app.locals.port = port;
  app.locals.base = UserBase;
  app.locals.model = model;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

module.exports = {
  createServer: createServer
}

function setupRoutes(app) {
  const base = app.locals.base;
  app.use(cors());
  app.use(bodyParser.json());

  app.get('/login', doCheckLogin());
  app.get(`/search`, doSearch());

  app.get(`${UserBase}`, setUserFlag(), doCheckName());
  app.post(`${UserBase}`, setUserFlag(), doCreate());
  app.get(`${UserBase}/:id`, setUserFlag(), doGet());
  app.post(`${UserBase}/:id`, setUserFlag(), doUpdate());
  app.delete(`${UserBase}/:id`, setUserFlag(), doDelete());
  
  app.get(`${FileBase}`, setFileFlag(), doCheckName());
  app.post(`${FileBase}`, setFileFlag(), doCreate());
  app.get(`${FileBase}/:id`, setFileFlag(), doGet());
  app.post(`${FileBase}/:id`, setFileFlag(), doUpdate());
  app.delete(`${FileBase}/:id`, setFileFlag(), doDelete());
  
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
    }
    let user = {_id:q.username, password: q.password};
    user = await app.locals.model.check_pwd(user);
    if (user !== undefined) {
      user.username = user._id;
      res.status(OK).json(user);
    } else res.status(NOT_FOUND).json(q);
  });
}

function doCheckName(app) {
  return errorWrap(async function(req, res) {
    const q = req.query || {};
    if ((req.isFile && q.filename === undefined) 
          || (req.isUser && q.username === undefined)
          || (!req.isFile && req.isUser)) {
      res.status(BAD_REQUEST).json(q);
    }
    const name = (req.isFile)?q.filename:q.username;
    let obj = await app.locals.model.search({_id:name}, req.isFile);
    if (obj.length() === 0) {
      res.status(OK).json(obj[0]);
    } else res.status(CONFLICT).json(q);
  });
}

function doCreate(app) {
  return errorWrap(async function(req, res) {
    try {
      const obj = req.body;
      const results = await app.locals.model.insert(obj,req.isFile);
      // res.append('Location', requestUrl(req) + '/' + obj.id);
      res.sendStatus(CREATED);
    }
    catch(err) {
      res.status(err.code).json(err);
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
      const results = app.locals.model.update(patch, req.isFile);
      res.sendStatus(OK);
    }
    catch(err) {
      res.status(err.code).json(err);
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
      res.status(err.code).json(err);
    }
  });
}





/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR);
    res.json({ code: 'SERVER_ERROR', message: err.message });
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

