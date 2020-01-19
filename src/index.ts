import {upload} from "./upload";

import { androidpublisher_v3 }  from "googleapis";

import LocalizedText = androidpublisher_v3.Schema$LocalizedText;

import {parseManifest, IPackageManifest, checkFileExist, createJWT, getKeys} from './helpers';

import * as core from '@actions/core';

export async function run() {
    try {

        let keyJson = getKeys();

        const releaseNotesFromInputs = core.getInput('releaseNotes', { required: true });

        const releaseNotes:LocalizedText = {
            language:"en-US",
            text:releaseNotesFromInputs
        }

        const releaseFile = core.getInput('releaseFilePath', { required: true });

        const track  = core.getInput('track', { required: true });

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