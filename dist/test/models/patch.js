"use strict";
var mongoose = require('mongoose');
var testServer = require('../testServer');
function serverSetup(testSetup) {
    'use strict';
    return function (done) {
        var testModel = mongoose.model('patchModelTest', new mongoose.Schema({
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
describe('Updating records (PATCH)', function () {
    var test = {};
    before(serverSetup(test));
    after(function (done) {
        test.server.stop(done);
    });
    afterEach(function (done) {
        test.model.remove({}, done);
    });
    it('should work with a correct id', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('patchmodeltest', { name: 'second' })
                .patch('/patchmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(200)
                .thenCheckBody(function (body, done) {
                var responseObj = JSON.parse(body);
                responseObj.patchmodeltest.should.have.keys('id', 'name', 'value');
                responseObj.patchmodeltest.id.should.equal(item._id.toString());
                responseObj.patchmodeltest.name.should.equal('second');
                responseObj.patchmodeltest.value.should.equal('some value');
                done();
            })
                .then(function (res, done) {
                test.model.find({ name: 'second' }, function (err, records) {
                    records.length.should.equal(1);
                    records[0].value.should.equal('some value');
                    done();
                });
            })
                .end(done);
        });
    });
    it('should not return with silent=true', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('patchmodeltest', { name: 'second' })
                .patch('/patchmodeltests/' + item._id + '?silent=true')
                .thenBodyShouldBeEmpty()
                .thenStatusCodeShouldEqual(204)
                .then(function (res, done) {
                test.model.find({ name: 'second' }, function (err, records) {
                    records.length.should.equal(1);
                    records[0].value.should.equal('some value');
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
                .header('If-Match', '"v:9999"')
                .payload('patchmodeltest', { name: 'second' })
                .patch('/patchmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(412)
                .end(done);
        });
    });
    it('should return 400 when if-match header has a bad format', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('patchmodeltest', { name: 'second' })
                .header('If-Match', '"v:string"')
                .patch('/patchmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
    it('should return 400 for invalid ids', function (done) {
        test.server.createRequest()
            .payload('patchmodeltest', { name: 'second' })
            .patch('/patchmodeltests/invalid')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
    it('should return 404 for nonexistent ids', function (done) {
        test.server.createRequest()
            .payload('patchmodeltest', { name: 'second' })
            .patch('/patchmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
            .thenStatusCodeShouldEqual(404)
            .end(done);
    });
    it('should return 404 for nonexistent ids and if-match header is present', function (done) {
        test.server.createRequest()
            .payload('patchmodeltest', { name: 'second' })
            .header('If-Match', '"v:9999"')
            .patch('/patchmodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
            .thenStatusCodeShouldEqual(404)
            .end(done);
    });
    it('should return 400 for queries with invalid model keys', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('patchmodeltest', { otherKey: 'strange value' })
                .patch('/patchmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
    it('should return 400 for queries with unwrapped payload', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('name', 'second')
                .patch('/patchmodeltests/' + item._id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
});
//# sourceMappingURL=patch.js.map