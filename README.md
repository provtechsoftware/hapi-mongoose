# Summary

A Hapi.js plugin that maps mongoose models to routes written in TypeScript 1.4

# Quick Example

	var hapiMongoose = require('../dist/lib');
	var hapi = require('hapi');
	var mongoose = require('mongoose');

	var myModel = mongoose.model('myModel', new mongoose.Schema({
		name: String
	}));

	var server = new hapi.Server();
	server.connection({port: 3000});

	server.register({
		register: new hapiMongoose.HapiPlugin(), options: {
			resources: [myModel],
			path: '/api'
		}
	});

	server.start(function () {
	console.log('Server running at:', server.info.uri);
	});

# Details

The plugin has two components:

- a model wrapper called Resource
- the hapi plugin


## Resources

A resource is a mongoose model wrapper that adds extra information, like allowed methods or model fields
to help the hapi plugin to map the routes or to add some error handling.

Wrap a mongoose model in a resource:

	var resource = new hapiMongoose.Resources.Resource(myModel, resourceOptions);

Resource options:

    var options = new hapiMongoose.Resources.ResourceOptions();

    /* The default resource options
    // Set a custom name
    options.name = 'car';
    // or
    options.name = { singular: 'person', plural: 'people' };

    // Enable all methods
    options.methodAccess.getList = true;
    options.methodAccess.getItem = true;
    options.methodAccess.post = true;
    options.methodAccess.put = true;
    options.methodAccess.patch = true;
    options.methodAccess.delete = true;

    // Field aliases
    options.alias._id = 'id'; // aliased by default

    // Hide some fields
    options.exposed: {
    // name: false
    };

    // Pagination
    options.pagination.limit = 10; // default page size
    */

## Hapi plugin

The hapi plugin binds the resources to the hapi server.

Creating a plugin:

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

HapiMongoose.IOptions has two members: 'resources' and 'path'

- *resources* property is a list of _mongoose.Model<any>_ or _HapiMongooseResource.Resource_. If _mongoose.Model<any>_ objects are provided, they will be wraped automatically in _HapiMongooseResource.Resource_ with the default options

- *path* the base path for the resources routes.


The plugin will register the following routes:

- GET    */{path}/{model name}*      						to retreive a list of all the elements from a model
- GET    */{path}/{model name}*?page[offset]={offset}&page[limit]={limit}      paginate a model
- GET    */{path}/{model name}*?project={fieldName,...}     project one or more fields
- GET    */{path}/{model name}*?search={value}     			search in model
- GET    */{path}/{model name}*?query[field]={value}     	query the model
- POST   */{path}/{model name}*      						to create a new resource
- GET    */{path}/{model name}/{id}* 						to retreive the resource with id
- PUT    */{path}/{model name}/{id}* 						to replace a resource
- PATCH  */{path}/{model name}/{id}* 						to update certain fields
- DELETE */{path}/{model name}/{id}* 						to delete a resource

## Setup and compile

This library is written in TypeScript. If you want to use it with JavaScript you
have to compile the files first.

	npm install
	tsd install
	grunt

The compiled library will be exported to dist/lib
