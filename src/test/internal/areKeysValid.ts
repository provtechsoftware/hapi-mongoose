/// ts:ref=mocha
/// <reference path="../../../typings/mocha/mocha.d.ts"/> ///ts:ref:generated
/// ts:ref=should
/// <reference path="../../../typings/should/should.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/* tslint:disable:no-unused-variable */

import * as should from 'should';
import * as mongoose from 'mongoose';
import Resource from '../../lib/resource';

describe('Resource areKeysValid', () => {
  let testModel: mongoose.Model<mongoose.Document>;
  let testResource: Resource;

  before((done: MochaDone) => {
    testModel = mongoose.model('modelValidationTest', new mongoose.Schema({
      title: String,
      data: {
        level1: {
          key: String
        }
      }
    }));
    testResource = new Resource(testModel, { name: 'item' });

    done();
  });

  it('should find object keys valid', () => {
    testResource.areKeysValid(['title', 'data']).should.equal(true);
  });
});
