import * as fs from "fs";
import {google} from 'googleapis';
import { androidpublisher_v3}  from "googleapis";
import {JWT} from "google-auth-library/build/src/auth/jwtclient";
import {IPackageManifest} from './helpers';
import {authenticate,EditOptions} from "./helpers";

import AndroidPublisher = androidpublisher_v3.Androidpublisher
import AppEdit = androidpublisher_v3.Schema$AppEdit;
import Apk = androidpublisher_v3.Schema$Apk;
import LocalizedText = androidpublisher_v3.Schema$LocalizedText;
import Track = androidpublisher_v3.Schema$Track;

export class upload{

    private publisher: AndroidPublisher;

    private client: JWT;

    public editOptions: EditOptions;

    public releaseFile: string;

    private versionCode: any[] = [];

    private appEditId ?: string | null;

    public apkManifest:IPackageManifest;

    constructor(client: JWT,options: EditOptions, releaseFile: string){

        this.client = client;

        this.apkManifest = options.apkManifest;

        this.editOptions = options;

        this.releaseFile = releaseFile;

        this.publisher = google.androidpublisher({
            auth: client,
            version: 'v3'
        })

    }

    setPublisher(publisher: AndroidPublisher){
        this.publisher = publisher;
    }

    async uploadRelease(): Promise<AppEdit>{

        //authenticating the jwt which we created.
        await authenticate(this.client);

        //inserting into edit list.
        await this.editDetails();

        //uploading apk file and creating tracks.
        let trackStatus = await this.uploadAPKFiles();

        //committing the release with the edit id got from edit details.
        let commitStatus = await this.commitRelease(trackStatus);

        console.log(`apk was uploaded to play store with commit id ${commitStatus.id}`);
                                                                                                                                                                     
        return commitStatus;

    }

    async editDetails(): Promise<AppEdit>{

        try{
            
            const appEdit  = await this.publisher.edits.insert({

                packageName: this.apkManifest.packageName

            })
    
            this.appEditId = appEdit.data.id;

            return appEdit.data;
    
        }catch(error){
    
            throw new Error(`Error while getting edit details ${error.message}`)
        }
        
    }

    async commitRelease(track: Track | undefined): Promise<AppEdit>{

        if (track != undefined) {
    
            const res = await this.publisher.edits.commit({
                auth: this.client,
                editId: this.appEditId!,
                packageName: this.apkManifest.packageName
            });
    
            console.log(`Committed release with Id(${res.data.id}) and Track: ${track.track}.`);

            return res.data;
    
        }else{
    
            throw new Error("Error while upload files, can not find track details.");

        }
    
    }

    async uploadAPKFiles() : Promise<Track> {

        let track: Track | undefined = undefined;
    
        if (this.releaseFile.endsWith('.apk')) {
    
            const apk = await this.uploadApk();

            this.versionCode.push(apk.versionCode);

            track = await this.trackVersionCode();

        }else {
    
            throw new Error("Invalid release file extension");
        }
    
        return track;
    
    }

    async uploadApk(): Promise<Apk> {

        console.log(`[${this.appEditId}, packageName=${this.apkManifest.packageName}]: Uploading APK @ ${this.releaseFile}`);

        const res = await this.publisher.edits.apks.upload({
            auth: this.client,
            packageName: this.apkManifest.packageName,
            editId: this.appEditId!,
            media: {
                mimeType: 'application/vnd.android.package-archive',
                body: fs.createReadStream(this.releaseFile)
            }
        });
    
        return res.data
    }
  
    async trackVersionCode(): Promise<Track> {
        console.log(`Creating Track Release for Edit(${this.appEditId}) for Track(${this.editOptions.track}) and VersionCode(${this.versionCode})`);
        const res = await this.publisher.edits.tracks
            .update({
                auth: this.client,
                editId: this.appEditId!,
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
    }
}