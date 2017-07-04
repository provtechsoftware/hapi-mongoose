"use strict";
var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');
var testServer = require('../testServer');
var resource_1 = require('../../lib/resource');
describe('GET sorting', function () {
    var server;
    describe('unaliased fields', function () {
        var testModel;
        before(function (done) {
            testModel = mongoose.model('testModelSorting', new mongoose.Schema({
                name: String,
                index: Number
            }));
            testServer
                .create({ resources: [testModel] })
                .then(function (createdServer) {
                server = createdServer;
                async.each(_.range(3), function (i, callback) {
                    var item = new testModel({ name: 'item' + i, index: i });
                    item.save(function () {
                        callback();
                    });
                }, function () {
                    async.each(_.range(3), function (i, callback) {
                        var item = new testModel({ name: 'item' + (5 - i), index: (5 - i) });
                        item.save(function () {
                            callback();
                        });
                    }, done);
                });
            })
                .catch(done);
        });
        after(function (done) {
            server.stop(function () {
                testModel.remove({}, done);
            });
        });
        it('should return sorted elements (ASC)', function (done) {
            server.createRequest()
                .get('/testmodelsortings?sort=index')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                var oldValue = -1;
                _.each(_.map(result.testmodelsortings, 'index'), function (value) {
                    value.should.be.above(oldValue);
                    oldValue = value;
                });
                done();
            })
                .end(done);
        });
        it('should return sorted elements (DESC)', function (done) {
            server.createRequest()
                .get('/testmodelsortings?sort=-index')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                var oldValue = 10;
                _.each(_.map(result.testmodelsortings, 'index'), function (value) {
                    value.should.be.below(oldValue);
                    oldValue = value;
                });
                done();
            })
                .end(done);
        });
        it('should return 400 on invalid sort field', function (done) {
            server.createRequest()
                .get('/testmodelsortings?sort=invalid')
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
    describe('aliased fields', function () {
        var testModel;
        before(function (done) {
            testModel = mongoose.model('testModelAliasSorting', new mongoose.Schema({
                name: String,
                index: Number
            }));
            var resourceModel = new resource_1.default(testModel, { alias: { index: 'aliasedIndex' } });
            testServer
                .create({ resources: [resourceModel] })
                .then(function (createdServer) {
                server = createdServer;
                async.each(_.range(3), function (i, callback) {
                    var item = new testModel({ name: 'item' + i, index: i });
                    item.save(function () {
                        callback();
                    });
                }, function () {
                    async.each(_.range(3), function (i, callback) {
                        var item = new testModel({ name: 'item' + (5 - i), index: (5 - i) });
                        item.save(function () {
                            callback();
                        });
                    }, done);
                });
            })
                .catch(done);
        });
        after(function (done) {
            server.stop(function () {
                testModel.remove({}, done);
            });
        });
        it('should return sorted elements (ASC)', function (done) {
            server.createRequest()
                .get('/testmodelaliassortings?sort=aliasedIndex')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                var oldValue = -1;
                _.each(_.map(result.testmodelaliassortings, 'aliasedIndex'), function (value) {
                    value.should.be.above(oldValue);
                    oldValue = value;
                });
                done();
            })
                .end(done);
        });
        it('should return sorted elements (DESC)', function (done) {
            server.createRequest()
                .get('/testmodelaliassortings?sort=-aliasedIndex')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                var oldValue = 10;
                _.each(_.map(result.testmodelaliassortings, 'aliasedIndex'), function (value) {
                    value.should.be.below(oldValue);
                    oldValue = value;
                });
                done();
            })
                .end(done);
        });
        it('should return 400 on invalid sort field', function (done) {
            server.createRequest()
                .get('/testmodelaliassortings?sort=index')
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
});
//# sourceMappingURL=sort.js.map