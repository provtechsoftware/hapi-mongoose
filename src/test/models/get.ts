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
import Resource from '../../lib/resource';

describe('Getting records', () => {

  describe('api calls binded to hapi root', () => {
    var server: testServer.Server;
    var testModel;

    before((done: MochaDone) => {
      testModel = mongoose.model('testModel', new mongoose.Schema({
        name: String
      }));

      testServer
        .create({ resources: [testModel] })
        .then((createdServer: testServer.Server) => {
          server = createdServer;
          done();
        })
        .catch(done);
    });

    after((done: MochaDone) => {
      server.stop(done);
    });

    it('should return 200 for binded models', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodels')
        .thenStatusCodeShouldEqual(200)
        .end(done);
    });
  });

  describe('api calls binded to custom path', () => {
    var server: testServer.Server;
    var testModel;

    before((done: MochaDone) => {
      testModel = mongoose.model('testPathModel', new mongoose.Schema({
        name: String
      }));

      testServer
        .create({ resources: [testModel], path: '/api' })
        .then((createdServer: testServer.Server) => {
          server = createdServer;
          done();
        })
        .catch(done);
    });

    after((done: MochaDone) => {
      server.stop(() => {
        testModel.remove({}, done);
      });
    });

    it('should return 200 for binded models', (done: MochaDone) => {
      server.createRequest()
        .get('/api/testpathmodels')
        .thenStatusCodeShouldEqual(200)
        .thenContentTypeShouldBe('application/json; charset=utf-8')
        .end(done);
    });

    it('requested list should be wrapped in an object with the plural model name', (done: MochaDone) => {
      server.createRequest()
        .get('/api/testpathmodels')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          result.should.be.Object();
          result.should.have.keys('testpathmodels', 'meta');
          done();
        })
        .end(done);
    });

    describe('on populated models', () => {
      let idList: string[] = [];

      before((done: MochaDone) => {
        async.each(
          _.range(3),
          (i: number, callback: Function) => {
            let item = new testModel({ name: 'item' + i });
            item.save(() => {
              idList.push(item._id.toString());
              callback();
            });
          },
          done);
      });

      after((done: MochaDone) => {
        testModel.remove({}, done);
      });

      it('should be able to retrieve all elements', (done: MochaDone) => {
        server.createRequest()
          .get('/api/testpathmodels')
          .then((res: any, done: MochaDone) => {
            let result = JSON.parse(res.result);
            result['testpathmodels'].length.should.equal(3);
            done();
          })
          .end(done);
      });

      it('should be able to retrieve elements by id list', (done: MochaDone) => {
        server.createRequest()
          .get('/api/testpathmodels?ids[]=' + idList[0] + '&ids[]=' + idList[1])
          .then((res: any, done: MochaDone) => {
            let result = JSON.parse(res.result);
            result['testpathmodels'].length.should.equal(2);
            done();
          })
          .end(done);
      });

      it('elements should be wrapped in an object with the model name', (done: MochaDone) => {
        testModel.findOne({ name: 'item0' }, (err: any, record: any) => {
          let id = record.get('id');
          server.createRequest()
            .get('/api/testpathmodels/' + id)
            .then((res: any, done: MochaDone) => {
              let result = JSON.parse(res.result);
              result.should.be.Object();
              result.should.have.keys('testpathmodel');
              done();
            })
            .end(done);
        });
      });

      it('should be able to retrieve elements by id', (done: MochaDone) => {
        testModel.findOne({ name: 'item0' }, (err: any, record: any) => {
          let id = record.get('id');
          server.createRequest()
            .get('/api/testpathmodels/' + id)
            .thenContentTypeShouldBe('application/json; charset=utf-8')
            .then((res: any, done: MochaDone) => {
              let result = JSON.parse(res.result);
              result['testpathmodel'].name.should.equal('item0');
              done();
            })
            .end(done);
        });
      });

      it('should return 400 for an invalid id', (done: MochaDone) => {
        server.createRequest()
          .get('/api/testpathmodels/__invalid')
          .thenStatusCodeShouldEqual(400)
          .end(done);
      });

      it('should return 404 for nonexistent ids', (done: MochaDone) => {
        server.createRequest()
          .get('/api/testpathmodels/aaaaaaaaaaaaaaaaaaaaaaaa')
          .thenStatusCodeShouldEqual(404)
          .end(done);
      });
    });
  });

  describe('custom name', () => {
    var server: testServer.Server;
    var testModel;
    var customName = 'car';

    before((done: MochaDone) => {
      testModel = mongoose.model('testModelNames', new mongoose.Schema({
        name: String
      }));

      testServer
        .create({ resources: [new Resource(testModel, { name: customName })] })
        .then((createdServer: testServer.Server) => {
          server = createdServer;
          done();
        })
        .catch(done);
    });

    after((done: MochaDone) => {
      server.stop(done);
    });

    afterEach((done: MochaDone) => {
      testModel.remove({}, done);
    });

    it('should add an `s` after the custom name', (done: MochaDone) => {
      server.createRequest()
        .get('/cars')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          result.should.have.keys('cars', 'meta');
          done();
        })
        .end(done);
    });

    it('should return the custom name for items', (done: MochaDone) => {
      let item = new testModel({ name: 'car name' });

      item.save(() => {
        let id = item.get('id');

        server.createRequest()
          .get('/cars/' + id)
          .then((res: any, done: MochaDone) => {
            let result = JSON.parse(res.result);
            result.should.have.keys('car');
            done();
          })
          .end(done);
      });
    });
  });

  describe('custom plural and singular names', () => {
    var server: testServer.Server;
    var testModel;
    var singularName = 'person';
    var pluralName = 'people';

    before((done: MochaDone) => {
      testModel = mongoose.model('testModelExpandedNames', new mongoose.Schema({
        name: String
      }));

      testServer
        .create({ resources: [new Resource(testModel, { name: { singular: singularName, plural: pluralName } })] })
        .then((createdServer: testServer.Server) => {
          server = createdServer;
          done();
        })
        .catch(done);
    });

    after((done: MochaDone) => {
      server.stop(done);
    });

    afterEach((done: MochaDone) => {
      testModel.remove({}, done);
    });

    it('should return the plural name for lists', (done: MochaDone) => {
      server.createRequest()
        .get('/people')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          result.should.have.keys('people', 'meta');
          done();
        })
        .end(done);
    });

    it('should return the singular name for items', (done: MochaDone) => {
      let item = new testModel({ name: 'John Doe' });

      item.save(() => {
        let id = item.get('id');

        server.createRequest()
          .get('/people/' + id)
          .then((res: any, done: MochaDone) => {
            let result = JSON.parse(res.result);
            result.should.have.keys('person');
            done();
          })
          .end(done);
      });
    });
  });

  describe('custom uppercase plural and singular names', () => {
    var server: testServer.Server;
    var testModel;
    var singularName = 'PERSON';
    var pluralName = 'PEOPLE';

    before((done: MochaDone) => {
      testModel = mongoose.model('testModelUpExpandedNames', new mongoose.Schema({
        name: String
      }));

      testServer
        .create({ resources: [new Resource(testModel, { name: { singular: singularName, plural: pluralName } })] })
        .then((createdServer: testServer.Server) => {
          server = createdServer;
          done();
        })
        .catch(done);
    });

    after((done: MochaDone) => {
      server.stop(done);
    });

    afterEach((done: MochaDone) => {
      testModel.remove({}, done);
    });

    it('should return the plural name for lists', (done: MochaDone) => {
      server.createRequest()
        .get('/people')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          result.should.have.keys('people', 'meta');
          done();
        })
        .end(done);
    });

    it('should return the singular name for items', (done: MochaDone) => {
      let item = new testModel({ name: 'John Doe' });

      item.save(() => {
        let id = item.get('id');

        server.createRequest()
          .get('/people/' + id)
          .then((res: any, done: MochaDone) => {
            let result = JSON.parse(res.result);
            result.should.have.keys('person');
            done();
          })
          .end(done);
      });
    });
  });
});
