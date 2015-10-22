/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=boom
/// <reference path="../../../typings/boom/boom.d.ts"/> ///ts:ref:generated

import 'promise/polyfill';

import * as hapi from 'hapi';
import * as mongoose from 'mongoose';
import * as boom from 'boom';
import Resource from '../resource';
import Records from '../records';
import * as Plugin from '../index';
import * as _ from 'lodash';

import {ABaseResponse} from './ABaseResponse';

export class GetResponse extends ABaseResponse {
  protected _query: mongoose.Query<any>;
  protected _jsonRecords: Records<any>;
  protected _queryCount: number;
  protected _queryExecuted: number;
  protected _lastError: any;

  constructor(request: hapi.Request, resource: Resource, query: mongoose.Query<any>, plugin: Plugin.HapiPlugin) {
    super(request, resource);
    this._query = query;
    this._plugin = plugin;
    this._jsonRecords = new Records<any>(this._resource);
    this._queryCount = 0;
    this._queryExecuted = 0;
  }

  protected _replyCallback(err?: Error): void {
    if (err) {
      this._lastError = boom.badRequest(err.message, err);
    }

    this._syncQuery((callback: Function) => {
      this._query.exec((err: any, result: any) => {
        if (err) {
          callback(boom.badRequest(err.message, err));
        } else if (!result) {
          callback(boom.notFound());
        } else {
          this._jsonRecords.setData(result);
          this.__applyProjection(callback);
        }
      });
    });
  }

  protected _syncQuery(queryFunction: Function): void {
    this._queryCount++;

    queryFunction((err: any) => {
      if (err) {
        this._lastError = err;
      }

      this._queryExecuted++;
      if (this._queryExecuted === this._queryCount) {
        this.__flush();
      }
    });
  }

  private __flush(): void {
    if (this._lastError) {
      this._reply(this._lastError);
    } else {
      this._reply(this._jsonRecords.serialise()).header('content-type', 'application/json; charset=utf-8');
    }
  }

  private __applyProjection(callback: Function): void {
    let err;

    if (this._request.query && this._request.query.project) {
      let projectedFields = this._request.query.project.split(',');
      let projectedResources: Resource[] = this.__relatedResources(projectedFields);

      _.each(projectedResources, (projectedResource: Resource, i: number): void => {
        if (projectedResource) {
          this.__addProjection(projectedFields[i], projectedResource);
        } else {
          err = boom.badRequest('Bad projection:`' + projectedFields[i] + '`');
        }
      });
    }

    callback(err);
  }

  private __relatedResources(projectedFields: string[]): Resource[] {
   return _.map(projectedFields, (field: string): Resource => {
      let referencedCollection = this._resource.referencedCollection(field);
      return this._plugin.getResourceFor(referencedCollection);
    });
  }

  private __addProjection(projectedField: string, projectedResource: Resource): void {
    let value = _.flatten(this._jsonRecords.value(projectedField));

    this._syncQuery((callback: Function) => {
      projectedResource.model.find({ _id: { $in: value } }, (err: any, result: any) => {
        var exportedItems = _.map(result, (value: mongoose.Document) => {
          return projectedResource.exportItem(value.toObject());
        });

        this._jsonRecords.addProjection(projectedField, exportedItems);
        callback(err);
      });
    });
  }
}
