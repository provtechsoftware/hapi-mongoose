/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=boom
/// <reference path="../../../typings/boom/boom.d.ts"/> ///ts:ref:generated

import * as hapi from 'hapi';
import Resource from '../resource';
import * as boom from 'boom';
import {ABaseResponse} from './ABaseResponse';
import * as validators from './validators/validators';

export class PutResponse extends ABaseResponse {
  protected _validator: validators.UpdateValidator;

  constructor(request: hapi.Request, resource: Resource) {
    super(request, resource);
    this._validator = new validators.UpdateValidator(request, resource);
  }

  protected _replyCallback(err: Error): void {
    if (err) {
      this._reply(boom.badRequest(err.message, err));
      return;
    }

    let model = this._resource.model;
    let data = this._resource.importItem(this._request.payload[this._rootName]);

    model.schema.eachPath((path: string, type: any) => {
      if (!data[path] && ['__v', '_id'].indexOf(path) === -1 && this._resource.isExposed(path)) {
        data[path] = null;
      }
    });

    let query = this._createElementQuery();
    model.findOneAndUpdate(
      query,
      data,
      { new: true },
      (err: any, res: any) => {
        if (err) {
          return this._reply(boom.badRequest(err.message, err));
        }

        if (res) {
          this._replyRecord(res);
        } else if (query.__v) {
          let expandedQuery: { _id: string, __v: number } = { _id: query._id, __v: query.__v };
          this._validator.checkVersion(model, expandedQuery, (err: any) => {
            this._reply(err);
          });
        } else {
          this._reply(boom.notFound('Not Found.'));
        }
      }
    );
  }
}
