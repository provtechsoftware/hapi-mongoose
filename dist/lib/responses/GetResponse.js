"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require('promise/polyfill');
var boom = require('boom');
var records_1 = require('../records');
var _ = require('lodash');
var ABaseResponse_1 = require('./ABaseResponse');
var GetResponse = (function (_super) {
    __extends(GetResponse, _super);
    function GetResponse(request, resource, query, plugin) {
        _super.call(this, request, resource);
        this._query = query;
        this._plugin = plugin;
        this._jsonRecords = new records_1.default(this._resource);
        this._queryCount = 0;
        this._queryExecuted = 0;
    }
    GetResponse.prototype._replyCallback = function (err) {
        var _this = this;
        if (err) {
            this._lastError = boom.badRequest(err.message, err);
        }
        this._syncQuery(function (callback) {
            _this._query.exec(function (err, result) {
                if (err) {
                    callback(boom.badRequest(err.message, err));
                }
                else if (!result) {
                    callback(boom.notFound());
                }
                else {
                    _this._jsonRecords.setData(result);
                    _this.__applyProjection(callback);
                }
            });
        });
    };
    GetResponse.prototype._syncQuery = function (queryFunction) {
        var _this = this;
        this._queryCount++;
        queryFunction(function (err) {
            if (err) {
                _this._lastError = err;
            }
            _this._queryExecuted++;
            if (_this._queryExecuted === _this._queryCount) {
                _this.__flush();
            }
        });
    };
    GetResponse.prototype.__flush = function () {
        if (this._lastError) {
            this._reply(this._lastError);
        }
        else {
            this._reply(this._jsonRecords.serialise()).header('content-type', 'application/json; charset=utf-8');
        }
    };
    GetResponse.prototype.__applyProjection = function (callback) {
        var _this = this;
        var err;
        if (this._request.query && this._request.query.project) {
            var projectedFields_1 = this._request.query.project.split(',');
            var projectedResources = this.__relatedResources(projectedFields_1);
            _.each(projectedResources, function (projectedResource, i) {
                if (projectedResource) {
                    _this.__addProjection(projectedFields_1[i], projectedResource);
                }
                else {
                    err = boom.badRequest('Bad projection:`' + projectedFields_1[i] + '`');
                }
            });
        }
        callback(err);
    };
    GetResponse.prototype.__relatedResources = function (projectedFields) {
        var _this = this;
        return _.map(projectedFields, function (field) {
            var referencedCollection = _this._resource.referencedCollection(field);
            return _this._plugin.getResourceFor(referencedCollection);
        });
    };
    GetResponse.prototype.__addProjection = function (projectedField, projectedResource) {
        var _this = this;
        var value = _.flatten(this._jsonRecords.value(projectedField));
        this._syncQuery(function (callback) {
            projectedResource.model.find({ _id: { $in: value } }, function (err, result) {
                var exportedItems = _.map(result, function (value) {
                    return projectedResource.exportItem(value.toObject());
                });
                _this._jsonRecords.addProjection(projectedField, exportedItems);
                callback(err);
            });
        });
    };
    return GetResponse;
}(ABaseResponse_1.ABaseResponse));
exports.GetResponse = GetResponse;
//# sourceMappingURL=GetResponse.js.map