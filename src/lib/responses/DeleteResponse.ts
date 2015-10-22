/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=boom
/// <reference path="../../../typings/boom/boom.d.ts"/> ///ts:ref:generated

import * as hapi from 'hapi';
import Resource from '../resource';
import * as boom from 'boom';
import {ABaseResponse} from './ABaseResponse';
import * as validators from './validators/validators';

export class DeleteResponse extends ABaseResponse {
  protected _validator: validators.IfMatchValidator;

  constructor(request: hapi.Request, resource: Resource) {
    super(request, resource);
    this._validator = new validators.IfMatchValidator(request);
  }

  protected _replyCallback(err: Error): void {
    if (err) {
      this._reply(boom.badRequest(err.message, err));
      return;
    }

    let model = this._resource.model;
    let query = this._createElementQuery();
    model.findOneAndRemove(
      query,
      (err: any, res: any) => {
        if (err) {
          this._reply(boom.badRequest(err.message, err));
        } else if (res) {
          this._reply().code(204);
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
