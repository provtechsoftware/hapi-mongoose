"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path = require('path');
var responses = require('../responses/responses');
var ABaseRoute_1 = require('./ABaseRoute');
var _ = require('lodash');
var GetListRoute = (function (_super) {
    __extends(GetListRoute, _super);
    function GetListRoute(basePath, resource, plugin) {
        var _this = this;
        _super.call(this, 'GET', basePath, resource, plugin, resource.options.auth.getList);
        this.path = path.join(basePath, this._resource.options.name.plural);
        this.handler = function (request, reply) {
            var queryObj = {};
            if (request.query['query']) {
                queryObj = _this.__updateObjectValues(request.query['query']);
            }
            if (request.query['ids']) {
                queryObj['_id'] = { '$in': request.query['ids'] };
            }
            if (request.query['search']) {
                queryObj['$text'] = { '$search': request.query['search'] };
            }
            var response = new responses.GetListResponse(request, resource, queryObj, plugin);
            response.reply(reply);
        };
    }
    GetListRoute.prototype.__updateObjectValues = function (obj) {
        var _this = this;
        var newObj = {};
        _.each(obj, function (value, key) {
            if (value === 'true') {
                newObj[key] = true;
            }
            else if (value === 'false') {
                newObj[key] = false;
            }
            else if (typeof value === 'object') {
                newObj[key] = _this.__updateObjectValues(value);
            }
            else {
                newObj[key] = value;
            }
        });
        return newObj;
    };
    return GetListRoute;
}(ABaseRoute_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GetListRoute;
//# sourceMappingURL=GetListRoute.js.map