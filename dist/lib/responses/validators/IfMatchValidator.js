"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var validators = require('./ABaseRequestValidator');
var boom = require('boom');
var IfMatchValidator = (function (_super) {
    __extends(IfMatchValidator, _super);
    function IfMatchValidator(request) {
        _super.call(this, request);
    }
    IfMatchValidator.prototype.validate = function (callback) {
        if (!this._validateIfMatchFormatIfExist()) {
            callback(new Error('Invalid if-match header'));
            return;
        }
        callback();
    };
    IfMatchValidator.prototype.checkVersion = function (model, query, callback) {
        model.findById(query._id, function (err, res) {
            if (err) {
                callback(boom.badRequest(err.message, err));
            }
            else if (res && res.__v !== query.__v) {
                callback(boom.preconditionFailed('Precondition failed.'));
            }
            else {
                callback(boom.notFound('Not found.'));
            }
        });
    };
    IfMatchValidator.prototype._validateIfMatchFormatIfExist = function () {
        var ifMatch = this.getIfMatchValue();
        if (ifMatch === null) {
            return true;
        }
        return ifMatch && !isNaN(+ifMatch);
    };
    return IfMatchValidator;
}(validators.ABaseRequestValidator));
exports.IfMatchValidator = IfMatchValidator;
//# sourceMappingURL=IfMatchValidator.js.map