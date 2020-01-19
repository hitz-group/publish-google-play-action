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
const upload_1 = require("./upload");
const helpers_1 = require("./helpers");
const core = require("@actions/core");
require('dotenv').config();
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let keyJson = helpers_1.getKeys();
            const releaseNotesFromInputs = core.getInput('releaseNotes', { required: true });
            const releaseNotes = {
                language: "en-US",
                text: releaseNotesFromInputs
            };
            const releaseFile = core.getInput('releaseFilePath', { required: true });
            const track = core.getInput('track', { required: true });
            helpers_1.checkFileExist(releaseFile);
            let manifestDetails = yield helpers_1.parseManifest(releaseFile);
            const authClient = helpers_1.createJWT(keyJson);
            let editOptions = {
                apkManifest: manifestDetails,
                track: track,
                releaseNotes: [releaseNotes],
            };
            let uploadObj = new upload_1.upload(authClient, editOptions, releaseFile);
            yield uploadObj.uploadRelease();
            console.log(`Finished uploading ${releaseFile} to the Play Store`);
        }
        catch (error) {
            console.log(error.message);
        }
    });
}
exports.run = run;
run();
//# sourceMappingURL=index.js.map