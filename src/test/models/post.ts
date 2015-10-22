/// ts:ref=mocha
/// <reference path="../../../typings/mocha/mocha.d.ts"/> ///ts:ref:generated
/// ts:ref=should
/// <reference path="../../../typings/should/should.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/* tslint:disable:no-unused-variable */

import * as should from 'should';
import * as mongoose from 'mongoose';
import * as testServer from '../testServer';

type ITestSetup = testServer.ITestSetup;

function serverSetup(testSetup: ITestSetup): (done: MochaDone) => void {
  'use strict';

  return (done: MochaDone) => {
    let testModel = mongoose.model('postModelTest', new mongoose.Schema({
      name: String
    }));

    testServer
      .create({ resources: [ testModel ] })
      .then((server: testServer.Server) => {
        testSetup.server = server;
        testSetup.model = testModel;
        done();
      })
      .catch(done);
  };
}

describe('Creating records (POST)', () => {
  var test: ITestSetup = <ITestSetup>{};

  before(serverSetup(test));
  after((done: MochaDone) => {
    test.server.stop(done);
  });

  afterEach((done: MochaDone) => {
    test.model.remove({}, done);
  });

  it('should create a new record', (done: MochaDone) => {
    test.server.createRequest()
      .payload('postmodeltest', { name: 'testName' })
      .post('/postmodeltests')
        .thenStatusCodeShouldEqual(201)
        .thenCheckBody((body: string, done: MochaDone) => {
          var responseObj = JSON.parse(body);
          responseObj.postmodeltest.should.have.keys('id', 'name');
          responseObj.postmodeltest.name.should.equal('testName');
          done();
        })
        .then((res: any, done: MochaDone) => {
          res.statusCode.should.equal(201);
          test.model.count({name: 'testName'}, (err: any, count: number) => {
            count.should.equal(1);
            done();
          });
        })
        .end(done);
  });

  it('should not return a body when silent=true', (done: MochaDone) => {
    test.server.createRequest()
      .payload('postmodeltest', { name: 'testName' })
      .post('/postmodeltests?silent=true')
      .thenStatusCodeShouldEqual(204)
      .thenBodyShouldBeEmpty()
      .then((res: any, done: MochaDone) => {
        test.model.count({name: 'testName'}, (err: any, count: number) => {
          count.should.equal(1);
          done();
        });
      })
      .end(done);
  });

  it('should return 400 for queries with invalid model keys', (done: MochaDone) => {
    test.server.createRequest()
      .payload('postmodeltest', { name: 'testName', otherKey: 'strange value' })
      .post('/postmodeltests')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });
});
