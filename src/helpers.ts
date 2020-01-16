import { androidpublisher_v3 }  from "googleapis";
import LocalizedText = androidpublisher_v3.Schema$LocalizedText;
import {JWT} from "google-auth-library/build/src/auth/jwtclient";
import * as fs from "fs";
var ApkReader = require('node-apk-parser')
const {google} = require('googleapis');

export interface IPackageManifest{
    packageName: string,
    versionCode: string
}

export interface keyJSON {
  private_key: string,
  client_email: string 
}

export interface EditOptions {
  apkManifest:IPackageManifest,
  track: string | undefined;
  releaseNotes: LocalizedText[];
}

export const parseManifest = async (apkPath?: string | null): Promise<IPackageManifest> => {
    if(apkPath){
      console.log("release file..",apkPath);
      const reader = await ApkReader.readFile(apkPath);
      const manifest = reader.readManifestSync();
      return {
        packageName: manifest.package,
        versionCode: manifest.versionCode
      }
    }else{
      throw new Error("Can not find apk path.");
    }
}

export const checkFileExist =(path?: string | null): boolean => {
  console.log("checkFileExist file..",path);
    if(!path || !fs.existsSync(path)){
        throw new Error(`Unable to find release file @ ${path}`);
    }else{
        return true;
    }
}

export const createJWT = (keyJson):JWT =>{
  let authClientJwt = new google.auth.JWT(
      keyJson.client_email,
      null,
      keyJson.private_key,
      ['https://www.googleapis.com/auth/androidpublisher'],
    );
  return authClientJwt;
}

export const  authenticate = async(auth: JWT): Promise<boolean> => {
  try{
    let result  = await auth.authorize();
    let returnResult:boolean = (result && result.access_token) ? true : false;
    return returnResult;
  }catch(error){
      throw new Error(`Error while authenticating with message ${error.message}`)
  }
}

export const getKeys = (): keyJSON =>{
  return({
    "private_key": process.env.private_key || "",
    "client_email": process.env.client_email || ""
  })
}