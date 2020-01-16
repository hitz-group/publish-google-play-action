import {authenticate,parseManifest,createJWT,checkFileExist,getKeys} from '../src/helpers';
require('dotenv').config();

describe("JWT generation and authentication",() =>{

    let keys = getKeys();

    let jwt = createJWT(keys);

    test("check private key value",() => {
        expect(typeof keys.private_key).toBe("string");
        keys.private_key = "";
        expect(keys.private_key).toBe("");
    })

    test("check client email value",() => {
        expect(typeof keys.client_email).toBe("string");
        keys.client_email = "";
        expect(keys.client_email).toBe("");
    })

    test("Function: createJWT",() => {
        expect(typeof jwt).toBe('object')
    })

    it('Function: authenticate testing',async()=>{
        let data = await authenticate(jwt);
        expect(data).toBe(true);
    })


})

it("Function: parseManifest testing",async() =>{
    let releaseFile = process.env.releaseFilePath;
    let data = await parseManifest(releaseFile);
    expect(typeof data.packageName).toBe('string');
})

it("Function: parseManifest with invalid apk path",async() =>{
    try{
        await parseManifest(null);
    }catch(e){
        expect(e.message).toBe('Can not find apk path.');
    }
})

test("Function: checkFileExist testing",() =>{
    let releaseFile = process.env.releaseFilePath;
    expect(checkFileExist(releaseFile)).toBe(true);
})

test("Function: checkFileExist with invalid path",() =>{
    let path = 'newApp.apk';
    try{
        checkFileExist(path);
    }catch(e){
        expect(e.message).toBe(`Unable to find release file @ ${path}`);
    }
})