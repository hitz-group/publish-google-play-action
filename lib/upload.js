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
const googleapis_1 = require("googleapis");
const helpers_1 = require("./helpers");
class upload {
    constructor(client, options, releaseFile) {
        this.versionCode = [];
        this.client = client;
        this.apkManifest = options.apkManifest;
        this.editOptions = options;
        this.releaseFile = releaseFile;
        this.publisher = googleapis_1.google.androidpublisher({
            auth: client,
            version: "v3"
        });
    }
    setPublisher(publisher) {
        this.publisher = publisher;
    }
    uploadRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            //authenticating the jwt which we created.
            yield helpers_1.authenticate(this.client);
            //inserting into edit list.
            yield this.editDetails();
            //uploading apk file and creating tracks.
            let trackStatus = yield this.uploadAPKFiles();
            //committing the release with the edit id got from edit details.
            let commitStatus = yield this.commitRelease(trackStatus);
            console.log(`apk was uploaded to play store with commit id ${commitStatus.id}`);
            return commitStatus;
        });
    }
    editDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const appEdit = yield this.publisher.edits.insert({
                    packageName: this.apkManifest.packageName
                });
                this.appEditId = appEdit.data.id;
                return appEdit.data;
            }
            catch (error) {
                throw new Error(`Error while getting edit details ${error.message}`);
            }
        });
    }
    commitRelease(track) {
        return __awaiter(this, void 0, void 0, function* () {
            if (track != undefined) {
                const res = yield this.publisher.edits.commit({
                    auth: this.client,
                    editId: this.appEditId,
                    packageName: this.apkManifest.packageName
                });
                console.log(`Committed release with Id(${res.data.id}) and Track: ${track.track}.`);
                return res.data;
            }
            else {
                throw new Error("Error while upload files, can not find track details.");
            }
        });
    }
    uploadAPKFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            let track = undefined;
            if (this.releaseFile.endsWith(".apk")) {
                const apk = yield this.uploadApk();
                this.versionCode.push(apk.versionCode);
                track = yield this.trackVersionCode();
            }
            else {
                throw new Error("Invalid release file extension");
            }
            return track;
        });
    }
    uploadApk() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[${this.appEditId}, packageName=${this.apkManifest.packageName}]: Uploading APK @ ${this.releaseFile}`);
            const res = yield this.publisher.edits.apks.upload({
                auth: this.client,
                packageName: this.apkManifest.packageName,
                editId: this.appEditId,
                media: {
                    mimeType: "application/vnd.android.package-archive",
                    body: fs.createReadStream(this.releaseFile)
                }
            });
            return res.data;
        });
    }
    trackVersionCode() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Creating Track Release for Edit(${this.appEditId}) for Track(${this.editOptions.track}) and VersionCode(${this.versionCode})`);
            const res = yield this.publisher.edits.tracks.update({
                auth: this.client,
                editId: this.appEditId,
                packageName: this.apkManifest.packageName,
                track: this.editOptions.track,
                requestBody: {
                    releases: [
                        {
                            status: "completed",
                            releaseNotes: this.editOptions.releaseNotes,
                            versionCodes: this.versionCode
                        }
                    ]
                }
            });
            return res.data;
        });
    }
}
exports.upload = upload;
//# sourceMappingURL=upload.js.map