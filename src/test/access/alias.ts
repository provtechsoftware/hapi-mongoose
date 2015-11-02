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

function serverSetup(testSetup: ITestSetup, name: string, alias?: HashMapString): (done: MochaDone) => void {
  'use strict';

  return (done: MochaDone) => {
    let testModel = mongoose.model(name, new mongoose.Schema({
      name: String
    }));

    let options: IResourceOptions;

    if (alias) {
      options = { alias: alias };
    }

    testServer
      .create({
        resources: [ new Resource(testModel, options) ]
      })
      .then((server: testServer.Server) => {
        testSetup.server = server;
        testSetup.model = testModel;
        done();
      })
      .catch(done);
  };
};

describe('Alias', () => {

  describe('default fields', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup(test, 'aliasIdTest'));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    afterEach((done: MochaDone) => {
      test.model.remove({}, done);
    });

    it('should alias _id to id by default', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();

        test.server.createRequest()
          .get('/aliasidtests/' + id)
          .then((res: any) => {
            let result = JSON.parse(res.result);
            result['aliasidtest'].should.have.keys('id', 'name');
            result.aliasidtest.id.should.equal(id);
            done();
          })
          .end(done);
      });
    });
  });

  describe('fields', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup(test, 'aliasTest', {name: 'title'}));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    afterEach((done: MochaDone) => {
      test.model.remove({}, done);
    });

    it('should be aliased in the response', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();

        test.server.createRequest()
          .get('/aliastests/' + id)
          .then((res: any) => {
            let result = JSON.parse(res.result);
            result['aliastest'].should.have.keys('id', 'title');
            result.aliastest.title.should.equal('some name');
            done();
          })
          .end(done);
      });
    });

    it('should create the right item when trying to POST', (done: MochaDone) => {
      test.server.createRequest()
        .payload('aliastest', { title: 'some title' })
        .post('/aliastests')
        .thenStatusCodeShouldEqual(201)
        .then((res: any) => {
          test.model.find({ name: 'some title' }, (err: any, res: any) => {
            res.length.should.equal(1);
            done();
          });
        })
        .end(done);
    });

    it('should update the right keys when trying to PUT', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();

        test.server.createRequest()
          .payload('id', id)
          .payload('aliastest', { title: 'some title' })
          .put('/aliastests/' + id)
          .thenStatusCodeShouldEqual(200)
          .then((res: any) => {
            test.model.findById(id, (err: any, res: any) => {
              res.name.should.equal('some title');
              done();
            });
          })
          .end(done);
      });
    });

    it('should update the right keys when trying to PATCH', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();

        test.server.createRequest()
          .payload('aliastest', { title: 'some title' })
          .patch('/aliastests/' + id)
          .thenStatusCodeShouldEqual(200)
          .then((res: any) => {
            test.model.findById(id, (err: any, res: any) => {
              res.name.should.equal('some title');
              done();
            });
          })
          .end(done);
      });
    });

    it('should return 400 when trying to POST an aliased key with original name', (done: MochaDone) => {
      test.server.createRequest()
        .payload('aliastest', { name: 'a new name' })
        .post('/aliastests')
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });

    it('should return 400 when trying to PUT an aliased key with original name', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();
        test.server.createRequest()
          .payload('name', 'a new name')
          .put('/aliastests/' + id)
          .thenStatusCodeShouldEqual(400)
          .end(done);
      });
    });

    it('should return 400 when trying to PATCH an aliased key with original name', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();
        test.server.createRequest()
          .payload('name', 'a new name')
          .patch('/aliastests/' + id)
          .thenStatusCodeShouldEqual(400)
          .end(done);
      });
    });
  });

  describe('fields aliased with `_`', () => {
    var test: ITestSetup = <ITestSetup>{};
    before(serverSetup(test, 'aliasUnderscoreTest', {name: '_name'}));

    after((done: MochaDone) => {
      test.server.stop(done);
    });

    afterEach((done: MochaDone) => {
      test.model.remove({}, done);
    });

    it('should not be visible in response', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();

        test.server.createRequest()
          .get('/aliasunderscoretests/' + id)
          .then((res: any) => {
            let result = JSON.parse(res.result);
            result['aliasunderscoretest'].should.have.keys('id');
            done();
          })
          .end(done);
      });
    });

    it('should return 400 when trying to POST', (done: MochaDone) => {
      test.server.createRequest()
        .payload('aliasunderscoretest', { _name: 'a new name' })
        .post('/aliasunderscoretests')
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });

    it('should return 400 when trying to PUT', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();
        test.server.createRequest()
          .payload('_name', 'a new name')
          .put('/aliasunderscoretests/' + id)
          .thenStatusCodeShouldEqual(400)
          .end(done);
      });
    });

    it('should return 400 when trying to PATCH', (done: MochaDone) => {
      let item = new test.model({ name: 'some name' });

      item.save(() => {
        let id = item._id.toString();
        test.server.createRequest()
          .payload('_name', 'a new name')
          .patch('/aliasunderscoretests/' + id)
          .thenStatusCodeShouldEqual(400)
          .end(done);
      });
    });
  });
});
