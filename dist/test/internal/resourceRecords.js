"use strict";
var mongoose = require('mongoose');
var resource_1 = require('../../lib/resource');
var records_1 = require('../../lib/records');
describe('Resource records', function () {
    describe('providing one item', function () {
        var testModel;
        var testResource;
        before(function (done) {
            testModel = mongoose.model('modelSerializeTest', new mongoose.Schema({
                stringValue: String,
                numericValue: Number,
                dateValue: Date,
                bufferValue: Buffer,
                booleanValue: Boolean,
                mixedValue: mongoose.Schema.Types.Mixed,
                objectIdValue: mongoose.Schema.Types.ObjectId,
                arrayValue: Array
            }));
            testResource = new resource_1.default(testModel, { name: 'item' });
            done();
        });
        var serializeAndDeserializeAction = function (key, testValue) {
            return function (done) {
                var data = {};
                data[key] = testValue;
                var item = new testModel(data);
                var jsonRecords = new records_1.default(testResource);
                jsonRecords.setData(item);
                var deserializedData = JSON.parse(jsonRecords.serialise());
                deserializedData.item[key].should.equal(testValue);
                done();
            };
        };
        it('should serialize/deserialize a string value', serializeAndDeserializeAction('stringValue', 'some string'));
        it('should serialize/deserialize a numeric value', serializeAndDeserializeAction('numericValue', 42));
        it('should serialize/deserialize a boolean value', serializeAndDeserializeAction('booleanValue', true));
        it('should serialize/deserialize a date value', function (done) {
            var testValue = new Date();
            var item = new testModel({ 'dateValue': testValue });
            var jsonRecords = new records_1.default(testResource);
            jsonRecords.setData(item);
            var deserializedData = JSON.parse(jsonRecords.serialise());
            var deserializedValue = new Date(deserializedData.item.dateValue);
            deserializedValue.should.eql(testValue);
            deserializedValue.toISOString().should.equal(testValue.toISOString());
            done();
        });
        it('should serialize/deserialize a buffer value', function (done) {
            var testValue = new Buffer([1, 2, 3, 4, 5]);
            var item = new testModel({ 'bufferValue': testValue });
            var jsonRecords = new records_1.default(testResource);
            jsonRecords.setData(item);
            var deserializedData = JSON.parse(jsonRecords.serialise());
            var deserializedValue = new Buffer(deserializedData.item.bufferValue, 'base64');
            deserializedValue.should.eql(testValue);
            done();
        });
        it('should serialize/deserialize a mixed value', function (done) {
            var testValue = { any: { thing: 'i want' } };
            var item = new testModel({ 'mixedValue': testValue });
            var jsonRecords = new records_1.default(testResource);
            jsonRecords.setData(item);
            var deserializedData = JSON.parse(jsonRecords.serialise());
            deserializedData.item.mixedValue.should.eql(testValue);
            done();
        });
        it('should serialize/deserialize an ObjectId value', function (done) {
            var testValue = new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');
            var item = new testModel({ 'objectIdValue': testValue });
            var jsonRecords = new records_1.default(testResource);
            jsonRecords.setData(item);
            var deserializedData = JSON.parse(jsonRecords.serialise());
            var deserializedValue = new mongoose.Types.ObjectId(deserializedData.item.objectIdValue);
            deserializedValue.should.eql(testValue);
            done();
        });
        it('should serialize/deserialize an array value', function (done) {
            var testValue = [1, 2, 3];
            var item = new testModel({ 'arrayValue': testValue });
            var jsonRecords = new records_1.default(testResource);
            jsonRecords.setData(item);
            var deserializedData = JSON.parse(jsonRecords.serialise());
            deserializedData.item.arrayValue.should.eql(testValue);
            done();
        });
        it('should have the right keys', function (done) {
            var item = new testModel({
                stringValue: 'some string',
                numericValue: 42,
                dateValue: new Date(),
                bufferValue: new Buffer([1, 2, 3]),
                booleanValue: true,
                mixedValue: { any: { thing: 'i want' } },
                objectIdValue: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
                arrayValue: [1, 2, 3]
            });
            var jsonRecords = new records_1.default(testResource);
            jsonRecords.setData(item);
            var deserializedData = JSON.parse(jsonRecords.serialise());
            deserializedData.item.should.have.keys('id', 'stringValue', 'numericValue', 'dateValue', 'bufferValue', 'booleanValue', 'mixedValue', 'objectIdValue', 'arrayValue');
            done();
        });
    });
    describe('having underscored keys', function () {
        var testModel;
        var testResource;
        before(function (done) {
            testModel = mongoose.model('modelUnderscoredKeysTest', new mongoose.Schema({
                publicField: String,
                _protectedField: String,
                __privateField: String
            }));
            testResource = new resource_1.default(testModel, { name: 'item' });
            done();
        });
        it('should have the right keys', function (done) {
            var item = new testModel({
                publicField: 'public',
                _protectedField: 'protected',
                __privateField: 'private'
            });
            var jsonRecords = new records_1.default(testResource);
            jsonRecords.setData(item);
            var deserializedData = JSON.parse(jsonRecords.serialise());
            deserializedData.item.should.have.keys('id', 'publicField');
            done();
        });
    });
});
//# sourceMappingURL=resourceRecords.js.map