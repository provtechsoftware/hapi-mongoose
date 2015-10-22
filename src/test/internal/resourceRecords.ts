/// ts:ref=mocha
/// <reference path="../../../typings/mocha/mocha.d.ts"/> ///ts:ref:generated
/// ts:ref=should
/// <reference path="../../../typings/should/should.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/* tslint:disable:no-unused-variable */

import * as should from 'should';
import * as mongoose from 'mongoose';
import Resource from '../../lib/resource';
import Records from '../../lib/records';

describe('Resource records', () => {
  describe('providing one item', () => {
    let testModel: mongoose.Model<mongoose.Document>;
    let testResource: Resource;

    before((done: MochaDone) => {
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
      testResource = new Resource(testModel, { name: 'item' });

      done();
    });

    let serializeAndDeserializeAction = (key: string, testValue: any) => {
      return (done: MochaDone) => {
        let data = {};
        data[key] = testValue;

        let item = new testModel(data);
        let jsonRecords = new Records<any>(testResource);
        jsonRecords.setData(item);

        let deserializedData = JSON.parse(jsonRecords.serialise());
        deserializedData.item[key].should.equal(testValue);
        done();
      };
    };

    it('should serialize/deserialize a string value', serializeAndDeserializeAction('stringValue', 'some string'));
    it('should serialize/deserialize a numeric value', serializeAndDeserializeAction('numericValue', 42));
    it('should serialize/deserialize a boolean value', serializeAndDeserializeAction('booleanValue', true));

    it('should serialize/deserialize a date value', (done: MochaDone) => {
      let testValue = new Date();

      let item = new testModel({ 'dateValue': testValue });
      let jsonRecords = new Records<any>(testResource);
      jsonRecords.setData(item);

      let deserializedData = JSON.parse(jsonRecords.serialise());
      let deserializedValue = new Date(<string>deserializedData.item.dateValue);
      deserializedValue.should.eql(testValue);
      deserializedValue.toISOString().should.equal(testValue.toISOString());
      done();
    });

    it('should serialize/deserialize a buffer value', (done: MochaDone) => {
      let testValue = new Buffer([1, 2, 3, 4, 5]);

      let item = new testModel({ 'bufferValue': testValue });
      let jsonRecords = new Records<any>(testResource);
      jsonRecords.setData(item);

      let deserializedData = JSON.parse(jsonRecords.serialise());
      let deserializedValue = new Buffer(deserializedData.item.bufferValue, 'base64');
      deserializedValue.should.eql(testValue);
      done();
    });

    it('should serialize/deserialize a mixed value', (done: MochaDone) => {
      let testValue = { any: { thing: 'i want' } };

      let item = new testModel({ 'mixedValue': testValue });
      let jsonRecords = new Records<any>(testResource);
      jsonRecords.setData(item);

      let deserializedData = JSON.parse(jsonRecords.serialise());
      deserializedData.item.mixedValue.should.eql(testValue);
      done();
    });

    it('should serialize/deserialize an ObjectId value', (done: MochaDone) => {
      let testValue = new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');

      let item = new testModel({ 'objectIdValue': testValue });
      let jsonRecords = new Records<any>(testResource);
      jsonRecords.setData(item);

      let deserializedData = JSON.parse(jsonRecords.serialise());
      let deserializedValue = new mongoose.Types.ObjectId(deserializedData.item.objectIdValue);

      deserializedValue.should.eql(testValue);
      done();
    });

    it('should serialize/deserialize an array value', (done: MochaDone) => {
      let testValue = [1, 2, 3];

      let item = new testModel({ 'arrayValue': testValue });
      let jsonRecords = new Records<any>(testResource);
      jsonRecords.setData(item);

      let deserializedData = JSON.parse(jsonRecords.serialise());
      deserializedData.item.arrayValue.should.eql(testValue);
      done();
    });

    it('should have the right keys', (done: MochaDone) => {
      let item = new testModel({
        stringValue: 'some string',
        numericValue: 42,
        dateValue: new Date(),
        bufferValue: new Buffer([1, 2, 3]),
        booleanValue: true,
        mixedValue: { any: { thing: 'i want' } },
        objectIdValue: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
        arrayValue: [1, 2, 3]
      });

      let jsonRecords = new Records<any>(testResource);
      jsonRecords.setData(item);

      let deserializedData = JSON.parse(jsonRecords.serialise());
      deserializedData.item.should.have.keys(
        'id',
        'stringValue',
        'numericValue',
        'dateValue',
        'bufferValue',
        'booleanValue',
        'mixedValue',
        'objectIdValue',
        'arrayValue');

      done();
    });
  });

  describe('having underscored keys', () => {
    let testModel: mongoose.Model<mongoose.Document>;
    let testResource: Resource;

    before((done: MochaDone) => {
      testModel = mongoose.model('modelUnderscoredKeysTest', new mongoose.Schema({
        publicField: String,
        _protectedField: String,
        __privateField: String
      }));
      testResource = new Resource(testModel, { name: 'item' });

      done();
    });

    it('should have the right keys', (done: MochaDone) => {
      let item = new testModel({
        publicField: 'public',
        _protectedField: 'protected',
        __privateField: 'private'
      });

      let jsonRecords = new Records<any>(testResource);

      jsonRecords.setData(item);
      let deserializedData = JSON.parse(jsonRecords.serialise());
      deserializedData.item.should.have.keys('id', 'publicField');
      done();
    });
  });
});
