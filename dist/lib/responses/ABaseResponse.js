"use strict";
require('promise/polyfill');
var records_1 = require('../records');
var ABaseResponse = (function () {
    function ABaseResponse(request, resource) {
        this._request = request;
        this._resource = resource;
        this._isSilent = ABaseResponse.__isSilent(request);
        this._rootName = this._resource.options.name.singular;
    }
    ABaseResponse.__isSilent = function (request) {
        return request.query && request.query.silent === 'true';
    };
    ABaseResponse.prototype._replyRecord = function (res, responseCode) {
        if (this._isSilent) {
            this._reply().code(204);
        }
        else {
            if (!responseCode) {
                responseCode = 200;
            }
            var jsonRecords = new records_1.default(this._resource);
            jsonRecords.setData(res);
            var response = this._reply(jsonRecords.serialise());
            response.code(responseCode);
            response.header('content-type', 'application/json; charset=utf-8');
        }
    };
    ABaseResponse.prototype._createElementQuery = function () {
        var elementQuery = { _id: '' };
        var ifMatch = this._validator.getIfMatchValue();
        if (ifMatch) {
            elementQuery.__v = parseInt(ifMatch, 10);
        }
        if (this._request.params['id']) {
            elementQuery._id = this._request.params['id'];
        }
        return elementQuery;
    };
    ABaseResponse.prototype.reply = function (reply) {
        var _this = this;
        this._reply = reply;
        if (this._validator) {
            this._validator.validate(function (err) {
                _this._replyCallback(err);
            });
        }
        else {
            this._replyCallback();
        }
    };
    ABaseResponse.prototype._replyCallback = function (err) {
        throw new Error('ABaseResponse._replyCallback is abstract');
    };
    return ABaseResponse;
}());
exports.ABaseResponse = ABaseResponse;
//# sourceMappingURL=ABaseResponse.js.map