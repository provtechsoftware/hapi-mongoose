"use strict";
var ABaseRequestValidator = (function () {
    function ABaseRequestValidator(request) {
        this._request = request;
    }
    ABaseRequestValidator.prototype.validate = function (callback) {
        throw new Error('ABaseRequestValidator.validate is abstract');
    };
    ;
    ABaseRequestValidator.prototype.getIfMatchValue = function () {
        var ifMatch = this._request.headers['if-match'];
        if (typeof ifMatch === 'string') {
            var versionTags = ifMatch.match(/"v:([a-zA-Z0-9]+)"/);
            if (versionTags !== null && versionTags.length > 0) {
                return versionTags[1];
            }
        }
        return null;
    };
    return ABaseRequestValidator;
}());
exports.ABaseRequestValidator = ABaseRequestValidator;
//# sourceMappingURL=ABaseRequestValidator.js.map