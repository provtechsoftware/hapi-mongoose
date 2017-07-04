"use strict";
var mongoose = require('mongoose');
var resource_1 = require('../../lib/resource');
var testServer = require('../testServer');
function serverSetup(testSetup, name, alias) {
    'use strict';
    return function (done) {
        var testModel = mongoose.model(name, new mongoose.Schema({
            name: String
        }));
        var options;
        if (alias) {
            options = { alias: alias };
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
describe('Alias', function () {
    describe('default fields', function () {
        var test = {};
        before(serverSetup(test, 'aliasIdTest'));
        after(function (done) {
            test.server.stop(done);
        });
        afterEach(function (done) {
            test.model.remove({}, done);
        });
        it('should alias _id to id by default', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .get('/aliasidtests/' + id)
                    .then(function (res) {
                    var result = JSON.parse(res.result);
                    result['aliasidtest'].should.have.keys('id', 'name');
                    result.aliasidtest.id.should.equal(id);
                    done();
                })
                    .end(done);
            });
        });
    });
    describe('fields', function () {
        var test = {};
        before(serverSetup(test, 'aliasTest', { name: 'title' }));
        after(function (done) {
            test.server.stop(done);
        });
        afterEach(function (done) {
            test.model.remove({}, done);
        });
        it('should be aliased in the response', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .get('/aliastests/' + id)
                    .then(function (res) {
                    var result = JSON.parse(res.result);
                    result['aliastest'].should.have.keys('id', 'title');
                    result.aliastest.title.should.equal('some name');
                    done();
                })
                    .end(done);
            });
        });
        it('should create the right item when trying to POST', function (done) {
            test.server.createRequest()
                .payload('aliastest', { title: 'some title' })
                .post('/aliastests')
                .thenStatusCodeShouldEqual(201)
                .then(function (res) {
                test.model.find({ name: 'some title' }, function (err, res) {
                    res.length.should.equal(1);
                    done();
                });
            })
                .end(done);
        });
        it('should update the right keys when trying to PUT', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .payload('id', id)
                    .payload('aliastest', { title: 'some title' })
                    .put('/aliastests/' + id)
                    .thenStatusCodeShouldEqual(200)
                    .then(function (res) {
                    test.model.findById(id, function (err, res) {
                        res.name.should.equal('some title');
                        done();
                    });
                })
                    .end(done);
            });
        });
        it('should update the right keys when trying to PATCH', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .payload('aliastest', { title: 'some title' })
                    .patch('/aliastests/' + id)
                    .thenStatusCodeShouldEqual(200)
                    .then(function (res) {
                    test.model.findById(id, function (err, res) {
                        res.name.should.equal('some title');
                        done();
                    });
                })
                    .end(done);
            });
        });
        it('should return 400 when trying to POST an aliased key with original name', function (done) {
            test.server.createRequest()
                .payload('aliastest', { name: 'a new name' })
                .post('/aliastests')
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
        it('should return 400 when trying to PUT an aliased key with original name', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .payload('name', 'a new name')
                    .put('/aliastests/' + id)
                    .thenStatusCodeShouldEqual(400)
                    .end(done);
            });
        });
        it('should return 400 when trying to PATCH an aliased key with original name', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .payload('name', 'a new name')
                    .patch('/aliastests/' + id)
                    .thenStatusCodeShouldEqual(400)
                    .end(done);
            });
        });
    });
    describe('fields aliased with `_`', function () {
        var test = {};
        before(serverSetup(test, 'aliasUnderscoreTest', { name: '_name' }));
        after(function (done) {
            test.server.stop(done);
        });
        afterEach(function (done) {
            test.model.remove({}, done);
        });
        it('should not be visible in response', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .get('/aliasunderscoretests/' + id)
                    .then(function (res) {
                    var result = JSON.parse(res.result);
                    result['aliasunderscoretest'].should.have.keys('id');
                    done();
                })
                    .end(done);
            });
        });
        it('should return 400 when trying to POST', function (done) {
            test.server.createRequest()
                .payload('aliasunderscoretest', { _name: 'a new name' })
                .post('/aliasunderscoretests')
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
        it('should return 400 when trying to PUT', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .payload('_name', 'a new name')
                    .put('/aliasunderscoretests/' + id)
                    .thenStatusCodeShouldEqual(400)
                    .end(done);
            });
        });
        it('should return 400 when trying to PATCH', function (done) {
            var item = new test.model({ name: 'some name' });
            item.save(function () {
                var id = item._id.toString();
                test.server.createRequest()
                    .payload('_name', 'a new name')
                    .patch('/aliasunderscoretests/' + id)
                    .thenStatusCodeShouldEqual(400)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=alias.js.map