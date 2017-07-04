"use strict";
var mongoose = require('mongoose');
var testServer = require('../testServer');
function serverSetup(testSetup) {
    'use strict';
    return function (done) {
        var testModel = mongoose.model('postModelTest', new mongoose.Schema({
            name: String
        }));
        testServer
            .create({ resources: [testModel] })
            .then(function (server) {
            testSetup.server = server;
            testSetup.model = testModel;
            done();
        })
            .catch(done);
    };
}
describe('Creating records (POST)', function () {
    var test = {};
    before(serverSetup(test));
    after(function (done) {
        test.server.stop(done);
    });
    afterEach(function (done) {
        test.model.remove({}, done);
    });
    it('should create a new record', function (done) {
        test.server.createRequest()
            .payload('postmodeltest', { name: 'testName' })
            .post('/postmodeltests')
            .thenStatusCodeShouldEqual(201)
            .thenCheckBody(function (body, done) {
            var responseObj = JSON.parse(body);
            responseObj.postmodeltest.should.have.keys('id', 'name');
            responseObj.postmodeltest.name.should.equal('testName');
            done();
        })
            .then(function (res, done) {
            res.statusCode.should.equal(201);
            test.model.count({ name: 'testName' }, function (err, count) {
                count.should.equal(1);
                done();
            });
        })
            .end(done);
    });
    it('should not return a body when silent=true', function (done) {
        test.server.createRequest()
            .payload('postmodeltest', { name: 'testName' })
            .post('/postmodeltests?silent=true')
            .thenStatusCodeShouldEqual(204)
            .thenBodyShouldBeEmpty()
            .then(function (res, done) {
            test.model.count({ name: 'testName' }, function (err, count) {
                count.should.equal(1);
                done();
            });
        })
            .end(done);
    });
    it('should return 400 for queries with invalid model keys', function (done) {
        test.server.createRequest()
            .payload('postmodeltest', { name: 'testName', otherKey: 'strange value' })
            .post('/postmodeltests')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
});
//# sourceMappingURL=post.js.map