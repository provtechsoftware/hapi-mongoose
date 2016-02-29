/// ts:ref=hapi
/// <reference path="../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=async
/// <reference path="../../typings/async/async.d.ts"/> ///ts:ref:generated
/// ts:ref=lodash
/// <reference path="../../typings/lodash/lodash.d.ts"/> ///ts:ref:generated


import * as mongoose from 'mongoose';
import * as hapi from 'hapi';
import * as _ from 'lodash';
import Resource from './resource';

type IOptions = {
  resources: Array<mongoose.Model<mongoose.Document>|Resource>;
  path?: string;
}

export class HapiPlugin {
  private __resources: Resource[] = [];
  private __path: string = '/';

  constructor() {
    let pkg = require('../../package.json');
    this.register.attributes = {
      name: pkg.name,
      version: pkg.version
    };
  }

  private static __castResources(resources: Array<mongoose.Model<mongoose.Document>|Resource>): Resource[] {
    return _.map(resources, (item: mongoose.Model<mongoose.Document>|Resource) => {
      let result: Resource;

      if (item instanceof Resource) {
        result = item;
      } else {
        result = new Resource(<mongoose.Model<mongoose.Document>>item);
      }

      return result;
    });
  }

  register: any = (server: hapi.Server, options: IOptions, next: any) => {

    if (options.path) {
      this.__path = options.path;
    }

    this.__resources = HapiPlugin.__castResources(options.resources);

    _.each(this.__resources, (resource: Resource) => {
      resource.plugin = this;
    });

    server.bind(this);
    this.__register(server);
    next();
  };

  errorInit: any = (error: any) => {
    if (error) {
      console.log('Error: Failed to load plugin (hapiMongoose):', error);
    }
  };

  getResourceFor: any = (modelName: string): Resource => {
    let result;

    _.each(this.__resources, (item: Resource) => {
      if (item.model.modelName === modelName) {
        result = item;
      }
    });

    return result;
  };

  private __register: any = (server: hapi.Server) => {
    _.each(this.__resources, (resource: Resource) => {
      resource.bindRoutes(server, this.__path);
    });
  };
}

