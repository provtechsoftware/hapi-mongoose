"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var responses = require('../responses/responses');
var ABaseRoute_1 = require('./ABaseRoute');
var PatchRoute = (function (_super) {
    __extends(PatchRoute, _super);
    function PatchRoute(basePath, resource, plugin) {
        _super.call(this, 'PATCH', basePath, resource, plugin, resource.options.auth.getList);
        this.path = path.join(basePath, this._resource.options.name.plural, '{id}');
        this.handler = function (request, reply) {
            var response = new responses.PatchResponse(request, resource);
            response.reply(reply);
        };
    }
    return PatchRoute;
}(ABaseRoute_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatchRoute;
;
//# sourceMappingURL=PatchRoute.js.map