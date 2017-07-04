"use strict";
var should = require('should');
var mongoose = require('mongoose');
var resource_1 = require('../../lib/resource');
var testServer = require('../testServer');
function serverSetup(testSetup, name, exposed) {
    'use strict';
    return function (done) {
        var testModel = mongoose.model(name, new mongoose.Schema({
            name: String,
            value: String,
            flag: Boolean
        }));
        var options;
        if (exposed) {
            options = { exposed: exposed };
        }
        testServer
            .create({
            resources: [new resource_1.default(testModel, options)]
        })
            .then(function (server) {
            testSetup.server = server;
            testSetup.model = testModel;
            done();
        })
            .catch(done);
    };
}
;
describe('Exposed fields', function () {
    var testModel;
    before(function (done) {
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
    it('should be true by default', function () {
        var resource = new resource_1.default(testModel);
        resource.options.exposed.should.have.properties('name', 'value', 'composed.field1', 'composed.field2', '_id', '__v');
        resource.options.exposed['name'].should.equal(true);
        resource.options.exposed['value'].should.equal(true);
        resource.options.exposed['composed.field1'].should.equal(true);
        resource.options.exposed['composed.field2'].should.equal(true);
        resource.options.exposed['_id'].should.equal(true);
        resource.options.exposed['__v'].should.equal(true);
    });
    it('should consider any additional field names as unexposed', function () {
        var resource = new resource_1.default(testModel);
        resource.isExposed('name').should.equal(true);
        resource.isExposed('name2').should.equal(false);
    });
    describe('unspecified fields', function () {
        it('should be set false when there is an expose:true', function () {
            var resource = new resource_1.default(testModel, {
                exposed: {
                    name: true
                }
            });
            resource.options.exposed.should.have.properties('name', 'value', 'composed.field1', 'composed.field2', '_id', '__v');
            resource.options.exposed['name'].should.equal(true);
            resource.options.exposed['value'].should.equal(false);
            resource.options.exposed['composed.field1'].should.equal(false);
            resource.options.exposed['composed.field2'].should.equal(false);
            resource.options.exposed['_id'].should.equal(false);
            resource.options.exposed['__v'].should.equal(false);
        });
        it('should be set true when there is an expose:false', function () {
            var resource = new resource_1.default(testModel, {
                exposed: {
                    name: false
                }
            });
            resource.options.exposed.should.have.properties('name', 'value', 'composed.field1', 'composed.field2', '_id', '__v');
            resource.options.exposed['name'].should.equal(false);
            resource.options.exposed['value'].should.equal(true);
            resource.options.exposed['composed.field1'].should.equal(true);
            resource.options.exposed['composed.field2'].should.equal(true);
            resource.options.exposed['_id'].should.equal(true);
            resource.options.exposed['__v'].should.equal(true);
        });
    });
});
describe('Field projection', function () {
    var testModel;
    before(function (done) {
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
    it('should contain only exposed:true', function () {
        var resource = new resource_1.default(testModel, {
            exposed: {
                name: true
            }
        });
        resource.options.fieldProjection.should.have.properties('name');
        resource.options.exposed['name'].should.equal(true);
    });
});
describe('Exposing fields', function () {
    var test = {};
    before(serverSetup(test, 'exposeTest', { 'value': false }));
    after(function (done) {
        test.server.stop(function () {
            test.model.remove({}, done);
        });
    });
    it('should expose specified fields for get lists', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value', flag: true });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .get('/exposetests')
                .then(function (res) {
                var result = JSON.parse(res.result);
                result['exposetests'][0].should.have.keys('id', 'name', 'flag');
                done();
            })
                .end(done);
        });
    });
    it('should expose specified fields for get by id', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value', flag: true });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .get('/exposetests/' + id)
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result['exposetest'].should.have.keys('id', 'name', 'flag');
                done();
            })
                .end(done);
        });
    });
    it('should return 400 when trying to POST a record with unexposed fields', function (done) {
        test.server.createRequest()
            .payload('exposetest', { name: 'new name', value: 'new value' })
            .post('/exposetests')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
    it('should return 400 when trying to PUT a record with unexposed fields', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value' });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .payload('exposetest', { name: 'new name', value: 'new value' })
                .put('/exposetests/' + id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
    it('should return 400 when trying to PATCH a record with unexposed fields', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value' });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .payload('exposetest', { name: 'new name', value: 'new value' })
                .patch('/exposetests/' + id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
    it('should set exposed missing payload fields to null on PUT', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value', flag: true });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .payload('exposetest', { name: 'new name' })
                .put('/exposetests/' + id)
                .then(function (res) {
                test.model.findById(id, function (err, record) {
                    record.name.should.equal('new name');
                    record.value.should.equal('some value');
                    should(record.flag).equal(null);
                    done();
                });
            })
                .end(done);
        });
    });
    it('should keep false values for exposed fields when trying to PUT', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value', flag: true });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .payload('exposetest', { name: 'new name', flag: false })
                .put('/exposetests/' + id)
                .then(function (res) {
                test.model.findById(id, function (err, record) {
                    record.name.should.equal('new name');
                    record.value.should.equal('some value');
                    record.flag.should.equal(false);
                    done();
                });
            })
                .end(done);
        });
    });
    it('should not set unexposed values to null when trying to PUT', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value' });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .payload('exposetest', { name: 'new name' })
                .put('/exposetests/' + id)
                .then(function (res) {
                test.model.findById(id, function (err, record) {
                    record.value.should.equal('some value');
                    done();
                });
            })
                .end(done);
        });
    });
    it('should not return unexposed fields on POST', function (done) {
        test.server.createRequest()
            .payload('exposetest', { name: 'new name', flag: true })
            .post('/exposetests')
            .then(function (res, done) {
            var result = JSON.parse(res.result);
            result.exposetest.should.have.keys('id', 'name', 'flag');
            done();
        })
            .end(done);
    });
    it('should not return unexposed fields on PUT', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value', flag: true });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .payload('exposetest', { name: 'new name' })
                .put('/exposetests/' + id)
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.exposetest.should.have.keys('id', 'name', 'flag');
                done();
            })
                .end(done);
        });
    });
    it('should not return unexposed fields on PATCH', function (done) {
        var item = new test.model({ name: 'some name', value: 'some value', flag: true });
        item.save(function () {
            var id = item._id.toString();
            test.server.createRequest()
                .payload('exposetest', { name: 'new name' })
                .patch('/exposetests/' + id)
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.exposetest.should.have.keys('id', 'name', 'flag');
                done();
            })
                .end(done);
        });
    });
});
//# sourceMappingURL=exposed.js.map