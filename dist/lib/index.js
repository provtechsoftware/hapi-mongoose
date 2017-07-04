"use strict";
var _ = require('lodash');
var resource_1 = require('./resource');
var HapiPlugin = (function () {
    function HapiPlugin() {
        var _this = this;
        this.__resources = [];
        this.__path = '/';
        this.register = function (server, options, next) {
            if (options.path) {
                _this.__path = options.path;
            }
            _this.__resources = HapiPlugin.__castResources(options.resources);
            _.each(_this.__resources, function (resource) {
                resource.plugin = _this;
            });
            server.bind(_this);
            _this.__register(server);
            next();
        };
        this.errorInit = function (error) {
            if (error) {
                console.log('Error: Failed to load plugin (hapiMongoose):', error);
            }
        };
        this.getResourceFor = function (modelName) {
            var result;
            _.each(_this.__resources, function (item) {
                if (item.model.modelName === modelName) {
                    result = item;
                }
            });
            return result;
        };
        this.__register = function (server) {
            _.each(_this.__resources, function (resource) {
                resource.bindRoutes(server, _this.__path);
            });
        };
        var pkg = require('../../package.json');
        this.register.attributes = {
            name: pkg.name,
            version: pkg.version
        };
    }
    HapiPlugin.__castResources = function (resources) {
        return _.map(resources, function (item) {
            var result;
            if (item instanceof resource_1.default) {
                result = item;
            }
            else {
                result = new resource_1.default(item);
            }
            return result;
        });
    };
    return HapiPlugin;
}());
exports.HapiPlugin = HapiPlugin;
//# sourceMappingURL=index.js.map