/// ts:ref=mongoose
/// <reference path="../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated

import * as mongoose from 'mongoose';
import * as hapi from 'hapi';
import * as routing from './routing/Routing';
import {HapiPlugin} from './index';
import * as _ from 'lodash';

export default class Resource {
  public model: mongoose.Model<mongoose.Document>;
  public options: IResourceOptionsExpanded;
  public plugin: HapiPlugin;

  constructor(model: mongoose.Model<mongoose.Document>, options?: IResourceOptions) {
    this.model = model;
    let defaultExposeValue = true;

    if (options && options.exposed) {
      _.each(options.exposed, (item: any) => {
        defaultExposeValue = defaultExposeValue && !item;
      });
    }

    let defaultResourceOptions: IResourceOptions = {
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
      let name: string = <string>options.name;
      options.name = {
        singular: name,
        plural: name + 's'
      };
    }

    this.options = <IResourceOptionsExpanded>_.merge(defaultResourceOptions, options);

    _.each(this.options.exposed, (value: boolean, key: string) => {
      if (value === true) {
        this.options.fieldProjection[key] = value;
      }
    });
    this.options.name.singular = this.options.name.singular.toLowerCase();
    this.options.name.plural = this.options.name.plural.toLowerCase();
  }

  bindRoutes(server: hapi.Server, basePath: string): void {
    var options = { basePath: basePath, resource: this, plugin: this.plugin };

    if (this.options.methodAccess.getList) {
      server.route(routing.getRoute(routing.Method.GetList, options));
    }

    if (this.options.methodAccess.getItem) {
      server.route(routing.getRoute(routing.Method.Get, options));
    }

    if (this.options.methodAccess.post) {
      server.route(routing.getRoute(routing.Method.Post, options));
    }

    if (this.options.methodAccess.put) {
      server.route(routing.getRoute(routing.Method.Put, options));
    }

    if (this.options.methodAccess.patch) {
      server.route(routing.getRoute(routing.Method.Patch, options));
    }

    if (this.options.methodAccess.delete) {
      server.route(routing.getRoute(routing.Method.Delete, options));
    }
  }

  exportItem(item: any): any {
    let exportedItem = {};

    _.each(item, (value: any, key: string) => {
      if (this.isExposed(key)) {
        exportedItem[this.aliasKey(key)] = value;
      }
    });

    return exportedItem;
  }

  importItem(item: any): any {
    let importedItem = {};

    _.each(item, (value: any, key: string) => {
      let localKey = this.unaliasKey(key);
      if (localKey !== '_id') {
        importedItem[localKey] = value;
      }
    });

    return importedItem;
  };

  canSortBy(key: string): boolean {
    return this.areKeysValid([key]) || (key[0] === '-' && this.areKeysValid([key.substring(1)]));
  }

  areKeysValid(keys: Array<string>): boolean {
    return _.reduce<string, boolean>(
      keys,
      (value: boolean, key: string): boolean => {
        return value && this.isValidKey(key);
      },
      true);
  }

  isValidKey(key: string): boolean {
    if (key.indexOf('_') !== -1) {
      return false;
    }
    var unaliasedKey = this.unaliasKey(key);
    if (unaliasedKey !== key) {
      return this.isExposed(unaliasedKey);
    } else {
      return !this.isAliased(key) && this.isExposed(key);
    }
  }

  isExposed(key: string): boolean {
    for (let exposeKey in this.options.exposed) {
      if (this.options.exposed.hasOwnProperty(exposeKey)) {
        if ((exposeKey === key || exposeKey.indexOf(key + '.') === 0) && this.options.exposed[exposeKey] === true) {
          return true;
        }
      }
    }
    return false;
  }

  referencedCollection(key: string): string {
    let path = this.model.schema.path(key);

    if (path && path.options && path.options.ref) {
      return path.options.ref;
    }

    if (path && path.caster && path.caster.options && path.caster.options.ref) {
      return path.caster.options.ref;
    }

    return null;
  }

  aliasKey(key: string): string {
    return this.options.alias[key] ? this.options.alias[key] : key;
  }

  unaliasKey(key: string): string {
    if (key[0] === '-') {
      return '-' + this.unaliasKey(key.substring(1));
    } else {
      let result = _.findKey(this.options.alias, (value: string): boolean => {
        return value === key;
      });

      return result ? result : key;
    }
  }

  isAliased(key: string): boolean {
    return typeof this.options.alias[key] === 'string';
  }

  private __allExposed(value: boolean): any {
    let projection = {};

    this.model.schema.eachPath((path: string, type: any) => {
      projection[path] = value;
    });

    return projection;
  }
}
