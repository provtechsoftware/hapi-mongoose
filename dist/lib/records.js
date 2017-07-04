"use strict";
var _ = require('lodash');
var Records = (function () {
    function Records(resource) {
        this.__root = {};
        this.__resource = resource;
        this.__meta = {};
    }
    Records.prototype.setData = function (data) {
        this.__data = data;
        this.__rootName = data instanceof Array ? this.__resource.options.name.plural : this.__resource.options.name.singular;
    };
    Records.prototype.addProjection = function (key, data) {
        this.__root[key] = data;
    };
    Records.prototype.addMeta = function (key, data) {
        this.__meta[key] = data;
    };
    Records.prototype.value = function (key) {
        if (this.__data instanceof Array) {
            var list_1 = [];
            _.each(this.__data, function (item) {
                list_1.push(item[key]);
            });
            return list_1;
        }
        else {
            return [this.__data[key]];
        }
    };
    Records.prototype.serialise = function () {
        var _this = this;
        if (this.__data instanceof Array) {
            var list_2 = [];
            _.each(this.__data, function (value) {
                list_2.push(_this.__resource.exportItem(value.toObject()));
            });
            this.addProjection(this.__rootName, list_2);
        }
        else if (this.__data) {
            this.addProjection(this.__rootName, this.__resource.exportItem(this.__data.toObject()));
        }
        if (Object.keys(this.__meta).length > 0) {
            this.__root['meta'] = this.__meta;
        }
        return JSON.stringify(this.__root, this.__jsonReplacer);
    };
    Records.prototype.__jsonReplacer = function (key, value) {
        return key[0] === '_' ? undefined : value;
    };
    return Records;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Records;
;
//# sourceMappingURL=records.js.map