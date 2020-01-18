"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
var ApkReader = require('node-apk-parser');
const { google } = require('googleapis');
exports.parseManifest = (apkPath) => __awaiter(void 0, void 0, void 0, function* () {
    if (apkPath) {
        console.log("release file..", apkPath);
        const reader = yield ApkReader.readFile(apkPath);
        const manifest = reader.readManifestSync();
        return {
            packageName: manifest.package,
            versionCode: manifest.versionCode
        };
    }
    else {
        throw new Error("Can not find apk path.");
    }
});
exports.checkFileExist = (path) => {
    console.log("checkFileExist file..", path);
    if (!path || !fs.existsSync(path)) {
        throw new Error(`Unable to find release file @ ${path}`);
    }
    else {
        return true;
    }
};
exports.createJWT = (keyJson) => {
    let authClientJwt = new google.auth.JWT(keyJson.client_email, null, keyJson.private_key, ['https://www.googleapis.com/auth/androidpublisher']);
    return authClientJwt;
};
exports.authenticate = (auth) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result = yield auth.authorize();
        let returnResult = (result && result.access_token) ? true : false;
        return returnResult;
    }
    catch (error) {
        throw new Error(`Error while authenticating with message ${error.message}`);
    }
});
exports.getKeys = () => {
    return ({
        "private_key": process.env.private_key || "",
        "client_email": process.env.client_email || ""
    });
};
//# sourceMappingURL=helpers.js.map