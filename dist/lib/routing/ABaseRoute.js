"use strict";
var ABaseRoute = (function () {
    function ABaseRoute(method, basePath, resource, plugin, auth) {
        this.method = method;
        this._model = resource.model;
        this._resource = resource;
        this.auth = auth;
    }
    ABaseRoute.prototype.handler = function (request, reply) {
        throw new Error('ABaseRoute.handler is abstract');
    };
    ABaseRoute.prototype.getRoute = function () {
        return {
            method: this.method,
            path: this.path,
            handler: this.handler,
            config: {
                auth: this.auth
            }
        };
    };
    return ABaseRoute;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ABaseRoute;
//# sourceMappingURL=ABaseRoute.js.map