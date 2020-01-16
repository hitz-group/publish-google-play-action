import {upload} from "../src/upload";
import {createJWT,parseManifest,EditOptions,getKeys} from "../src/helpers";
import {androidpublisher_v3 } from "googleapis";
require('dotenv').config();

describe('Test all methods in the upload class', () => {
    
    /*----creating object----*/
    let OriginalKeys = getKeys();
    let jwtObjOriginal = createJWT(OriginalKeys);
    let releaseFile = process.env.releaseFilePath || "";
    let editOptionsObj:EditOptions= {
        apkManifest:{
            packageName:"com.example.com",
            versionCode:"7.0"
        },
        releaseNotes:[
            {
                language:"en-Us",
                text: "this is cool"
            }
        ],
        track: "internal"
    }
    let OriginalUploadObj = new upload(jwtObjOriginal,editOptionsObj,releaseFile);
    /*----creating object end----*/

    /*----creating jest spyOn ----*/
    let mockEditInsert;
    let mockEditApkUpload;
    let mockEditTrackUpdate;
    let mockEditCommit;
    beforeEach(() => {
        let androidPublisherObj = new androidpublisher_v3.Androidpublisher({auth: jwtObjOriginal});
        mockEditInsert = jest.spyOn( androidPublisherObj.edits,'insert').mockImplementation((data)=>{
            if(!(data["packageName"])){
                throw new Error("packageName not found");
            }
            return Promise.resolve({
                data:{"id": "123456","expiryTimeSeconds": new Date().getMilliseconds()}
            })
        })
        mockEditApkUpload = jest.spyOn( androidPublisherObj.edits.apks,'upload').mockImplementation(()=>{
            return Promise.resolve({
                data:{
                    "versionCode": "10.0",
                    "binary": {
                        "sha1": "sha1",
                        "sha256": "sha256"
                    }
                }
            })
        })
        mockEditTrackUpdate = jest.spyOn( androidPublisherObj.edits.tracks,'update').mockImplementation(()=>{
            return Promise.resolve({
                data:{
                    "release": "10.0",
                    "track": "internal"
                }
            })
        })
        mockEditCommit = jest.spyOn(androidPublisherObj.edits,'commit').mockImplementation(() =>{
            return Promise.resolve({
                data:{
                    expiryTimeSeconds: "10000",
                    id: "10"
                }
            })
        })
        //explicitly setting the publisher to above created object because we are creating jest spyOn on that object
        OriginalUploadObj.setPublisher(androidPublisherObj);
    });

    afterEach(() => {
        mockEditInsert.mockRestore();
        mockEditApkUpload.mockRestore();
        mockEditTrackUpdate.mockRestore();
        mockEditCommit.mockRestore();
    });
    /*----ending jest spyOn ----*/

    it("Main method uploadRelease - method in upload class",async() =>{
        let data  = await OriginalUploadObj.uploadRelease();
        expect(data.id).toBe('10');
    })

    it("Edit - method in upload class",async()=>{
        let apkManifest = await parseManifest(releaseFile);
        OriginalUploadObj.apkManifest = apkManifest;
        let data = await OriginalUploadObj.editDetails();
        expect(data.id).toBe("123456");
    })

    it("Edit - method in upload class when packageName missing",async()=>{
        OriginalUploadObj.apkManifest.packageName = "";
        try {
            await OriginalUploadObj.editDetails();
        } catch (e) {
            expect(e.message).toBe('Error while getting edit details packageName not found');
        }
    })

    it("UploadAPKFiles - method in upload class",async()=>{
        let data = await OriginalUploadObj.uploadAPKFiles();
        expect(data.track).toBe("internal");
    })

    it("UploadApk which actually uploads - method in upload class",async()=>{
        let data = await OriginalUploadObj.uploadApk();
        expect(data.versionCode).toBe("10.0");
    })

    it("TrackVersionCode updates tracks and release notes - method in upload class",async()=>{
        let data = await OriginalUploadObj.trackVersionCode();
        expect(data.track).toBe("internal");
    })

    it("Commit method - method in upload class",async() =>{
        let options = {
            release:"10.0",
            track: "internal"
        }
        let data  = await OriginalUploadObj.commitRelease(options);
        expect(data.id).toBe('10');
    })

    it("Function: commitRelease when track is undefined",async() =>{
        try{
            await OriginalUploadObj.commitRelease(undefined);
        }catch(e){
            expect(e.message).toBe("Error while upload files, can not find track details.");
        }
    })

    it("Function: uploadAPKFiles invalid file extension",async() =>{
        try{    
            OriginalUploadObj.releaseFile = "app.java";
            await OriginalUploadObj.uploadAPKFiles();
        }catch(e){
            expect(e.message).toBe("Invalid release file extension");
        }
    })

});