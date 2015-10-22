/// ts:ref=hapi
/// <reference path="../../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
import * as hapi from 'hapi';

export class ABaseRequestValidator {
  protected _request: hapi.Request;

  constructor(request: hapi.Request) {
    this._request = request;
  }

  validate(callback: (err?: Error) => void): void {
    throw new Error('ABaseRequestValidator.validate is abstract');
  };

  getIfMatchValue(): string {
    let ifMatch = this._request.headers['if-match'];

    if (typeof ifMatch === 'string') {
      let versionTags: string[] = ifMatch.match(/"v:([a-zA-Z0-9]+)"/);

      if (versionTags !== null && versionTags.length > 0) {
        return versionTags[1];
      }
    }

    return null;
  }
}
