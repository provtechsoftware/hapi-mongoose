"use strict";
var DeleteRoute_1 = require('./DeleteRoute');
var GetRoute_1 = require('./GetRoute');
var GetListRoute_1 = require('./GetListRoute');
var PatchRoute_1 = require('./PatchRoute');
var PostRoute_1 = require('./PostRoute');
var PutRoute_1 = require('./PutRoute');
(function (Method) {
    Method[Method["Delete"] = 0] = "Delete";
    Method[Method["Get"] = 1] = "Get";
    Method[Method["GetList"] = 2] = "GetList";
    Method[Method["Patch"] = 3] = "Patch";
    Method[Method["Post"] = 4] = "Post";
    Method[Method["Put"] = 5] = "Put";
})(exports.Method || (exports.Method = {}));
var Method = exports.Method;
;
function getRoute(method, options) {
    'use strict';
    var route;
    switch (method) {
        case 0:
            route = new DeleteRoute_1.default(options.basePath, options.resource, options.plugin);
            break;
        case 1:
            route = new GetRoute_1.default(options.basePath, options.resource, options.plugin);
            break;
        case 2:
            route = new GetListRoute_1.default(options.basePath, options.resource, options.plugin);
            break;
        case 3:
            route = new PatchRoute_1.default(options.basePath, options.resource, options.plugin);
            break;
        case 4:
            route = new PostRoute_1.default(options.basePath, options.resource, options.plugin);
            break;
        case 5:
            route = new PutRoute_1.default(options.basePath, options.resource, options.plugin);
            break;
        default:
            throw new Error('unknown method');
    }
    return route.getRoute();
}
exports.getRoute = getRoute;
//# sourceMappingURL=Routing.js.map