"use strict";
require('promise/polyfill');
var Hapi = require('hapi');
var mongoose = require('mongoose');
var should = require('should');
var HapiMongoose = require('../lib/index');
mongoose.connect('mongodb://localhost/test');
var ServerResponse = (function () {
    function ServerResponse() {
        this.__stack = [];
        this.__canUnwind = false;
    }
    ServerResponse.prototype.resolve = function (res) {
        this.__res = res;
        this.__canUnwind = true;
        if (this.__done) {
            this.__unwind();
        }
    };
    ServerResponse.prototype.thenStatusCodeShouldEqual = function (code) {
        return this.then(function (res, done) {
            res.statusCode.should.equal(code);
            done();
        });
    };
    ServerResponse.prototype.thenCheckBody = function (handler) {
        return this.then(function (res, done) {
            handler(res.result, done);
        });
    };
    ServerResponse.prototype.thenBodyShouldBeEmpty = function () {
        return this.then(function (res, done) {
            should.not.exist(res.result);
            done();
        });
    };
    ServerResponse.prototype.thenContentTypeShouldBe = function (type) {
        return this.then(function (res, done) {
            res.headers['content-type'].should.equal(type);
            done();
        });
    };
    ServerResponse.prototype.then = function (callback) {
        this.__stack.push(callback);
        return this;
    };
    ServerResponse.prototype.end = function (done) {
        this.__done = done;
        if (this.__canUnwind) {
            this.__unwind();
        }
    };
    ServerResponse.prototype.__unwind = function (index) {
        var _this = this;
        index = !index ? 0 : index;
        var done = function (err) {
            _this.__unwind(index + 1);
        };
        try {
            if (index < this.__stack.length) {
                this.__stack[index](this.__res, done);
            }
            else {
                this.__done();
            }
        }
        catch (err) {
            this.__done(err);
        }
    };
    return ServerResponse;
}());
exports.ServerResponse = ServerResponse;
var ServerRequest = (function () {
    function ServerRequest(server) {
        var _this = this;
        this.payload = function (name, value) {
            _this.__payload[name] = value;
            return _this;
        };
        this.header = function (name, value) {
            _this.__headers[name] = value;
            return _this;
        };
        this.get = function (url, callback) {
            return _this.send(url, 'GET');
        };
        this.post = function (url) {
            return _this.send(url, 'POST');
        };
        this.put = function (url) {
            return _this.send(url, 'PUT');
        };
        this.patch = function (url) {
            return _this.send(url, 'PATCH');
        };
        this.delete = function (url, headers) {
            return _this.send(url, 'DELETE');
        };
        this.send = function (url, method) {
            _this.__server.inject({ url: url,
                method: method,
                payload: _this.__payload,
                headers: _this.__headers
            }, function (res) {
                _this.__payload = {};
                _this.__headers = {};
                _this.__response.resolve(res);
            });
            return _this.__response;
        };
        this.__response = new ServerResponse();
        this.__payload = {};
        this.__headers = {};
        this.__server = server;
    }
    return ServerRequest;
}());
exports.ServerRequest = ServerRequest;
var Server = (function () {
    function Server() {
        var _this = this;
        this.register = function (plugins, callback) {
            _this.__server.register(plugins, callback);
        };
        this.start = function (callback) {
            _this.__server.start(callback);
        };
        this.stop = function (callback) {
            _this.__server.stop(callback);
        };
        this.createRequest = function () {
            return new ServerRequest(_this.__server);
        };
        this.__server = new Hapi.Server();
        this.__server.connection({ port: 3000 });
    }
    return Server;
}());
exports.Server = Server;
exports.create = function (options) {
    var server = new Server();
    return new Promise(function (resolve, reject) {
        server.start(function () {
            var plugin = new HapiMongoose.HapiPlugin();
            server.register({ register: plugin,
                options: options
            }, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(server);
                }
            });
        });
    });
};
//# sourceMappingURL=testServer.js.map