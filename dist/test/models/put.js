"use strict";
var should = require('should');
var mongoose = require('mongoose');
var testServer = require('../testServer');
function serverSetup(testSetup) {
    'use strict';
    return function (done) {
        var testModel = mongoose.model('putModelTest', new mongoose.Schema({
            name: String,
            value: String
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
describe('Replacing records (PUT)', function () {
    var test = {};
    before(serverSetup(test));
    after(function (done) {
        test.server.stop(done);
    });
    afterEach(function (done) {
        test.model.remove({}, done);
    });
    it('should replace a record', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('putmodeltest', { name: 'second' })
                .put('/putmodeltests/' + item._id)
                .thenCheckBody(function (body, done) {
                var responseObj = JSON.parse(body);
                responseObj.putmodeltest.should.have.keys('id', 'name', 'value');
                responseObj.putmodeltest.id.should.equal(item._id.toString());
                responseObj.putmodeltest.name.should.equal('second');
                done();
            })
                .then(function (res, done) {
                res.statusCode.should.equal(200);
                test.model.find({ name: 'second' }, function (err, records) {
                    records.length.should.equal(1);
                    should.not.exist(records[0].value);
                    done();
                });
            })
                .end(done);
        });
    });
    it('should not return a body when silent=true', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('putmodeltest', { name: 'second' })
                .put('/putmodeltests/' + item._id + '?silent=true')
                .thenBodyShouldBeEmpty()
                .then(function (res, done) {
                res.statusCode.should.equal(204);
                test.model.find({ name: 'second' }, function (err, records) {
                    records.length.should.equal(1);
                    should.not.exist(records[0].value);
                    done();
                });
            })
                .end(done);
        });
    });
    it('should return 412 if-match header has a bad version', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('putmodeltest', { name: 'second' })
                .header('If-Match', '"v:9999"')
                .put('/putmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(412)
                .end(done);
        });
    });
    it('should return 400 when if-match header has a bad format', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('putmodeltest', { name: 'second' })
                .header('If-Match', '"v:string"')
                .put('/putmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
    it('should return 400 for invalid ids', function (done) {
        test.server.createRequest()
            .payload('name', 'value')
            .put('/putmodeltests/invalid')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
    it('should return 404 for nonexistent ids', function (done) {
        test.server.createRequest()
            .payload('putmodeltest', { name: 'second' })
            .put('/putmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
            .thenStatusCodeShouldEqual(404)
            .end(done);
    });
    it('should return 404 for nonexistent ids and if-match header is present', function (done) {
        test.server.createRequest()
            .header('If-Match', '"v:9999"')
            .payload('putmodeltest', { name: 'second' })
            .put('/putmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
            .thenStatusCodeShouldEqual(404)
            .end(done);
    });
    it('should return 400 for queries with invalid model keys', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('putmodeltests', { name: 'testName', otherKey: 'strange value' })
                .put('/putmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
});
//# sourceMappingURL=put.js.map