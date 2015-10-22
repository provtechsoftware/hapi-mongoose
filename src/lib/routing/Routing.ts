/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated

import ABaseRoute from './ABaseRoute';
import DeleteRoute from './DeleteRoute';
import GetRoute from './GetRoute';
import GetListRoute from './GetListRoute';
import PatchRoute from './PatchRoute';
import PostRoute from './PostRoute';
import PutRoute from './PutRoute';
import Resource from '../resource';

import {HapiPlugin} from '../index';

import * as hapi from 'hapi';

export const enum Method {Delete, Get, GetList, Patch, Post, Put};

export function getRoute(method: Method, options: {basePath: string, resource: Resource, plugin: HapiPlugin}): hapi.IRouteConfiguration {
  'use strict';

  let route: ABaseRoute;

  switch (method) {
    case Method.Delete:
      route = new DeleteRoute(options.basePath, options.resource, options.plugin);
      break;

    case Method.Get:
      route = new GetRoute(options.basePath, options.resource, options.plugin);
      break;

    case Method.GetList:
      route = new GetListRoute(options.basePath, options.resource, options.plugin);
      break;

    case Method.Patch:
      route = new PatchRoute(options.basePath, options.resource, options.plugin);
      break;

    case Method.Post:
      route = new PostRoute(options.basePath, options.resource, options.plugin);
      break;

    case Method.Put:
      route = new PutRoute(options.basePath, options.resource, options.plugin);
      break;

    default:
      throw new Error('unknown method');
  }

  return route.getRoute();
}
