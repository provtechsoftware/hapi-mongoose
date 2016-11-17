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

describe('GET ranging', () => {
  var server: testServer.Server;
  var now: Date;
  const MSECS_PER_DAY = 24 * 3600 * 1000;

  describe('date field', () => {
    var testModel;

    before((done: MochaDone) => {
      testModel = mongoose.model('testModelRanging', new mongoose.Schema({
        name: String,
        date: Date,
        badfieldname: Date
      }));

      testServer
        .create({ resources: [testModel] })
        .then((createdServer: testServer.Server) => {
          server = createdServer;
          now = new Date();

          async.each(
            _.range(5),
            (i: number, callback: Function) => {
              let item = new testModel({ name: 'item' + i,
                                         date: new Date((i * MSECS_PER_DAY) + now.getTime()),
                                         badfieldname: new Date((i * MSECS_PER_DAY) + now.getTime()) });
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

    it('should return the third and the forth element', (done: MochaDone) => {
      let startingFrom = new Date((3 * MSECS_PER_DAY) + now.getTime());
      startingFrom.setUTCHours(0);
      startingFrom.setMinutes(0);
      startingFrom.setSeconds(0);
      startingFrom.setMilliseconds(0);
      let endingTo = new Date((4 * MSECS_PER_DAY) + now.getTime());
      server.createRequest()
        .get('/testmodelranging?range[date__gt]=' + startingFrom.toISOString() + '&range[date__lt]=' + endingTo.toISOString())
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result).testmodelranging;
          let third, forth;

          result.should.to.have.lengthOf(2);
          third = result[0];
          forth = result[1];

          third.should.to.have.property(name, 'item2');
          forth.should.to.have.property(name, 'item3');
          done();
        })
        .end(done);
    });

    it('should return 400 on invalid range date field', (done: MochaDone) => {
      server.createRequest()
        .get('/testmodelranging?range[badfieldname__gte]=' + now.toISOString())
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });

  });
});
