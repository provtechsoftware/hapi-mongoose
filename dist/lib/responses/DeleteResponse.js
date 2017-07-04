"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var boom = require('boom');
var ABaseResponse_1 = require('./ABaseResponse');
var validators = require('./validators/validators');
var DeleteResponse = (function (_super) {
    __extends(DeleteResponse, _super);
    function DeleteResponse(request, resource) {
        _super.call(this, request, resource);
        this._validator = new validators.IfMatchValidator(request);
    }
    DeleteResponse.prototype._replyCallback = function (err) {
        var _this = this;
        if (err) {
            this._reply(boom.badRequest(err.message, err));
            return;
        }
        var model = this._resource.model;
        var query = this._createElementQuery();
        model.findOneAndRemove(query, function (err, res) {
            if (err) {
                _this._reply(boom.badRequest(err.message, err));
            }
            else if (res) {
                _this._reply().code(204);
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
    return DeleteResponse;
}(ABaseResponse_1.ABaseResponse));
exports.DeleteResponse = DeleteResponse;
//# sourceMappingURL=DeleteResponse.js.map