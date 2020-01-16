# Upload Android release to the Play Store

This action will help you upload an Android `.apk` (Android App) file to the Google Play Console using the Google Play Developer API v3.


# Dev setting the project

1) Clone the project
2) Mention correct private_key and client_email in key.json
3) `create .env` file and mention `releaseNotes`,`track`,`releaseFilePath` variables
4) Keep the apk which you want to upload in release folder (default name: app.apk)
5) `npm install`
6) `tsc` for building and compiling typescript files.
7) `npm test` for running test cases
8) `npm test -- --coverage` for seeing the coverage of test cases
9) `npm start` for running the script which will upload apk into google play store

## Inputs

### `private_key` (given from key.json)

**Required:** The service account private key.

### `client_email` (given from key.json)

**Required:** The service account client email.

### `releaseFilePath` (given from environment)

**Required:** The Android release file to upload (path of .apk)

### `releaseNotes` (given from environment)

**Required:** Release notes with information

### `track` (given from environment)

**Required:** The track in which you want to assign the uploaded app.  
_Values:_ `alpha`, `beta`, `internal`, `production`

## Example usage
  please check the auto_push.yml file in workflows of .github folder.
