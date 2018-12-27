'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {promisify} = require('util'); //destructuring
const exec = promisify(require('child_process').exec);
const mongo = require('mongodb').MongoClient;


const MONGO_OPTIONS = {
  useNewUrlParser: true
};
const USER_INFO_TABLE_NAME = 'users_info';
const FILE_INFO_TABLE_NAME = 'files_info';
const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

async function connectDatabase(mongoUrl, dbName) {
    let mid = new UserMiddleware(mongoUrl, dbName);

    mid.client = await mongo.connect(mongoUrl, MONGO_OPTIONS);
    mid.db = mid.client.db(dbName);
    mid.userInfo = mid.db.collection(USER_INFO_TABLE_NAME);
    mid.fileInfo = mid.db.collection(FILE_INFO_TABLE_NAME);

    return mid;
  }
module.exports = connectDatabase;

class UserMiddleware {
  constructor(mongoUrl, dbName) {
    this.mongoUrl = mongoUrl;
    this.dbName = dbName;
    this.userInfoTableName = USER_INFO_TABLE_NAME;
    this.fileInfoTableName = FILE_INFO_TABLE_NAME;

    
  }

  async insert(obj, isFile=false) {
    
    const objType = (isFile)?"file":"user";
    const validMsg = (isFile)?
      isValid(obj, [{name:'_id'}, {name:'userId'}, {name:'path'}, {name:'filename'}])
     :isValid(obj, [{name:'_id'}, {name:'password'}]);
    if (validMsg) throw {error: new Error(validMsg), code: BAD_REQUEST};

    try {
      const rt = (isFile)?(await this.fileInfo.insertOne(obj))
        :(await this.userInfo.insertOne(obj));
    } catch (error) {
      if (error.code === 11000)
        throw {error: new Error(`${objType} ${obj._id} already exists`),
                code: CONFLICT};
      else throw error;
    }

  }

  async update(obj, isFile=false) {
    const objType = (isFile)?"file":"user";
    const validMsg = (isFile)?
      isValid(obj, [{name:'_id'}])
     :isValid(obj, [{name:'_id'}]);
    if (validMsg) throw {error: new Error(validMsg), code: BAD_REQUEST};

    const set = Object.assign({}, obj);
    delete set._id;
    const ret = ((isFile)?(await this.fileInfo.updateOne({ _id: obj._id }, { $set: set }))
          :(await this.userInfo.updateOne({ _id: obj._id }, { $set: set })));
    console.log(ret.matchedCount);
    if (ret.matchedCount !== 1) {
      throw {error: new Error(`${objType} ${obj._id} not found`),
            code: NOT_FOUND};
    }
  }

  async delete(obj, isFile=false) {
    const objType = (isFile)?"file":"user";
    const validMsg = (isFile)?
      isValid(obj, [{name:'_id'}])
     :isValid(obj, [{name:'_id'}]);
    if (validMsg) throw {error: new Error(validMsg), code: BAD_REQUEST};

    const ret = ((isFile)?(await this.fileInfo.deleteOne({ _id: obj._id }))
          :(await this.userInfo.deleteOne({ _id: obj._id })));
    console.log(ret.deletedCount);
    if (ret.deletedCount !== 1) {
      throw {error: new Error(`${objType} ${obj._id} not found`),
            code: NOT_FOUND};
    }
  }

  async search(obj, isFile=false) {
    const fd = ((isFile)?(await this.fileInfo.find(obj))
        :(await this.userInfo.find(obj))
      );
     return await fd.toArray();
  }

  async check_name(user) {
    if (user._id === undefined) return false;
    const fd = this.userInfo.findOne({_id: user._id});
    return fd !== null;
  }

  async check_pwd(user) {
    const validMsg = isValid(user,
      [{name:'_id'}, {name:'password'}]);
    if (validMsg) throw {error: new Error(validMsg), code: BAD_REQUEST};

    return await this.userInfo.findOne({ _id: user._id, password: user.password });

  }

  async getFile(userId, fileId) {
    if (userId === undefined || fileId === undefined) return {};
    return await this.userInfo.findOne({ _id: fileId, userId: userId});
  }

  async close() {
    await this.client.close();
  }

  async clean() {
    await this.userInfo.deleteMany({});
    await this.userFile.deleteMany({});
  }
}

function isValid(obj, mustHave=[]) {
  let err = '';
  if (mustHave!==[]) {
    mustHave.forEach( (must) => {
      
    if (obj[must.name] === undefined) {
      err += 'must have ' + must.name + '\n';
    }
    if (must.regex !== undefined && !must.regex.test(obj[must.name])){
      err += must.name +' must be ' + must.regex + '\n'; 
    }
    })
  }
  return err;
}

