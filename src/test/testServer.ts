/// ts:ref=mocha
/// <reference path="../../typings/mocha/mocha.d.ts"/> ///ts:ref:generated
/// ts:ref=should
/// <reference path="../../typings/should/should.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/* tslint:disable:no-unused-variable */

import 'promise/polyfill';

import * as Hapi from 'hapi';
import * as mongoose from 'mongoose';
import * as should from 'should';
import * as  HapiMongoose from '../lib/index';

mongoose.connect('mongodb://localhost/test');

export interface ITestSetup {
  server: Server;
  model: mongoose.Model<mongoose.Document>;
}
export type HapiRes = {
  statusCode: number;
  headers: any;
  payload: string;
  rawPayload: Buffer;
  raw: { req: any; res: any };
  result: string;
  request: Hapi.Request
};

export type ServerResponseHandler = (res: HapiRes, done: MochaDone) => void;

export class ServerResponse {
  private __stack: ServerResponseHandler[] = [];
  private __done: MochaDone;
  private __res: HapiRes;
  private __canUnwind: boolean = false;

  resolve(res: HapiRes): void {
    this.__res = res;
    this.__canUnwind = true;

    if (this.__done) {
      this.__unwind();
    }
  }

  thenStatusCodeShouldEqual(code: number): ServerResponse {
    return this.then( (res: any, done: MochaDone) => {
      res.statusCode.should.equal(code);
      done();
    });
  }

  thenCheckBody(handler: (body: string, done: MochaDone) => void): ServerResponse {
    return this.then( (res: any, done: MochaDone) => {
      handler(res.result, done);
    });
  }

  thenBodyShouldBeEmpty(): ServerResponse {
    return this.then( (res: any, done: MochaDone) => {
      should.not.exist(res.result);
      done();
    });
  }

  thenContentTypeShouldBe(type: string): ServerResponse {
    return this.then( (res: any, done: MochaDone) => {
      res.headers['content-type'].should.equal(type);
      done();
    });
  }

  then(callback: ServerResponseHandler): ServerResponse {
    this.__stack.push(callback);
    return this;
  }

  end(done?: MochaDone): void {
    this.__done = done;

    if (this.__canUnwind) {
      this.__unwind();
    }
  }

  private __unwind(index?: number): void {
    index = !index ? 0 : index;

    let done: MochaDone = (err: any) => {
      this.__unwind(index + 1);
    };

    try {
      if (index < this.__stack.length) {
        this.__stack[index](this.__res, done);
      } else {
        this.__done();
      }
    } catch (err) {
      this.__done(err);
    }
  }
}

export class ServerRequest {
  private __payload: any;
  private __headers: any;
  private __server: any;
  private __response: ServerResponse;

  constructor(server: any) {
    this.__response = new ServerResponse();
    this.__payload = {};
    this.__headers = {};
    this.__server = server;
  }

  payload: any = (name: string, value: string) => {
    this.__payload[name] = value;
    return this;
  };

  header: any = (name: string, value: string) => {
    this.__headers[name] = value;
    return this;
  };

  get: any = (url: string, callback: any) => {
    return this.send(url, 'GET');
  };

  post: any = (url: string) => {
    return this.send(url, 'POST');
  };

  put: any = (url: string) => {
    return this.send(url, 'PUT');
  };

  patch: any = (url: string) => {
    return this.send(url, 'PATCH');
  };

  delete: any = (url: string, headers?: any) => {
    return this.send(url, 'DELETE');
  };

  send: any = (url: string, method: string) => {
    this.__server.inject(
    { url: url,
      method: method,
      payload: this.__payload,
      headers: this.__headers
    },
    (res: HapiRes) => {
      this.__payload = {};
      this.__headers = {};
      this.__response.resolve(res);
    });

    return this.__response;
  };
}

export class Server {
  private __server: any;

  constructor() {
    this.__server = new Hapi.Server();
    this.__server.connection({ port: 3000 });
  }

  register: any = (plugins: any|any[], callback: (err: any) => void): void => {
    this.__server.register(plugins, callback);
  };

  start: any = (callback: Function) => {
    this.__server.start(callback);
  };

  stop: any = (callback: Function) => {
    this.__server.stop(callback);
  };

  createRequest: any = (): ServerRequest => {
    return new ServerRequest(this.__server);
  };
}

export let create = (options: Object) => {
  let server = new Server();

  return new Promise( (resolve: Function, reject: Function) => {
    server.start(() => {
      let plugin = new HapiMongoose.HapiPlugin();
      server.register(
        { register: plugin,
          options: options
        },
        (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(server);
          }
        });
      });
  });
};
