/// ts:ref=mongoose
/// <reference path="../../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=boom
/// <reference path="../../../../typings/boom/boom.d.ts"/> ///ts:ref:generated

import * as validators from './ABaseRequestValidator';
import * as mongoose from 'mongoose';
import * as boom from 'boom';
import * as hapi from 'hapi';

export class IfMatchValidator extends validators.ABaseRequestValidator {
  protected _request: hapi.Request;

  constructor(request: hapi.Request) {
    super(request);
  }

  validate(callback: (err?: Error) => void): void {
    if (!this._validateIfMatchFormatIfExist()) {
      callback(new Error('Invalid if-match header'));
      return;
    }

    callback();
  }

  checkVersion(model: mongoose.Model<mongoose.Document>, query: { _id: string, __v: number }, callback: (err: any) => void): void {
    model.findById(query._id, (err: any, res: any) => {
      if (err) {
        callback(boom.badRequest(err.message, err));
      } else if (res && res.__v !== query.__v) {
        callback(boom.preconditionFailed('Precondition failed.'));
      } else {
        callback(boom.notFound('Not found.'));
      }
    });
  }

  protected _validateIfMatchFormatIfExist(): boolean {
    let ifMatch = this.getIfMatchValue();

    if (ifMatch === null) {
      return true;
    }
    return ifMatch && !isNaN(+ifMatch);
  }
}
