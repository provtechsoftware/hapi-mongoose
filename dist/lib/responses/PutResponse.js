"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var boom = require('boom');
var ABaseResponse_1 = require('./ABaseResponse');
var validators = require('./validators/validators');
var PutResponse = (function (_super) {
    __extends(PutResponse, _super);
    function PutResponse(request, resource) {
        _super.call(this, request, resource);
        this._validator = new validators.UpdateValidator(request, resource);
    }
    PutResponse.prototype._replyCallback = function (err) {
        var _this = this;
        if (err) {
            this._reply(boom.badRequest(err.message, err));
            return;
        }
        var model = this._resource.model;
        var data = this._resource.importItem(this._request.payload[this._rootName]);
        model.schema.eachPath(function (path, type) {
            if (!data.hasOwnProperty(path) && ['__v', '_id'].indexOf(path) === -1 && _this._resource.isExposed(path)) {
                data[path] = null;
            }
        });
        var query = this._createElementQuery();
        model.findOneAndUpdate(query, data, { new: true }, function (err, res) {
            if (err) {
                return _this._reply(boom.badRequest(err.message, err));
            }
            if (res) {
                _this._replyRecord(res);
            }
            else if (query.__v) {
                var expandedQuery = { _id: query._id, __v: query.__v };
                _this._validator.checkVersion(model, expandedQuery, function (err) {
                    _this._reply(err);
                });
            }
            else {
                _this._reply(boom.notFound('Not Found.'));
            }
        });
    };
    return PutResponse;
}(ABaseResponse_1.ABaseResponse));
exports.PutResponse = PutResponse;
//# sourceMappingURL=PutResponse.js.map