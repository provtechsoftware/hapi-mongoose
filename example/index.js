/// ts:ref=hapi
/// <reference path="../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
var mongoose = require('mongoose');
var hapi = require('hapi');
var hapiMongoose = require('../dist/lib');
// Create a mongoose model
var myModel = mongoose.model('myModel', new mongoose.Schema({
    name: String
}));
// Create a hapi server
var server = new hapi.Server();
server.connection({ port: 3000 });
// Create the resource options
var options = {
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
};
// Create a resource
var resource = new hapiMongoose.Resource(myModel, options);
// Bind the hapiMongoose plugin to the server
var plugin = new hapiMongoose.HapiPlugin();
var pluginOptions = {
    resources: [resource],
    path: '/api'
};
server.register({ register: plugin, options: pluginOptions }, function (err) {
    if (err) {
        console.error(err);
    }
});
// Start the server
server.start(function () {
    console.log('Server running at:', server.info.uri);
});
