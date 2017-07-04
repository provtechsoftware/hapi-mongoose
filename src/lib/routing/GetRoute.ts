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

export default class GetRoute extends ABaseRoute {

  constructor(basePath: string, resource: Resource, plugin: HapiPlugin) {
    super('GET', basePath, resource, plugin, resource.options.auth.getList);

    this.path = path.join(basePath, resource.options.name.plural, '{id}');

    this.handler = (request: hapi.Request, reply: hapi.IReply) => {
      let query = this._model.findById(request.params['id'], resource.options.fieldProjection);
      let response = new responses.GetResponse(request, resource, query, plugin);

      response.reply(reply);
    };
  }
};
