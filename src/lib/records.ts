/// ts:ref=mongoose
/// <reference path="../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated

import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import Resource from './resource';

export default class Records<T extends mongoose.Document> {
  private __root: any = {};
  private __data: T|Array<T>;
  private __meta: { [key: string]: HashMapPrimitive };
  private __rootName: string;
  private __resource: Resource;

  constructor(resource: Resource) {
    this.__resource = resource;
    this.__meta = {};
  }

  setData(data: T|Array<T>): void {
    this.__data = data;
    this.__rootName = data instanceof Array ? this.__resource.options.name.plural : this.__resource.options.name.singular;
  }

  addProjection(key: string, data: T|Array<T>): void {
    this.__root[key] = data;
  }

  addMeta(key: string, data: HashMapPrimitive): void {
    this.__meta[key] = data;
  }

  value(key: string): any {
    if (this.__data instanceof Array) {
      let list = [];
      _.each(this.__data, (item: any) => {
        list.push(item[key]);
      });

      return list;
    } else {
      return [this.__data[key]];
    }
  }

  serialise(): string {
    if (this.__data instanceof Array) {
      let list = [];

      _.each(<T[]>this.__data, (value: T) => {
        list.push(this.__resource.exportItem(value.toObject()));
      });

      this.addProjection(this.__rootName, list);
    } else if (this.__data) {
      this.addProjection(this.__rootName, this.__resource.exportItem((<T>this.__data).toObject()));
    }

    if (Object.keys(this.__meta).length > 0) {
      this.__root['meta'] = this.__meta;
    }

    return JSON.stringify(this.__root, this.__jsonReplacer);
  }

  private __jsonReplacer(key: string, value: any): boolean {
    return key[0] === '_' ? undefined : value;
  }
};
