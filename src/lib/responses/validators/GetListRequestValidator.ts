/// ts:ref=hapi
/// <reference path="../../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
import {ABaseRequestValidator} from './ABaseRequestValidator';

export class GetListRequestValidator extends ABaseRequestValidator {
  validate(callback: (err?: Error) => void): void {
    if (this._request.query.page) {
      if (typeof this._request.query.page !== 'object') {
        callback( new Error('invalid page') );
        return;
      }
      if (isNaN(+this._request.query.page.offset)) {
        callback( new Error('invalid page param'));
        return;
      }
      if (isNaN(+this._request.query.page.limit)) {
        callback( new Error('invalid page limit'));
        return;
      }
    }

    if (this._request.query.range) {
      if (typeof this._request.query.range !== 'object') {
        callback( new Error('invalid range') );
        return;
      }
      // Range parameter is allowed only for 'date' field
      for (let key of this._request.query.range) {
        if (!(/date__(lt|lte|gt|gte)/.test(key))) {
          callback( new Error('invalid range operator') );
          return;
        }
        if (isNaN(Date.parse(this._request.query.range[key]))) {
          callback( new Error('invalid range operator') );
          return;
        }
      }
    }

    callback();
  }
}
