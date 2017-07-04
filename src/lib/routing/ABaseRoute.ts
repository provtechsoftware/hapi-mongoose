/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated

import * as hapi from 'hapi';
import * as mongoose from 'mongoose';

import * as plugin from '../index';
import Resource from '../resource';

export default class ABaseRoute {
  public method: string;
  public path: string;
  protected _model: mongoose.Model<mongoose.Document>;
  protected _resource: Resource;
  protected auth: any;

  constructor(method: string, basePath: string, resource: Resource, plugin: plugin.HapiPlugin, auth: any) {
    this.method = method;
    this._model = resource.model;
    this._resource = resource;
    this.auth = auth;
  }

  public handler(request: hapi.Request, reply: hapi.IReply): void {
    throw new Error('ABaseRoute.handler is abstract');
  }

  public getRoute(): hapi.IRouteConfiguration {
    return {
      method: this.method,
      path: this.path,
      handler: this.handler,
      config: {
        auth: this.auth
      }
    };
  }
}
