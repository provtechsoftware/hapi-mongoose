"use strict";
var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');
var testServer = require('../testServer');
var resource_1 = require('../../lib/resource');
describe('Getting records', function () {
    describe('api calls binded to hapi root', function () {
        var server;
        var testModel;
        before(function (done) {
            testModel = mongoose.model('testModel', new mongoose.Schema({
                name: String
            }));
            testServer
                .create({ resources: [testModel] })
                .then(function (createdServer) {
                server = createdServer;
                done();
            })
                .catch(done);
        });
        after(function (done) {
            server.stop(done);
        });
        it('should return 200 for binded models', function (done) {
            server.createRequest()
                .get('/testmodels')
                .thenStatusCodeShouldEqual(200)
                .end(done);
        });
    });
    describe('api calls binded to custom path', function () {
        var server;
        var testModel;
        before(function (done) {
            testModel = mongoose.model('testPathModel', new mongoose.Schema({
                name: String
            }));
            testServer
                .create({ resources: [testModel], path: '/api' })
                .then(function (createdServer) {
                server = createdServer;
                done();
            })
                .catch(done);
        });
        after(function (done) {
            server.stop(function () {
                testModel.remove({}, done);
            });
        });
        it('should return 200 for binded models', function (done) {
            server.createRequest()
                .get('/api/testpathmodels')
                .thenStatusCodeShouldEqual(200)
                .thenContentTypeShouldBe('application/json; charset=utf-8')
                .end(done);
        });
        it('requested list should be wrapped in an object with the plural model name', function (done) {
            server.createRequest()
                .get('/api/testpathmodels')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.should.be.Object();
                result.should.have.keys('testpathmodels', 'meta');
                done();
            })
                .end(done);
        });
        describe('on populated models', function () {
            var idList = [];
            before(function (done) {
                async.each(_.range(3), function (i, callback) {
                    var item = new testModel({ name: 'item' + i });
                    item.save(function () {
                        idList.push(item._id.toString());
                        callback();
                    });
                }, done);
            });
            after(function (done) {
                testModel.remove({}, done);
            });
            it('should be able to retrieve all elements', function (done) {
                server.createRequest()
                    .get('/api/testpathmodels')
                    .then(function (res, done) {
                    var result = JSON.parse(res.result);
                    result['testpathmodels'].length.should.equal(3);
                    done();
                })
                    .end(done);
            });
            it('should be able to retrieve elements by id list', function (done) {
                server.createRequest()
                    .get('/api/testpathmodels?ids[]=' + idList[0] + '&ids[]=' + idList[1])
                    .then(function (res, done) {
                    var result = JSON.parse(res.result);
                    result['testpathmodels'].length.should.equal(2);
                    done();
                })
                    .end(done);
            });
            it('elements should be wrapped in an object with the model name', function (done) {
                testModel.findOne({ name: 'item0' }, function (err, record) {
                    var id = record.get('id');
                    server.createRequest()
                        .get('/api/testpathmodels/' + id)
                        .then(function (res, done) {
                        var result = JSON.parse(res.result);
                        result.should.be.Object();
                        result.should.have.keys('testpathmodel');
                        done();
                    })
                        .end(done);
                });
            });
            it('should be able to retrieve elements by id', function (done) {
                testModel.findOne({ name: 'item0' }, function (err, record) {
                    var id = record.get('id');
                    server.createRequest()
                        .get('/api/testpathmodels/' + id)
                        .thenContentTypeShouldBe('application/json; charset=utf-8')
                        .then(function (res, done) {
                        var result = JSON.parse(res.result);
                        result['testpathmodel'].name.should.equal('item0');
                        done();
                    })
                        .end(done);
                });
            });
            it('should return 400 for an invalid id', function (done) {
                server.createRequest()
                    .get('/api/testpathmodels/__invalid')
                    .thenStatusCodeShouldEqual(400)
                    .end(done);
            });
            it('should return 404 for nonexistent ids', function (done) {
                server.createRequest()
                    .get('/api/testpathmodels/aaaaaaaaaaaaaaaaaaaaaaaa')
                    .thenStatusCodeShouldEqual(404)
                    .end(done);
            });
        });
    });
    describe('custom name', function () {
        var server;
        var testModel;
        var customName = 'car';
        before(function (done) {
            testModel = mongoose.model('testModelNames', new mongoose.Schema({
                name: String
            }));
            testServer
                .create({ resources: [new resource_1.default(testModel, { name: customName })] })
                .then(function (createdServer) {
                server = createdServer;
                done();
            })
                .catch(done);
        });
        after(function (done) {
            server.stop(done);
        });
        afterEach(function (done) {
            testModel.remove({}, done);
        });
        it('should add an `s` after the custom name', function (done) {
            server.createRequest()
                .get('/cars')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.should.have.keys('cars', 'meta');
                done();
            })
                .end(done);
        });
        it('should return the custom name for items', function (done) {
            var item = new testModel({ name: 'car name' });
            item.save(function () {
                var id = item.get('id');
                server.createRequest()
                    .get('/cars/' + id)
                    .then(function (res, done) {
                    var result = JSON.parse(res.result);
                    result.should.have.keys('car');
                    done();
                })
                    .end(done);
            });
        });
    });
    describe('custom plural and singular names', function () {
        var server;
        var testModel;
        var singularName = 'person';
        var pluralName = 'people';
        before(function (done) {
            testModel = mongoose.model('testModelExpandedNames', new mongoose.Schema({
                name: String
            }));
            testServer
                .create({ resources: [new resource_1.default(testModel, { name: { singular: singularName, plural: pluralName } })] })
                .then(function (createdServer) {
                server = createdServer;
                done();
            })
                .catch(done);
        });
        after(function (done) {
            server.stop(done);
        });
        afterEach(function (done) {
            testModel.remove({}, done);
        });
        it('should return the plural name for lists', function (done) {
            server.createRequest()
                .get('/people')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.should.have.keys('people', 'meta');
                done();
            })
                .end(done);
        });
        it('should return the singular name for items', function (done) {
            var item = new testModel({ name: 'John Doe' });
            item.save(function () {
                var id = item.get('id');
                server.createRequest()
                    .get('/people/' + id)
                    .then(function (res, done) {
                    var result = JSON.parse(res.result);
                    result.should.have.keys('person');
                    done();
                })
                    .end(done);
            });
        });
    });
    describe('custom uppercase plural and singular names', function () {
        var server;
        var testModel;
        var singularName = 'PERSON';
        var pluralName = 'PEOPLE';
        before(function (done) {
            testModel = mongoose.model('testModelUpExpandedNames', new mongoose.Schema({
                name: String
            }));
            testServer
                .create({ resources: [new resource_1.default(testModel, { name: { singular: singularName, plural: pluralName } })] })
                .then(function (createdServer) {
                server = createdServer;
                done();
            })
                .catch(done);
        });
        after(function (done) {
            server.stop(done);
        });
        afterEach(function (done) {
            testModel.remove({}, done);
        });
        it('should return the plural name for lists', function (done) {
            server.createRequest()
                .get('/people')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.should.have.keys('people', 'meta');
                done();
            })
                .end(done);
        });
        it('should return the singular name for items', function (done) {
            var item = new testModel({ name: 'John Doe' });
            item.save(function () {
                var id = item.get('id');
                server.createRequest()
                    .get('/people/' + id)
                    .then(function (res, done) {
                    var result = JSON.parse(res.result);
                    result.should.have.keys('person');
                    done();
                })
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=get.js.map