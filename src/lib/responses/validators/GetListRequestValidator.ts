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

    callback();
  }
}
