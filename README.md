# Upload Android release to the Play Store

This action will help you upload an Android `.apk` (Android App) file to the Google Play Console using the Google Play Developer API v3.

## Dev setting the project

1) Clone the project
2) `create .env` file and mention `private_key`,`client_email`,`releaseNotes`,`track`,`releaseFilePath` variables
3) replace the `core.getInput('variable')` with `process.env.variable` and import `require('dotenv').config()`
4) Keep the apk which you want to upload in release folder (default name: app.apk)
5) `npm install`
6) `tsc` for building and compiling typescript files.
7) `npm test` for running test cases
8) `npm test -- --coverage` for seeing the coverage of test cases
9) `npm start` for running the script which will upload apk into google play store

## Inputs

### `private_key` ( which is private_key in Gplay key file )

**Required:** The service account private key.

### `client_email` (which is client_email in Gplay key file )

**Required:** The service account client email.

### `releaseFilePath`

**Required:** The Android release file to upload (path of .apk)

### `releaseNotes`

**default:** This is automated release.
Pass the value if you want to change the release notes.

### `track`

**default:** internal.
_Values:_ `alpha`, `beta`, `internal`, `production`

## Example usage

    - name: upload to play store
      uses: hitz-group/publish-google-play-action@master
      with:
          client_email: ${{ secrets.GPLAY_SERVICE_ACCOUNT_EMAIL }}
          private_key: ${{ secrets.GPLAY_SERVICE_ACCOUNT_PRIVATE_KEY }}
          releaseFilePath: "path/to/apk"
          releaseNotes: "this is the automated release"
          track: internal
