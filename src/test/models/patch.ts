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
    let testModel = mongoose.model('patchModelTest', new mongoose.Schema({
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

describe('Updating records (PATCH)', () => {
  var test: ITestSetup = <ITestSetup>{};

  before(serverSetup(test));
  after((done: MochaDone) => {
    test.server.stop(done);
  });

  afterEach((done: MochaDone) => {
    test.model.remove({}, done);
  });

  it('should work with a correct id', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('patchmodeltest', {name: 'second'})
        .patch('/patchmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(200)
        .thenCheckBody((body: string, done: MochaDone) => {
          var responseObj = JSON.parse(body);
          responseObj.patchmodeltest.should.have.keys('id', 'name', 'value');
          responseObj.patchmodeltest.id.should.equal(item._id.toString());
          responseObj.patchmodeltest.name.should.equal('second');
          responseObj.patchmodeltest.value.should.equal('some value');
          done();
        })
        .then((res: any, done: MochaDone) => {
          test.model.find({ name: 'second' }, (err: any, records: any) => {
            records.length.should.equal(1);
            records[0].value.should.equal('some value');
            done();
          });
        })
        .end(done);
    });
  });

  it('should not return with silent=true', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('patchmodeltest', { name: 'second' })
        .patch('/patchmodeltests/' + item._id + '?silent=true')
        .thenBodyShouldBeEmpty()
        .thenStatusCodeShouldEqual(204)
        .then((res: any, done: MochaDone) => {
          test.model.find({ name: 'second' }, (err: any, records: any) => {
            records.length.should.equal(1);
            records[0].value.should.equal('some value');
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
        .header('If-Match', '"v:9999"')
        .payload('patchmodeltest', { name: 'second' })
        .patch('/patchmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(412)
        .end(done);
    });
  });

  it('should return 400 when if-match header has a bad format', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('patchmodeltest', { name: 'second' })
        .header('If-Match', '"v:string"')
        .patch('/patchmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });

  it('should return 400 for invalid ids', (done: MochaDone) => {
    test.server.createRequest()
      .payload('patchmodeltest', { name: 'second' })
      .patch('/patchmodeltests/invalid')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });

  it('should return 404 for nonexistent ids', (done: MochaDone) => {
    test.server.createRequest()
      .payload('patchmodeltest', { name: 'second' })
      .patch('/patchmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
      .thenStatusCodeShouldEqual(404)
      .end(done);
  });

  it('should return 404 for nonexistent ids and if-match header is present', (done: MochaDone) => {
    test.server.createRequest()
      .payload('patchmodeltest', { name: 'second' })
      .header('If-Match', '"v:9999"')
      .patch('/patchmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
      .thenStatusCodeShouldEqual(404)
      .end(done);
  });

  it('should return 400 for queries with invalid model keys', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('patchmodeltest', { otherKey: 'strange value' })
        .patch('/patchmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });

  it('should return 400 for queries with unwrapped payload', (done: MochaDone) => {
    let item = new test.model({ name: 'first', value: 'some value' });
    item.save(() => {
      test.server.createRequest()
        .payload('name', 'second')
        .patch('/patchmodeltests/' + item._id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });
});
