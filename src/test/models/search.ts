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
import * as _ from 'lodash';
import * as async from 'async';
import * as testServer from '../testServer';
import Resource from '../../lib/resource';

describe('Searching records', () => {
  var server: testServer.Server;
  var testModel;

  before((done: MochaDone) => {
    let schema = new mongoose.Schema({
      name: { type: String }
    });
    schema.index({ name: 'text' });
    testModel = mongoose.model('testSearchModel', schema);

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

  describe('in models', () => {
    before((done: MochaDone) => {
      let item = new testModel({ name: 'item1' });
      item.save(() => {
        let item = new testModel({ name: 'other item' });
        item.save(done);
      });
    });

    after((done: MochaDone) => {
      testModel.remove({}, done);
    });

    it('should return one item', (done: MochaDone) => {
      server.createRequest()
        .get('/testsearchmodels?search=item1')
        .then((res: any, done: MochaDone) => {
          console.log(res);
          let result = JSON.parse(res.result);
          result.testsearchmodels.length.should.equal(1);
          result.meta.page.total.should.equal(1);
          result.testsearchmodels[0].name.should.equal('item1');
          done();
        })
        .end(done);
    });

    it('should return all items', (done: MochaDone) => {
      server.createRequest()
        .get('/testsearchmodels?search=item')
        .then((res: any, done: MochaDone) => {
          console.log(res);
          let result = JSON.parse(res.result);
          result.testsearchmodels.length.should.equal(1);
          result.testsearchmodels[0].name.should.equal('other item');
          done();
        })
        .end(done);
    });
  });
});
