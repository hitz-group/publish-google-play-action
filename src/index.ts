import {upload} from "./upload";

import { androidpublisher_v3 }  from "googleapis";

import LocalizedText = androidpublisher_v3.Schema$LocalizedText;

import {parseManifest, IPackageManifest, checkFileExist, createJWT, getKeys} from './helpers';

require('dotenv').config();

export async function run() {
    try {

        let keyJson = getKeys();

        const releaseNotes:LocalizedText = {
            language:"en-US",
            text:process.env.releaseNotes
        }

        const releaseFile = process.env.releaseFilePath || "";

        const track  = process.env.track;

        checkFileExist(releaseFile);

        let manifestDetails:IPackageManifest = await parseManifest(releaseFile);
    
        const authClient = createJWT(keyJson);

        let editOptions = {
            apkManifest: manifestDetails,
            track: track,
            releaseNotes: [releaseNotes],
        }
        
        let uploadObj = new upload(authClient, editOptions, releaseFile );

        await uploadObj.uploadRelease();

        console.log(`Finished uploading ${releaseFile} to the Play Store`)
        
    } catch (error) {

        console.log(error.message);

    }
}

run();