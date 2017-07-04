"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var responses = require('../responses/responses');
var ABaseRoute_1 = require('./ABaseRoute');
var GetRoute = (function (_super) {
    __extends(GetRoute, _super);
    function GetRoute(basePath, resource, plugin) {
        var _this = this;
        _super.call(this, 'GET', basePath, resource, plugin, resource.options.auth.getList);
        this.path = path.join(basePath, resource.options.name.plural, '{id}');
        this.handler = function (request, reply) {
            var query = _this._model.findById(request.params['id'], resource.options.fieldProjection);
            var response = new responses.GetResponse(request, resource, query, plugin);
            response.reply(reply);
        };
    }
    return GetRoute;
}(ABaseRoute_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GetRoute;
;
//# sourceMappingURL=GetRoute.js.map