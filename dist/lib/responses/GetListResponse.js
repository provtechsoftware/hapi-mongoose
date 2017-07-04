"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require('promise/polyfill');
var boom = require('boom');
var GetResponse_1 = require('./GetResponse');
var validators_1 = require('./validators/validators');
var GetListResponse = (function (_super) {
    __extends(GetListResponse, _super);
    function GetListResponse(request, resource, query, plugin) {
        var _this = this;
        _super.call(this, request, resource, resource.model.find(query, resource.options.fieldProjection), plugin);
        this.__applySorting = function () {
            if (_this._request.query.sort) {
                if (_this._resource.canSortBy(_this._request.query.sort)) {
                    var field = _this._resource.unaliasKey(_this._request.query.sort);
                    _this._query.sort(field);
                }
                else {
                    _this._lastError = boom.badRequest('bad sort field');
                }
            }
        };
        this._paginationQuery = query;
        this._validator = new validators_1.GetListRequestValidator(this._request);
        this.__applySorting();
        this.__applyPagination();
    }
    GetListResponse.prototype.__applyPagination = function () {
        var _this = this;
        var pageMeta = {
            offset: 0,
            limit: this._resource.options.pagination.limit,
            total: 0
        };
        if (this._request.query.page) {
            if (typeof this._request.query.page !== 'object') {
                this._lastError = boom.badRequest('invalid page');
                return;
            }
            if (this._request.query.page.offset) {
                pageMeta['offset'] = parseInt(this._request.query.page.offset, 10);
            }
            if (this._request.query.page.limit) {
                pageMeta['limit'] = parseInt(this._request.query.page.limit, 10);
            }
        }
        this._query.skip(pageMeta['offset']);
        this._query.limit(pageMeta['limit']);
        this._syncQuery(function (callback) {
            _this._resource.model.count(_this._paginationQuery, function (err, count) {
                pageMeta['total'] = count;
                _this._jsonRecords.addMeta('page', pageMeta);
                callback(err);
            });
        });
    };
    return GetListResponse;
}(GetResponse_1.GetResponse));
exports.GetListResponse = GetListResponse;
//# sourceMappingURL=GetListResponse.js.map