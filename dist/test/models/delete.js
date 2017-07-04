"use strict";
var mongoose = require('mongoose');
var testServer = require('../testServer');
function serverSetup(testSetup) {
    'use strict';
    return function (done) {
        var testModel = mongoose.model('deleteModelTest', new mongoose.Schema({
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
describe('Deleting records', function () {
    var test = {};
    before(serverSetup(test));
    after(function (done) {
        test.server.stop(done);
    });
    afterEach(function (done) {
        test.model.remove({}, done);
    });
    afterEach(function (done) {
        test.model.remove({}, done);
    });
    it('should delete a record', function (done) {
        var item = new test.model({ name: 'value' });
        item.save(function () {
            test.server.createRequest()
                .delete('/deletemodeltests/' + item._id)
                .thenStatusCodeShouldEqual(204)
                .thenBodyShouldBeEmpty()
                .then(function (res, done) {
                test.model.count({ _id: item._id }, function (err, count) {
                    count.should.equal(0);
                    done();
                });
            })
                .end(done);
        });
    });
    it('should not return a body when silent=true', function (done) {
        var item = new test.model({ name: 'value' });
        item.save(function () {
            test.server.createRequest()
                .delete('/deletemodeltests/' + item._id + '?silent=true')
                .thenStatusCodeShouldEqual(204)
                .thenBodyShouldBeEmpty()
                .then(function (res, done) {
                test.model.count({ _id: item._id }, function (err, count) {
                    count.should.equal(0);
                    done();
                });
            })
                .end(done);
        });
    });
    it('should return 412 if-match header is false', function (done) {
        var item = new test.model({ name: 'value' });
        item.save(function () {
            test.server.createRequest()
                .header('If-Match', '"sometag", "v:9999", "someothertag"')
                .delete('/deletemodeltests/' + item._id)
                .thenStatusCodeShouldEqual(412)
                .end(done);
        });
    });
    it('should return 400 when if-match header has a bad format', function (done) {
        var item = new test.model({ name: 'first', value: 'some value' });
        item.save(function () {
            test.server.createRequest()
                .payload('name', 'second')
                .header('If-Match', '"v:string"')
                .delete('/deletemodeltests/' + item._id)
                .thenStatusCodeShouldEqual(400)
                .end(done);
        });
    });
    it('should return 400 for invalid ids', function (done) {
        test.server.createRequest()
            .delete('/deletemodeltests/invalid')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
    it('should return 404 for nonexistent  ids', function (done) {
        test.server.createRequest()
            .delete('/deletemodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
            .thenStatusCodeShouldEqual(404)
            .end(done);
    });
    it('should return 404 for nonexistent ids when if-match header is set', function (done) {
        test.server.createRequest()
            .header('If-Match', '"v:9999"')
            .delete('/deletemodeltests/aaaaaaaaaaaaaaaaaaaaaaaa')
            .thenStatusCodeShouldEqual(404)
            .end(done);
    });
    it('should return 404 for a missing id', function (done) {
        test.server.createRequest()
            .delete('/deletemodeltests/')
            .thenStatusCodeShouldEqual(404)
            .end(done);
    });
});
//# sourceMappingURL=delete.js.map