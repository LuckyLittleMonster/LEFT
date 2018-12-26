#!/usr/bin/env node

'use strict';

const {promisify} = require('util');
const writeFile = promisify(require('fs').writeFile);
const Path = require('path');

const UserDatabase = require('./user-database');
const UserServer = require('./user-server');

function usage() {
  console.error("usage: %s MONGO_DB_URL PORT",
		Path.basename(process.argv[1]));
  process.exit(1);
}

function getPort(portArg) {
  let port = Number(portArg);
  if (!port) {
    console.error(`bad port '${portArg}'`);
    usage();
  }
  return port;
}

async function shutdown(event, resources) {
  if (Object.keys(resources).length > 0) {
    console.log(`shutting down on ${event}`);
    if (resources.server) {
      await resources.server.close();
      delete resources.server;
    }
    if (resources.database) {
      await resources.database.close();
      delete resources.database;
    }
  }
}

function cleanupResources(resources) {
  const events = [ 'SIGINT', 'SIGTERM', 'exit' ];
  for (const event of events) {
    process.on(event, async () => await shutdown(event, resources));
  }
}

const PID_FILE = '.pid';
const DB_NAME = 'LEFT';

//args[0]: mongdb url; args[1]: port; 

async function go(args) {
  const resources = {};
  try {
    if (!/^mongodb\:\/\/.+?\:\d+$/.test(args[0])) {
      console.error('bad mongo-db url; must be of form ' +
		    'mongodb://SERVER:PORT');
      usage();
    }
    const port = getPort(args[1]);
    await writeFile(PID_FILE, `${process.pid}\n`);
    const database = resources.database = new UserDatabase(args[0], DB_NAME);
    const server = resources.server = UserServer.createServer(database, port);
  }
  catch (err) {
    console.error(err);
  }
  finally {
    cleanupResources(resources);
  }
}

if (process.argv.length < 2) usage();
go(process.argv.slice(2));
