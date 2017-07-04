"use strict";
var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');
var testServer = require('../testServer');
describe('GET pagination', function () {
    var server;
    var testModel;
    before(function (done) {
        testModel = mongoose.model('testModelPagination', new mongoose.Schema({
            name: String
        }));
        testServer
            .create({ resources: [testModel] })
            .then(function (createdServer) {
            server = createdServer;
            async.each(_.range(5), function (i, callback) {
                var item = new testModel({ name: 'item' + i });
                item.save(function () {
                    callback();
                });
            }, done);
        })
            .catch(done);
    });
    after(function (done) {
        server.stop(function () {
            testModel.remove({}, done);
        });
    });
    it('should return two elements for first page', function (done) {
        server.createRequest()
            .get('/testmodelpaginations?page[offset]=0&page[limit]=2')
            .then(function (res, done) {
            var result = JSON.parse(res.result);
            result.should.have.keys('testmodelpaginations', 'meta');
            result.meta.should.have.keys('page');
            result.meta.page.should.have.keys('offset', 'limit', 'total');
            result.testmodelpaginations.length.should.equal(2);
            result.meta.page.offset.should.equal(0);
            result.meta.page.limit.should.equal(2);
            result.meta.page.total.should.equal(5);
            done();
        })
            .end(done);
    });
    it('should return default meta properties', function (done) {
        server.createRequest()
            .get('/testmodelpaginations')
            .then(function (res, done) {
            var result = JSON.parse(res.result);
            result.should.have.keys('testmodelpaginations', 'meta');
            result.meta.should.have.keys('page');
            result.meta.page.should.have.keys('offset', 'limit', 'total');
            result.testmodelpaginations.length.should.equal(5);
            result.meta.page.offset.should.equal(0);
            result.meta.page.limit.should.equal(10);
            result.meta.page.total.should.equal(5);
            done();
        })
            .end(done);
    });
    it('should return 400 on invalid offset', function (done) {
        server.createRequest()
            .get('/testmodelpaginations?page[offset]=_')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
    it('should return 400 on invalid limit', function (done) {
        server.createRequest()
            .get('/testmodelpaginations?page[limit]=_')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
    it('should return 400 on invalid page', function (done) {
        server.createRequest()
            .get('/testmodelpaginations?page=_')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
});
//# sourceMappingURL=pagination.js.map