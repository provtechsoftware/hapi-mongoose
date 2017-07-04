/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated


import * as hapi from 'hapi';
import Resource from '../resource';
import {HapiPlugin} from '../index';
import * as path from 'path';
import * as responses from '../responses/responses';
import ABaseRoute from './ABaseRoute';

export default class DeleteRoute extends ABaseRoute {


  constructor(basePath: string, resource: Resource, plugin: HapiPlugin) {
    super('DELETE', basePath, resource, plugin, resource.options.auth.delete);

    this.path = path.join(basePath, this._resource.options.name.plural, '{id}');
    this.handler = (request: hapi.Request, reply: hapi.IReply) => {
      let response = new responses.DeleteResponse(request, resource);
      response.reply(reply);
    };
  }
};
