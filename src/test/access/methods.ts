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
import Resource from '../../lib/resource';
import * as testServer from '../testServer';

type ITestSetup = testServer.ITestSetup;

function pluginOptionsFor(method: string, testModel: mongoose.Model<mongoose.Document>): any {
  'use strict';

  let options = <IResourceOptions>{ methodAccess: {} };
  options.methodAccess[method] = false;

  let resource = new Resource(testModel, options);
  return { resources: [ resource ] };
}

function serverSetup(access: string, testSetup: ITestSetup): (done: MochaDone) => void {
  'use strict';

  return (done: MochaDone) => {
    let testModel = mongoose.model(access + 'Test', new mongoose.Schema({
      name: String
    }));

    testServer
      .create(pluginOptionsFor(access, testModel))
      .then((server: testServer.Server) => {
        testSetup.server = server;
        testSetup.model = testModel;
        done();
      })
      .catch(done);
  };
}

describe('Deny access to method', () => {
  describe('disabled GET method list', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup('getList', test));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    it('should return 404', (done: MochaDone) => {
      test.server.createRequest()
        .get('/getlisttests')
        .thenStatusCodeShouldEqual(404)
        .end(done);
      });
  });

  describe('disabled GET method item', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup('getItem', test));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    afterEach((done: MochaDone) => {
      test.model.remove({}, done);
    });

    it('should return 404', (done: MochaDone) => {
      let item = new test.model({ name: 'first' });

      item.save(() => {
        test.server.createRequest()
          .get('/getitemtests/' + item._id)
          .thenStatusCodeShouldEqual(404)
          .end(done);
      });
    });

    it('should return 404 on missing id', (done: MochaDone) => {
      let item = new test.model({ name: 'first' });

      item.save(() => {
        test.server.createRequest()
          .get('/getitemtests/')
          .thenStatusCodeShouldEqual(404)
          .end(done);
      });
    });
  });

  describe('POST method', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup('post', test));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    it('should return 404 if POST method is disabled', (done: MochaDone) => {
      test.server.createRequest()
        .post('/posttests')
        .thenStatusCodeShouldEqual(404)
        .end(done);
    });
  });

  describe('PUT method', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup('put', test));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    afterEach((done: MochaDone) => {
      test.model.remove({}, done);
    });

    it('should return 404 if PUT method is disabled', (done: MochaDone) => {
       test.server.createRequest()
        .put('/puttests')
        .thenStatusCodeShouldEqual(404)
        .end(done);
    });

    it('should return 404 on missing id', (done: MochaDone) => {
      let item = new test.model({ name: 'first' });

      item.save(() => {
        test.server.createRequest()
          .put('/puttests/')
          .thenStatusCodeShouldEqual(404)
          .end(done);
      });
    });
  });

  describe('PATCH method', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup('patch', test));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    afterEach((done: MochaDone) => {
      test.model.remove({}, done);
    });

    it('should return 404 if PATCH method is disabled', (done: MochaDone) => {
      test.server.createRequest()
        .patch('/patchtests')
        .thenStatusCodeShouldEqual(404)
        .end(done);
    });

    it('should return 404 on missing id', (done: MochaDone) => {
      let item = new test.model({ name: 'first' });

      item.save(() => {
        test.server.createRequest()
          .patch('/patchtests/')
          .thenStatusCodeShouldEqual(404)
          .end(done);
      });
    });
  });

  describe('DELETE method', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup('delete', test));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    afterEach((done: MochaDone) => {
      test.model.remove({}, done);
    });

    it('should return 404 if DELETE method is disabled', (done: MochaDone) => {
      test.server.createRequest()
        .delete('/deletetests')
        .thenStatusCodeShouldEqual(404)
        .end(done);
    });

    it('should return 404 on missing id', (done: MochaDone) => {
      let item = new test.model({ name: 'first' });

      item.save(() => {
        test.server.createRequest()
          .delete('/deletetests/')
          .thenStatusCodeShouldEqual(404)
          .end(done);
      });
    });
  });
});
