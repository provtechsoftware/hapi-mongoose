/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated

import 'promise/polyfill';

import * as hapi from 'hapi';
import Resource from '../resource';
import Records from '../records';
import * as Plugin from '../index';
import {ABaseRequestValidator} from './validators/validators';

export class ABaseResponse {
  protected _request: hapi.Request;
  protected _resource: Resource;
  protected _plugin: Plugin.HapiPlugin;
  protected _isSilent: boolean;
  protected _validator: ABaseRequestValidator;
  protected _reply: hapi.IReply;
  protected _rootName: string;

  private static __isSilent(request: hapi.Request): boolean {
    return request.query && request.query.silent === 'true';
  }

  protected _replyRecord(res: any, responseCode?: number): void {
    if (this._isSilent) {
      this._reply().code(204);
    } else {
      if (!responseCode) {
        responseCode = 200;
      }

      let jsonRecords = new Records<any>(this._resource);
      jsonRecords.setData(res);
      let response = this._reply(jsonRecords.serialise());
      response.code(responseCode);
      response.header('content-type', 'application/json; charset=utf-8');
    }
  }

  protected _createElementQuery(): { _id: string, __v?: number } {
    let elementQuery: { _id: string, __v?: number } = { _id: '' };
    let ifMatch = this._validator.getIfMatchValue();

    if (ifMatch) {
      elementQuery.__v = parseInt(ifMatch, 10);
    }

    if (this._request.params['id']) {
      elementQuery._id = this._request.params['id'];
    }

    return elementQuery;
  }

  constructor(request: hapi.Request, resource: Resource) {
    this._request = request;
    this._resource = resource;
    this._isSilent = ABaseResponse.__isSilent(request);
    this._rootName = this._resource.options.name.singular;
  }

  reply(reply: hapi.IReply): void {
    this._reply = reply;

    if (this._validator) {
      this._validator.validate((err?: Error) => {
        this._replyCallback(err);
      });
    } else {
      this._replyCallback();
    }
  }

  protected _replyCallback(err?: Error): void {
    throw new Error('ABaseResponse._replyCallback is abstract');
  }
}
