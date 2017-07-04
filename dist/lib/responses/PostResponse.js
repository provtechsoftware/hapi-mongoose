"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var boom = require('boom');
var ABaseResponse_1 = require('./ABaseResponse');
var PostResponse = (function (_super) {
    __extends(PostResponse, _super);
    function PostResponse() {
        _super.apply(this, arguments);
    }
    PostResponse.prototype.reply = function (reply) {
        var _this = this;
        if (this._resource.areKeysValid(Object.keys(this._request.payload[this._rootName]))) {
            this._reply = reply;
            var data = this._resource.importItem(this._request.payload[this._rootName]);
            var item = new this._resource.model(data);
            item.save(function (err, record) {
                if (err) {
                    return reply(boom.badRequest('Can\'t create record.', err));
                }
                _this._replyRecord(record, 201);
            });
        }
        else {
            reply(boom.badRequest('Invalid keys.'));
        }
    };
    return PostResponse;
}(ABaseResponse_1.ABaseResponse));
exports.PostResponse = PostResponse;
//# sourceMappingURL=PostResponse.js.map