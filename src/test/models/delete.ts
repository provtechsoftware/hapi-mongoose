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
    let testModel = mongoose.model('deleteModelTest', new mongoose.Schema({
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

describe('Deleting records', () => {
  var test: ITestSetup = <ITestSetup>{};

  before(serverSetup(test));
  after((done: MochaDone) => {
    test.server.stop(done);
  });

  afterEach((done: MochaDone) => {
    test.model.remove({}, done);
  });

  afterEach((done: MochaDone) => {
    test.model.remove({}, done);
  });

  it('should delete a record', (done: MochaDone) => {
    let item = new test.model({ name: 'value' });
    item.save(() => {
      test.server.createRequest()
        .delete('/deletemodeltests/' + item._id)
        .thenStatusCodeShouldEqual(204)
        .thenBodyShouldBeEmpty()
        .then( (res: any, done: MochaDone) => {
          test.model.count({ _id: item._id }, (err: any, count: number) => {
            count.should.equal(0);
            done();
          });
        })
        .end(done);
    });
  });

  it('should not return a body when silent=true', (done: MochaDone) => {
    let item = new test.model({ name: 'value' });
    item.save(() => {
      test.server.createRequest()
        .delete('/deletemodeltests/' + item._id + '?silent=true')
        .thenStatusCodeShouldEqual(204)
        .thenBodyShouldBeEmpty()
        .then( (res: any, done: MochaDone) => {
          test.model.count({ _id: item._id }, (err: any, count: number) => {
            count.should.equal(0);
            done();
          });
        })
        .end(done);
    });
  });

  it('should return 412 if-match header is false', (done: MochaDone) => {
    let item = new test.model({ name: 'value' });
    item.save(() => {
      test.server.createRequest()
        .header('If-Match', '"sometag", "v:9999", "someothertag"')
        .delete('/deletemodeltests/' + item._id)
        .thenStatusCodeShouldEqual(412)
        .end(done);
    });
  });

  it('should return 400 when if-match header has a bad format', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('name', 'second')
        .header('If-Match', '"v:string"')
        .delete('/deletemodeltests/' + item._id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });

  it('should return 400 for invalid ids', (done: MochaDone) => {
    test.server.createRequest()
      .delete('/deletemodeltests/invalid')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });

  it('should return 404 for inexistent ids', (done: MochaDone) => {
    test.server.createRequest()
      .delete('/deletemodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
      .thenStatusCodeShouldEqual(404)
      .end(done);
  });

  it('should return 404 for inexistent ids when if-match header is set', (done: MochaDone) => {
    test.server.createRequest()
      .header('If-Match', '"v:9999"')
      .delete('/deletemodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
      .thenStatusCodeShouldEqual(404)
      .end(done);
  });

  it('should return 404 for a missing id', (done: MochaDone) => {
    test.server.createRequest()
      .delete('/deletemodeltests/')
      .thenStatusCodeShouldEqual(404)
      .end(done);
  });
});
