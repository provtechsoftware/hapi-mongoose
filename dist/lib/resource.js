"use strict";
var routing = require('./routing/Routing');
var _ = require('lodash');
var Resource = (function () {
    function Resource(model, options) {
        var _this = this;
        this.model = model;
        var defaultExposeValue = true;
        if (options && options.exposed) {
            _.each(options.exposed, function (item) {
                defaultExposeValue = defaultExposeValue && !item;
            });
        }
        var defaultResourceOptions = {
            name: {
                singular: model.modelName,
                plural: model.modelName + 's'
            },
            methodAccess: {
                getList: true,
                getItem: true,
                post: true,
                put: true,
                patch: true,
                delete: true
            },
            alias: {
                _id: 'id'
            },
            exposed: this.__allExposed(defaultExposeValue),
            fieldProjection: {},
            pagination: {
                limit: 10
            },
            auth: {
                getList: false,
                getItem: false,
                post: false,
                put: false,
                patch: false,
                delete: false,
            }
        };
        if (options && options.name && typeof options.name === 'string') {
            var name_1 = options.name;
            options.name = {
                singular: name_1,
                plural: name_1 + 's'
            };
        }
        this.options = _.merge(defaultResourceOptions, options);
        _.each(this.options.exposed, function (value, key) {
            if (value === true) {
                _this.options.fieldProjection[key] = value;
            }
        });
        this.options.name.singular = this.options.name.singular.toLowerCase();
        this.options.name.plural = this.options.name.plural.toLowerCase();
    }
    Resource.prototype.bindRoutes = function (server, basePath) {
        var options = { basePath: basePath, resource: this, plugin: this.plugin };
        if (this.options.methodAccess.getList) {
            server.route(routing.getRoute(2, options));
        }
        if (this.options.methodAccess.getItem) {
            server.route(routing.getRoute(1, options));
        }
        if (this.options.methodAccess.post) {
            server.route(routing.getRoute(4, options));
        }
        if (this.options.methodAccess.put) {
            server.route(routing.getRoute(5, options));
        }
        if (this.options.methodAccess.patch) {
            server.route(routing.getRoute(3, options));
        }
        if (this.options.methodAccess.delete) {
            server.route(routing.getRoute(0, options));
        }
    };
    Resource.prototype.exportItem = function (item) {
        var _this = this;
        var exportedItem = {};
        _.each(item, function (value, key) {
            if (_this.isExposed(key)) {
                exportedItem[_this.aliasKey(key)] = value;
            }
        });
        return exportedItem;
    };
    Resource.prototype.importItem = function (item) {
        var _this = this;
        var importedItem = {};
        _.each(item, function (value, key) {
            var localKey = _this.unaliasKey(key);
            if (localKey !== '_id') {
                importedItem[localKey] = value;
            }
        });
        return importedItem;
    };
    ;
    Resource.prototype.canSortBy = function (key) {
        return this.areKeysValid([key]) || (key[0] === '-' && this.areKeysValid([key.substring(1)]));
    };
    Resource.prototype.areKeysValid = function (keys) {
        var _this = this;
        return _.reduce(keys, function (value, key) {
            return value && _this.isValidKey(key);
        }, true);
    };
    Resource.prototype.isValidKey = function (key) {
        if (key.indexOf('_') !== -1) {
            return false;
        }
        var unaliasedKey = this.unaliasKey(key);
        if (unaliasedKey !== key) {
            return this.isExposed(unaliasedKey);
        }
        else {
            return !this.isAliased(key) && this.isExposed(key);
        }
    };
    Resource.prototype.isExposed = function (key) {
        for (var exposeKey in this.options.exposed) {
            if (this.options.exposed.hasOwnProperty(exposeKey)) {
                if ((exposeKey === key || exposeKey.indexOf(key + '.') === 0) && this.options.exposed[exposeKey] === true) {
                    return true;
                }
            }
        }
        return false;
    };
    Resource.prototype.referencedCollection = function (key) {
        var path = this.model.schema.path(key);
        if (path && path.options && path.options.ref) {
            return path.options.ref;
        }
        if (path && path.caster && path.caster.options && path.caster.options.ref) {
            return path.caster.options.ref;
        }
        return null;
    };
    Resource.prototype.aliasKey = function (key) {
        return this.options.alias[key] ? this.options.alias[key] : key;
    };
    Resource.prototype.unaliasKey = function (key) {
        if (key[0] === '-') {
            return '-' + this.unaliasKey(key.substring(1));
        }
        else {
            var result = _.findKey(this.options.alias, function (value) {
                return value === key;
            });
            return result ? result : key;
        }
    };
    Resource.prototype.isAliased = function (key) {
        return typeof this.options.alias[key] === 'string';
    };
    Resource.prototype.__allExposed = function (value) {
        var projection = {};
        this.model.schema.eachPath(function (path, type) {
            projection[path] = value;
        });
        return projection;
    };
    return Resource;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Resource;
//# sourceMappingURL=resource.js.map