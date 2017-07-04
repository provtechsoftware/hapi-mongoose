"use strict";
var mongoose = require('mongoose');
var testServer = require('../testServer');
describe('Query records', function () {
    var server;
    var testModel;
    before(function (done) {
        var schema = new mongoose.Schema({
            name: { type: String },
            list: [{ type: String }]
        });
        testModel = mongoose.model('testQueryModel', schema);
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
            var item = new testModel({ name: 'item1', list: ['value1'] });
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
                .get('/testquerymodels?query[name]=item1')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.testquerymodels.length.should.equal(1);
                result.meta.page.total.should.equal(1);
                result.testquerymodels[0].name.should.equal('item1');
                done();
            })
                .end(done);
        });
        it('should work with bool values', function (done) {
            server.createRequest()
                .get('/testquerymodels?query[list.0][$exists]=true')
                .then(function (res, done) {
                var result = JSON.parse(res.result);
                result.testquerymodels.length.should.equal(1);
                result.meta.page.total.should.equal(1);
                done();
            })
                .end(done);
        });
    });
});
//# sourceMappingURL=query.js.map