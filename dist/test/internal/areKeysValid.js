"use strict";
var mongoose = require('mongoose');
var resource_1 = require('../../lib/resource');
describe('Resource areKeysValid', function () {
    var testModel;
    var testResource;
    before(function (done) {
        testModel = mongoose.model('modelValidationTest', new mongoose.Schema({
            title: String,
            data: {
                level1: {
                    key: String
                }
            }
        }));
        testResource = new resource_1.default(testModel, { name: 'item' });
        done();
    });
    it('should find object keys valid', function () {
        testResource.areKeysValid(['title', 'data']).should.equal(true);
    });
});
//# sourceMappingURL=areKeysValid.js.map