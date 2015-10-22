/// ts:ref=hapi
/// <reference path="../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
import * as mongoose from 'mongoose';
import * as hapi from 'hapi';

let hapiMongoose = require('../dist/lib');

// Create a mongoose model
let myModel = mongoose.model('myModel', new mongoose.Schema({
  name: String
}));

// Create a hapi server
let server = new hapi.Server();
server.connection({ port: 3000 });

// Create the resource options
let options: IResourceOptions = {
  // The default resource options

  // Resource name
  name: {
    singular: 'mymodel',
    plural: 'mymodels'
  },
  // Or just the singular name
  // name: 'myModel'

  // Access options
  methodAccess: {
    getList: true,
    getItem: true,
    post: true,
    put: true,
    patch: true,
    delete: true
  },

  // Hide some fields
  exposed: {
    // name: false
  },

  // Field aliases
  alias: {
    _id: 'id' // _id field will be exported as 'id'
  }
}

// Create a resource
let resource = new hapiMongoose.Resource(myModel, options);

// Bind the hapiMongoose plugin to the server
let plugin = new hapiMongoose.HapiPlugin();
let pluginOptions = {
  resources: [ resource ],
  path: '/api'
};

server.register({ register: plugin, options: pluginOptions }, (err: Error) => {
  if(err) {
    console.error(err);
  }
});

// Start the server
server.start(() => {
  console.log('Server running at:', server.info.uri);
});
