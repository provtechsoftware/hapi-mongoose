/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=boom
/// <reference path="../../../typings/boom/boom.d.ts"/> ///ts:ref:generated

import * as hapi from 'hapi';
import * as boom from 'boom';
import {ABaseResponse} from './ABaseResponse';

export class PostResponse extends ABaseResponse {

  reply(reply: hapi.IReply): void {
    if (this._resource.areKeysValid(Object.keys(this._request.payload[this._rootName]))) {
      this._reply = reply;

      let data = this._resource.importItem(this._request.payload[this._rootName]);
      let item = new this._resource.model(data);

      item.save((err: any, record: any) => {
        if (err) {
          return reply(boom.badRequest('Can\'t create record.', err));
        }

        this._replyRecord(record, 201);
      });
    } else {
      reply(boom.badRequest('Invalid keys.'));
    }
  }
}
