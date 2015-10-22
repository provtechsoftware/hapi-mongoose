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

describe('GET sorting', () => {
  var server: testServer.Server;

  describe('unaliased fields', () => {
    var testModel;

    before((done: MochaDone) => {
      testModel = mongoose.model('testModelSorting', new mongoose.Schema({
        name: String,
        index: Number
      }));

      testServer
        .create({ resources: [testModel] })
        .then((createdServer: testServer.Server) => {
          server = createdServer;

          async.each(
            _.range(3),
            (i: number, callback: Function) => {
              let item = new testModel({ name: 'item' + i, index: i });
              item.save(() => {
                callback();
              });
            },
            () => {
              async.each(
                _.range(3),
                (i: number, callback: Function) => {
                  let item = new testModel({ name: 'item' + (5 - i), index: (5 - i) });
                  item.save(() => {
                    callback();
                  });
                },
                done);
            });
        })
        .catch(done);
    });

    after((done: MochaDone) => {
      server.stop(() => {
        testModel.remove({}, done);
      });
    });

    it('should return sorted elements (ASC)', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodelsortings?sort=index')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          let oldValue = -1;

          _.each(_.pluck(result.testmodelsortings, 'index'), (value: number) => {
            value.should.be.above(oldValue);
            oldValue = value;
          });
          done();
        })
        .end(done);
    });

    it('should return sorted elements (DESC)', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodelsortings?sort=-index')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          let oldValue = 10;

          _.each(_.pluck(result.testmodelsortings, 'index'), (value: number) => {
            value.should.be.below(oldValue);
            oldValue = value;
          });
          done();
        })
        .end(done);
    });

    it('should return 400 on invalid sort field', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodelsortings?sort=invalid')
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });

  describe('aliased fields', () => {
    var testModel;

    before((done: MochaDone) => {
      testModel = mongoose.model('testModelAliasSorting', new mongoose.Schema({
        name: String,
        index: Number
      }));

      var resourceModel = new Resource(testModel, { alias: { index: 'aliasedIndex' } });

      testServer
        .create({ resources: [ resourceModel ] })
        .then((createdServer: testServer.Server) => {
          server = createdServer;

          async.each(
            _.range(3),
            (i: number, callback: Function) => {
              let item = new testModel({ name: 'item' + i, index: i });
              item.save(() => {
                callback();
              });
            },
            () => {
              async.each(
                _.range(3),
                (i: number, callback: Function) => {
                  let item = new testModel({ name: 'item' + (5 - i), index: (5 - i) });
                  item.save(() => {
                    callback();
                  });
                },
                done);
            });
        })
        .catch(done);
    });

    after((done: MochaDone) => {
      server.stop(() => {
        testModel.remove({}, done);
      });
    });

    it('should return sorted elements (ASC)', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodelaliassortings?sort=aliasedIndex')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          let oldValue = -1;

          _.each(_.pluck(result.testmodelaliassortings, 'aliasedIndex'), (value: number) => {
            value.should.be.above(oldValue);
            oldValue = value;
          });
          done();
        })
        .end(done);
    });

    it('should return sorted elements (DESC)', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodelaliassortings?sort=-aliasedIndex')
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          let oldValue = 10;

          _.each(_.pluck(result.testmodelaliassortings, 'aliasedIndex'), (value: number) => {
            value.should.be.below(oldValue);
            oldValue = value;
          });
          done();
        })
        .end(done);
    });

    it('should return 400 on invalid sort field', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodelaliassortings?sort=index')
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });
});
