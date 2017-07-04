"use strict";
var mongoose = require('mongoose');
var testServer = require('../testServer');
describe('Searching records', function () {
    var server;
    var testModel;
    before(function (done) {
        var schema = new mongoose.Schema({
            name: { type: String }
        });
        schema.index({ name: 'text' });
        testModel = mongoose.model('testSearchModel', schema);
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
    describe('in models', function () {
        before(function (done) {
            var item = new testModel({ name: 'item1' });
            item.save(function () {
                var item = new testModel({ name: 'other item' });
                item.save(done);
            });
        });
        after(function (done) {
            testModel.remove({}, done);
        });
        it('should return one item', function (done) {
            server.createRequest()
                .get('/testsearchmodels?search=item1')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.testsearchmodels.length.should.equal(1);
                result.meta.page.total.should.equal(1);
                result.testsearchmodels[0].name.should.equal('item1');
                done();
            })
                .end(done);
        });
        it('should return all items', function (done) {
            server.createRequest()
                .get('/testsearchmodels?search=item')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.testsearchmodels.length.should.equal(1);
                result.testsearchmodels[0].name.should.equal('other item');
                done();
            })
                .end(done);
        });
    });
});
//# sourceMappingURL=search.js.map