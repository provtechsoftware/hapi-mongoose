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
import * as _ from 'lodash';


export default class GetListRoute extends ABaseRoute {

  constructor(basePath: string, resource: Resource, plugin: HapiPlugin) {
    super('GET', basePath, resource, plugin, resource.options.auth.getList);

    this.path = path.join(basePath, this._resource.options.name.plural);
    this.handler = (request: hapi.Request, reply: hapi.IReply) => {
      let queryObj = {};

      if (request.query['query']) {
        queryObj = this.__updateObjectValues(request.query['query']);
      }

      if (request.query['ids']) {
        queryObj['_id'] = { '$in': request.query['ids'] };
      }

      if (request.query['search']) {
        queryObj['$text'] = { '$search': request.query['search'] };
      }

      let response = new responses.GetListResponse(request, resource, queryObj, plugin);

      response.reply(reply);
    };
  }

  private __updateObjectValues(obj: Object): Object {
    let newObj = {};

    _.each(obj, (value: any, key: string) => {
      if (value === 'true') {
        newObj[key] = true;
      } else if (value === 'false') {
        newObj[key] = false;
      } else if (typeof value === 'object') {
        newObj[key] = this.__updateObjectValues(value);
      } else {
        newObj[key] = value;
      }
    });

    return newObj;
  }
}
