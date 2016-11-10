/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=boom
/// <reference path="../../../typings/boom/boom.d.ts"/> ///ts:ref:generated

import 'promise/polyfill';

import * as hapi from 'hapi';
import * as boom from 'boom';
import Resource from '../resource';
import * as Plugin from '../index';

import {GetResponse} from './GetResponse';
import {GetListRequestValidator} from './validators/validators';

export class GetListResponse extends GetResponse {
  protected _paginationQuery: {};

  constructor(request: hapi.Request, resource: Resource, query: {}, plugin: Plugin.HapiPlugin) {
    super(request, resource, resource.model.find(query, resource.options.fieldProjection), plugin);
    this._paginationQuery = query;
    this._validator = new GetListRequestValidator(this._request);

    this.__applyRange();
    this.__applySorting();
    this.__applyPagination();
  }


  private __applyRange: any = () => {
    // Range param have to be: range[date__gt]=<iso date string>
    if (this._request.query.range) {
      let rangeConditions = [];
      for (let key of this._request.query.range) {
        if (key.includes('__')) {
          let comps = key.split('__');
          let field = comps[0], op = comps[1];
          let value = this._request.query.range[key];
          if (field && op && value && this._resource.canSortBy(field)) {
            field = this._resource.unaliasKey(field);
            let cond = {};
            cond[field] = {};
            cond[field]['$' + op] = new Date(value);
            rangeConditions.push(cond);
          } else {
            this._lastError = boom.badRequest('bad range field');
          }
        }
      }
      if (rangeConditions.length > 1) {
        this._query.and(rangeConditions);
      } else if (rangeConditions.length === 1) {
        this._query.where(rangeConditions[0]);
      }
    }
  };

  private __applySorting: any = () => {
    if (this._request.query.sort) {
      if (this._resource.canSortBy(this._request.query.sort)) {
        let field = this._resource.unaliasKey(this._request.query.sort);
        this._query.sort(field);
      } else {
        this._lastError = boom.badRequest('bad sort field');
      }
    }
  };

  private __applyPagination(): void {
    let pageMeta: HashMapNumber = {
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

    this._syncQuery((callback: Function) => {
      this._resource.model.count(this._paginationQuery, (err: any, count: number) => {
        pageMeta['total'] = count;
        this._jsonRecords.addMeta('page', pageMeta);
        callback(err);
      });
    });
  }
}
