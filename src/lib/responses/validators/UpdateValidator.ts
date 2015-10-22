/// ts:ref=mongoose
/// <reference path="../../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=boom
/// <reference path="../../../../typings/boom/boom.d.ts"/> ///ts:ref:generated

import * as validators from './validators';
import * as hapi from 'hapi';
import * as mongoose from 'mongoose';
import Resource from '../../resource';


export class UpdateValidator extends validators.ABaseRequestValidator {
  protected _resource: Resource;
  protected _rootName: string;
  protected _ifMatchValidator: validators.IfMatchValidator;

  constructor(request: hapi.Request, resource: Resource) {
    super(request);
    this._resource = resource;
    this._rootName = this._resource.options.name.singular;
    this._ifMatchValidator = new validators.IfMatchValidator(request);
  }

  validate(callback: (err?: Error) => void): void {
    this._ifMatchValidator.validate((err?: Error) => {
      if (err) {
        callback(err);
        return;
      }

      if (!this._request.payload[this._rootName]) {
        callback(new Error('root key is missing'));
        return;
      }

      if (!this._resource.areKeysValid(Object.keys(this._request.payload[this._rootName]))) {
        callback(new Error('Invalid keys'));
        return;
      }

      callback();
    });
  }

  checkVersion(model: mongoose.Model<mongoose.Document>, query: { _id: string, __v: number }, callback: (err: any) => void): void {
    this._ifMatchValidator.checkVersion(model, query, callback);
  }
}
