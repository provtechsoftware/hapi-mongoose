"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var boom = require('boom');
var ABaseResponse_1 = require('./ABaseResponse');
var validators = require('./validators/validators');
var PatchResponse = (function (_super) {
    __extends(PatchResponse, _super);
    function PatchResponse(request, resource) {
        _super.call(this, request, resource);
        this._validator = new validators.UpdateValidator(request, resource);
    }
    PatchResponse.prototype._replyCallback = function (err) {
        var _this = this;
        if (err) {
            this._reply(boom.badRequest(err.message, err));
            return;
        }
        var model = this._resource.model;
        var data = this._resource.importItem(this._request.payload[this._rootName]);
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
    return PatchResponse;
}(ABaseResponse_1.ABaseResponse));
exports.PatchResponse = PatchResponse;
//# sourceMappingURL=PatchResponse.js.map