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

function serverSetup(testSetup: ITestSetup, name: string, exposed?: HashMapBoolean): (done: MochaDone) => void {
  'use strict';

  return (done: MochaDone) => {
    let testModel = mongoose.model(name, new mongoose.Schema({
      name: String,
      value: String,
      flag: Boolean
    }));

    let options: IResourceOptions;

    if (exposed) {
      options = { exposed: exposed };
    }

    testServer
      .create({
        resources: [new Resource(testModel, options)]
      })
      .then((server: testServer.Server) => {
        testSetup.server = server;
        testSetup.model = testModel;
        done();
      })
      .catch(done);
  };
};

describe('Exposed fields', () => {
  let testModel: mongoose.Model<mongoose.Document>;

  before((done: MochaDone) => {
    testModel = mongoose.model('exposedFields', new mongoose.Schema({
      name: String,
      value: String,
      composed: {
        field1: String,
        field2: String
      }
    }));

    done();
  });

  it('should be true by default', () => {
    let resource = new Resource(testModel);

    resource.options.exposed.should.have.properties(
      'name',
      'value',
      'composed.field1',
      'composed.field2',
      '_id',
      '__v');

    resource.options.exposed['name'].should.equal(true);
    resource.options.exposed['value'].should.equal(true);
    resource.options.exposed['composed.field1'].should.equal(true);
    resource.options.exposed['composed.field2'].should.equal(true);
    resource.options.exposed['_id'].should.equal(true);
    resource.options.exposed['__v'].should.equal(true);
  });

  it('should consider any additional field names as unexposed', () => {
    let resource = new Resource(testModel);
    resource.isExposed('name').should.equal(true);
    resource.isExposed('name2').should.equal(false);
  });

  describe('unspecified fields', () => {
    it('should be set false when there is an expose:true', () => {
      let resource = new Resource(testModel, {
        exposed: {
          name: true
        }
      });

      resource.options.exposed.should.have.properties(
        'name',
        'value',
        'composed.field1',
        'composed.field2',
        '_id',
        '__v');

      resource.options.exposed['name'].should.equal(true);
      resource.options.exposed['value'].should.equal(false);
      resource.options.exposed['composed.field1'].should.equal(false);
      resource.options.exposed['composed.field2'].should.equal(false);
      resource.options.exposed['_id'].should.equal(false);
      resource.options.exposed['__v'].should.equal(false);
    });

    it('should be set true when there is an expose:false', () => {
      let resource = new Resource(testModel, {
        exposed: {
          name: false
        }
      });

      resource.options.exposed.should.have.properties(
        'name',
        'value',
        'composed.field1',
        'composed.field2',
        '_id',
        '__v');

      resource.options.exposed['name'].should.equal(false);
      resource.options.exposed['value'].should.equal(true);
      resource.options.exposed['composed.field1'].should.equal(true);
      resource.options.exposed['composed.field2'].should.equal(true);
      resource.options.exposed['_id'].should.equal(true);
      resource.options.exposed['__v'].should.equal(true);
    });
  });
});

describe('Field projection', () => {
  let testModel: mongoose.Model<mongoose.Document>;

  before((done: MochaDone) => {
    testModel = mongoose.model('fieldProjection', new mongoose.Schema({
      name: String,
      value: String,
      composed: {
        field1: String,
        field2: String
      }
    }));

    done();
  });

  it('should contain only exposed:true', () => {
    let resource = new Resource(testModel, {
      exposed: {
        name: true
      }
    });

    resource.options.fieldProjection.should.have.properties('name');
    resource.options.exposed['name'].should.equal(true);
  });
});

describe('Exposing fields', () => {
  var test: ITestSetup = <ITestSetup>{};
  before(serverSetup(test, 'exposeTest', { 'value': false }));

  after((done: MochaDone) => {
    test.server.stop(() => {
      test.model.remove({}, done);
    });
  });

  it('should expose specified fields for get lists', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value', flag: true });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .get('/exposetests')
        .then((res: any) => {
          let result = JSON.parse(res.result);
          result['exposetests'][0].should.have.keys('id', 'name', 'flag');
          done();
        })
        .end(done);
    });
  });

  it('should expose specified fields for get by id', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value', flag: true });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .get('/exposetests/' + id)
        .then((res: any, done: MochaDone) => {
          let result = JSON.parse(res.result);
          result['exposetest'].should.have.keys('id', 'name', 'flag');
          done();
        })
        .end(done);
    });
  });

  it('should return 400 when trying to POST a record with unexposed fields', (done: MochaDone) => {
    test.server.createRequest()
      .payload('exposetest', { name: 'new name', value: 'new value' })
      .post('/exposetests')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });

  it('should return 400 when trying to PUT a record with unexposed fields', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value' });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .payload('exposetest', { name: 'new name', value: 'new value' })
        .put('/exposetests/' + id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });

  it('should return 400 when trying to PATCH a record with unexposed fields', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value' });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .payload('exposetest', { name: 'new name', value: 'new value' })
        .patch('/exposetests/' + id)
        .thenStatusCodeShouldEqual(400)
        .end(done);
    });
  });

  it('should set exposed missing payload fields to null on PUT', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value', flag: true });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .payload('exposetest', { name: 'new name' })
        .put('/exposetests/' + id)
        .then((res: any) => {
          test.model.findById(id, (err: any, record: any) => {
            record.name.should.equal('new name');
            record.value.should.equal('some value');
            should(record.flag).equal(null);
            done();
          });
        })
        .end(done);
    });
  });

  it('should keep false values for exposed fields when trying to PUT',  (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value', flag: true });

    item.save(() => {
      let id = item._id.toString();
      test.server.createRequest()
        .payload('exposetest', { name: 'new name', flag: false })
        .put('/exposetests/' + id)
        .then((res: any) => {
          test.model.findById(id, (err: any, record: any) => {
            record.name.should.equal('new name');
            record.value.should.equal('some value');
            record.flag.should.equal(false);
            done();
          });
        })
        .end(done);
    });
  });

  it('should not set unexposed values to null when trying to PUT', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value' });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .payload('exposetest', { name: 'new name' })
        .put('/exposetests/' + id)
        .then((res: any) => {
          test.model.findById(id, (err: any, record: any) => {
            record.value.should.equal('some value');
            done();
          });
        })
        .end(done);
    });
  });

  it('should not return unexposed fields on POST', (done: MochaDone) => {
    test.server.createRequest()
      .payload('exposetest', { name: 'new name', flag: true})
      .post('/exposetests')
      .then((res: any, done: MochaDone) => {
        var result = JSON.parse(res.result);
        result.exposetest.should.have.keys('id', 'name', 'flag');
        done();
      })
      .end(done);
  });


  it('should not return unexposed fields on PUT', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value', flag: true });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .payload('exposetest', { name: 'new name' })
        .put('/exposetests/' + id)
        .then((res: any, done: MochaDone) => {
          var result = JSON.parse(res.result);
          result.exposetest.should.have.keys('id', 'name', 'flag');
          done();
        })
        .end(done);
    });
  });

  it('should not return unexposed fields on PATCH', (done: MochaDone) => {
    let item = new test.model({ name: 'some name', value: 'some value', flag: true });

    item.save(() => {
      let id = item._id.toString();

      test.server.createRequest()
        .payload('exposetest', { name: 'new name' })
        .patch('/exposetests/' + id)
        .then((res: any, done: MochaDone) => {
          var result = JSON.parse(res.result);
          result.exposetest.should.have.keys('id', 'name', 'flag');
          done();
        })
        .end(done);
    });
  });
});
