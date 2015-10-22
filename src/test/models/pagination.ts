/// ts:ref=mocha
/// <reference path="../../../typings/mocha/mocha.d.ts"/> ///ts:ref:generated
/// ts:ref=should
/// <reference path="../../../typings/should/should.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=async
/// <reference path="../../../typings/async/async.d.ts"/> ///ts:ref:generated
/// ts:ref=lodash
/// <reference path="../../../typings/lodash/lodash.d.ts"/> ///ts:ref:generated
/* tslint:disable:no-unused-variable */

import * as should from 'should';
import * as mongoose from 'mongoose';
import * as async from 'async';
import * as _ from 'lodash';
import * as testServer from '../testServer';
import * as HapiMongooseResource from '../../lib/resource';

describe('GET pagination', () => {
  var server: testServer.Server;
  var testModel;

  before((done: MochaDone) => {
    testModel = mongoose.model('testModelPagination', new mongoose.Schema({
      name: String
    }));

    testServer
      .create({ resources: [testModel] })
      .then((createdServer: testServer.Server) => {
        server = createdServer;

        async.each(
          _.range(5),
          (i: number, callback: Function) => {
            let item = new testModel({ name: 'item' + i });
            item.save(() => {
              callback();
            });
          },
          done);
      })
      .catch(done);
  });

  after((done: MochaDone) => {
    server.stop(() => {
      testModel.remove({}, done);
    });
  });

  it('should return two elements for first page', (done: MochaDone) => {
    server.createRequest()
      .get('/testmodelpaginations?page[offset]=0&page[limit]=2')
      .then((res: any, done: MochaDone) => {
        let result = JSON.parse(res.result);
        result.should.have.keys('testmodelpaginations', 'meta');
        result.meta.should.have.keys('page');
        result.meta.page.should.have.keys('offset', 'limit', 'total');

        result.testmodelpaginations.length.should.equal(2);
        result.meta.page.offset.should.equal(0);
        result.meta.page.limit.should.equal(2);
        result.meta.page.total.should.equal(5);
        done();
      })
      .end(done);
  });

  it('should return default meta properties', (done: MochaDone) => {
    server.createRequest()
      .get('/testmodelpaginations')
      .then((res: any, done: MochaDone) => {
        let result = JSON.parse(res.result);
        result.should.have.keys('testmodelpaginations', 'meta');
        result.meta.should.have.keys('page');
        result.meta.page.should.have.keys('offset', 'limit', 'total');

        result.testmodelpaginations.length.should.equal(5);
        result.meta.page.offset.should.equal(0);
        result.meta.page.limit.should.equal(10);
        result.meta.page.total.should.equal(5);
        done();
      })
      .end(done);
  });

  it('should return 400 on invalid offset', (done: MochaDone) => {
    server.createRequest()
      .get('/testmodelpaginations?page[offset]=_')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });

  it('should return 400 on invalid limit', (done: MochaDone) => {
    server.createRequest()
      .get('/testmodelpaginations?page[limit]=_')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });

  it('should return 400 on invalid page', (done: MochaDone) => {
    server.createRequest()
      .get('/testmodelpaginations?page=_')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });
});
