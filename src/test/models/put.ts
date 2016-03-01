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
    let testModel = mongoose.model('putModelTest', new mongoose.Schema({
      name: String,
      value: String
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

describe('Replacing records (PUT)', () => {
  var test: ITestSetup = <ITestSetup>{};

  before(serverSetup(test));
  after((done: MochaDone) => {
    test.server.stop(done);
  });

  afterEach((done: MochaDone) => {
    test.model.remove({}, done);
  });

  it('should replace a record', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('putmodeltest', {name: 'second'})
        .put('/putmodeltests/' + item._id)
        .thenCheckBody((body: string, done: MochaDone) => {
          var responseObj = JSON.parse(body);
          responseObj.putmodeltest.should.have.keys('id', 'name', 'value');
          responseObj.putmodeltest.id.should.equal(item._id.toString());
          responseObj.putmodeltest.name.should.equal('second');
          done();
        })
        .then((res: any, done: MochaDone) => {
          res.statusCode.should.equal(200);
          test.model.find({name: 'second'}, (err: any, records: any) => {
            records.length.should.equal(1);
            should.not.exist(records[0].value);
            done();
          });
        })
        .end(done);
    });
  });

  it('should not return a body when silent=true', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('putmodeltest', { name: 'second' })
        .put('/putmodeltests/' + item._id + '?silent=true')
        .thenBodyShouldBeEmpty()
        .then((res: any, done: MochaDone) => {
          res.statusCode.should.equal(204);
          test.model.find({name: 'second'}, (err: any, records: any) => {
            records.length.should.equal(1);
            should.not.exist(records[0].value);
            done();
          });
        })
        .end(done);
    });
  });

  it('should return 412 if-match header has a bad version', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('putmodeltest', { name: 'second' })
        .header('If-Match', '"v:9999"')
        .put('/putmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(412)
        .end(done);
    });
  });

  it('should return 400 when if-match header has a bad format', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('putmodeltest', { name: 'second' })
        .header('If-Match', '"v:string"')
        .put('/putmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });

  it('should return 400 for invalid ids', (done: MochaDone) => {
    test.server.createRequest()
      .payload('name', 'value')
      .put('/putmodeltests/invalid')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });

  it('should return 404 for nonexistent ids', (done: MochaDone) => {
    test.server.createRequest()
      .payload('putmodeltest', { name: 'second' })
      .put('/putmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
      .thenStatusCodeShouldEqual(404)
      .end(done);
  });

  it('should return 404 for nonexistent ids and if-match header is present', (done: MochaDone) => {
    test.server.createRequest()
      .header('If-Match', '"v:9999"')
      .payload('putmodeltest', { name: 'second' })
      .put('/putmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
      .thenStatusCodeShouldEqual(404)
      .end(done);
  });

  it('should return 400 for queries with invalid model keys', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('putmodeltests', { name: 'testName', otherKey: 'strange value' })
        .put('/putmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });
});
