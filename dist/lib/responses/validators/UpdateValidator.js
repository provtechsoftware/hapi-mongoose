"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var validators = require('./validators');
var UpdateValidator = (function (_super) {
    __extends(UpdateValidator, _super);
    function UpdateValidator(request, resource) {
        _super.call(this, request);
        this._resource = resource;
        this._rootName = this._resource.options.name.singular;
        this._ifMatchValidator = new validators.IfMatchValidator(request);
    }
    UpdateValidator.prototype.validate = function (callback) {
        var _this = this;
        this._ifMatchValidator.validate(function (err) {
            if (err) {
                callback(err);
                return;
            }
            if (!_this._request.payload[_this._rootName]) {
                callback(new Error('root key is missing'));
                return;
            }
            if (!_this._resource.areKeysValid(Object.keys(_this._request.payload[_this._rootName]))) {
                callback(new Error('Invalid keys'));
                return;
            }
            callback();
        });
    };
    UpdateValidator.prototype.checkVersion = function (model, query, callback) {
        this._ifMatchValidator.checkVersion(model, query, callback);
    };
    return UpdateValidator;
}(validators.ABaseRequestValidator));
exports.UpdateValidator = UpdateValidator;
//# sourceMappingURL=UpdateValidator.js.map