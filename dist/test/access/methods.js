"use strict";
var mongoose = require('mongoose');
var resource_1 = require('../../lib/resource');
var testServer = require('../testServer');
function pluginOptionsFor(method, testModel) {
    'use strict';
    var options = { methodAccess: {} };
    options.methodAccess[method] = false;
    var resource = new resource_1.default(testModel, options);
    return { resources: [resource] };
}
function serverSetup(access, testSetup) {
    'use strict';
    return function (done) {
        var testModel = mongoose.model(access + 'Test', new mongoose.Schema({
            name: String
        }));
        testServer
            .create(pluginOptionsFor(access, testModel))
            .then(function (server) {
            testSetup.server = server;
            testSetup.model = testModel;
            done();
        })
            .catch(done);
    };
}
describe('Deny access to method', function () {
    describe('disabled GET method list', function () {
        var test = {};
        before(serverSetup('getList', test));
        after(function (done) {
            test.server.stop(done);
        });
        it('should return 404', function (done) {
            test.server.createRequest()
                .get('/getlisttests')
                .thenStatusCodeShouldEqual(404)
                .end(done);
        });
    });
    describe('disabled GET method item', function () {
        var test = {};
        before(serverSetup('getItem', test));
        after(function (done) {
            test.server.stop(done);
        });
        afterEach(function (done) {
            test.model.remove({}, done);
        });
        it('should return 404', function (done) {
            var item = new test.model({ name: 'first' });
            item.save(function () {
                test.server.createRequest()
                    .get('/getitemtests/' + item._id)
                    .thenStatusCodeShouldEqual(404)
                    .end(done);
            });
        });
        it('should return 404 on missing id', function (done) {
            var item = new test.model({ name: 'first' });
            item.save(function () {
                test.server.createRequest()
                    .get('/getitemtests/')
                    .thenStatusCodeShouldEqual(404)
                    .end(done);
            });
        });
    });
    describe('POST method', function () {
        var test = {};
        before(serverSetup('post', test));
        after(function (done) {
            test.server.stop(done);
        });
        it('should return 404 if POST method is disabled', function (done) {
            test.server.createRequest()
                .post('/posttests')
                .thenStatusCodeShouldEqual(404)
                .end(done);
        });
    });
    describe('PUT method', function () {
        var test = {};
        before(serverSetup('put', test));
        after(function (done) {
            test.server.stop(done);
        });
        afterEach(function (done) {
            test.model.remove({}, done);
        });
        it('should return 404 if PUT method is disabled', function (done) {
            test.server.createRequest()
                .put('/puttests')
                .thenStatusCodeShouldEqual(404)
                .end(done);
        });
        it('should return 404 on missing id', function (done) {
            var item = new test.model({ name: 'first' });
            item.save(function () {
                test.server.createRequest()
                    .put('/puttests/')
                    .thenStatusCodeShouldEqual(404)
                    .end(done);
            });
        });
    });
    describe('PATCH method', function () {
        var test = {};
        before(serverSetup('patch', test));
        after(function (done) {
            test.server.stop(done);
        });
        afterEach(function (done) {
            test.model.remove({}, done);
        });
        it('should return 404 if PATCH method is disabled', function (done) {
            test.server.createRequest()
                .patch('/patchtests')
                .thenStatusCodeShouldEqual(404)
                .end(done);
        });
        it('should return 404 on missing id', function (done) {
            var item = new test.model({ name: 'first' });
            item.save(function () {
                test.server.createRequest()
                    .patch('/patchtests/')
                    .thenStatusCodeShouldEqual(404)
                    .end(done);
            });
        });
    });
    describe('DELETE method', function () {
        var test = {};
        before(serverSetup('delete', test));
        after(function (done) {
            test.server.stop(done);
        });
        afterEach(function (done) {
            test.model.remove({}, done);
        });
        it('should return 404 if DELETE method is disabled', function (done) {
            test.server.createRequest()
                .delete('/deletetests')
                .thenStatusCodeShouldEqual(404)
                .end(done);
        });
        it('should return 404 on missing id', function (done) {
            var item = new test.model({ name: 'first' });
            item.save(function () {
                test.server.createRequest()
                    .delete('/deletetests/')
                    .thenStatusCodeShouldEqual(404)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=methods.js.map