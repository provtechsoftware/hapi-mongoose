"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ABaseRequestValidator_1 = require('./ABaseRequestValidator');
var GetListRequestValidator = (function (_super) {
    __extends(GetListRequestValidator, _super);
    function GetListRequestValidator() {
        _super.apply(this, arguments);
    }
    GetListRequestValidator.prototype.validate = function (callback) {
        if (this._request.query.page) {
            if (typeof this._request.query.page !== 'object') {
                callback(new Error('invalid page'));
                return;
            }
            if (isNaN(+this._request.query.page.offset)) {
                callback(new Error('invalid page param'));
                return;
            }
            if (isNaN(+this._request.query.page.limit)) {
                callback(new Error('invalid page limit'));
                return;
            }
        }
        callback();
    };
    return GetListRequestValidator;
}(ABaseRequestValidator_1.ABaseRequestValidator));
exports.GetListRequestValidator = GetListRequestValidator;
//# sourceMappingURL=GetListRequestValidator.js.map