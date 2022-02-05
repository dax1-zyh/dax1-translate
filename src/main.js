"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const querystring = __importStar(require("querystring"));
const private_1 = require("./private");
const md5 = require("md5");
const errorMap = {
    52001: "请求超时",
    52002: "系统错误",
    52003: "未授权用户",
    54000: "必填参数为空",
    54001: "签名错误",
    54003: "访问频率受限",
    54004: "账户余额不足",
    54005: "长query请求频繁",
    58000: "客户端IP非法",
    58001: "译文语言方向不支持",
    58002: "服务当前已关闭",
    90107: '认证未通过或未生效'
};
const translate = (word) => {
    const salt = Math.random();
    const sign = md5(private_1.appid + word + salt + private_1.appSecret);
    let from, to;
    if (/[a-zA-Z]/.test(word[0])) {
        // 英译为中
        from = 'en';
        to = 'zh';
    }
    else {
        // 中译为英
        from = 'zh';
        to = 'en';
    }
    const query = querystring.stringify({
        q: word, from, to, appid: private_1.appid, salt, sign
    });
    const https = require('https');
    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET'
    };
    const request = https.request(options, (response) => {
        let chunks = [];
        response.on('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            const string = Buffer.concat(chunks).toString();
            const object = JSON.parse(string);
            if (object.error_code) {
                if (object.error_code in errorMap) {
                    console.error(errorMap[object.error_code] || object.error_msg);
                }
                process.exit(2);
            }
            else {
                object.trans_result.map(obj => {
                    console.log(obj.dst);
                });
                process.exit(0);
            }
        });
    });
    request.on('error', (e) => {
        console.error(e);
    });
    request.end();
};
exports.translate = translate;
