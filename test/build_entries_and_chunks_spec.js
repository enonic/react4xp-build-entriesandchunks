//import path from 'path';
//import { expect } from 'chai';
//import deepFreeze from 'deep-freeze';

//import getConstants from '../lib';

//const dirName = __dirname; // eslint-disable-line no-undef

describe("React4xp Webpack build: entries-and-chunks", ()=>{
    describe(".getEntries", ()=> {

        /*
        it("returns an object with constants", () => {
            const constants = getConstants(dirName);
            console.log("constants: " + JSON.stringify(constants, null, 2));

            // Sampling some values
            expect(constants.SRC_R4X_ENTRIES).to.equal(path.join(dirName, "src", "main", "react4xp", "_components"));
            expect(constants.BUILD_R4X).to.equal(path.join(dirName, "build", "resources", "main", "react4xp"));
            expect(constants.LIBRARY_NAME).to.equal("React4xp");
            expect(constants.BUILD_ENV).to.equal("development");
            expect(constants.EXTERNALS["react-dom/server"]).to.equal("ReactDOMServer");
        });


        it("can override single values", () => {
            const constants = getConstants(dirName, deepFreeze({BUILD_ENV: "production"}));
            expect(constants.BUILD_ENV).to.equal("production");
        });


        it("can override the JSON shared constants file name (full path) and read constants from that", () => {
            const constants = getConstants(dirName, deepFreeze({JSON_CONSTANTS_FILE: path.join(dirName, "usethisinstead.json")}));
            expect(constants.EXTERNALS["react"]).to.equal(undefined);
            expect(constants.EXTERNALS["react-dom"]).to.equal(undefined);
            expect(constants.EXTERNALS["react-dom/server"]).to.equal(undefined);
            expect(constants.EXTERNALS["foo"]).to.equal("foofoo");
            expect(constants.EXTERNALS["bar"]).to.equal("barbar");
            expect(constants.EXTERNALS["lifetheuniverseetc"]).to.equal("42");
        }); //*/

    });

    describe(".getCacheGroups", ()=> {
    });

    describe(".getChunksPlugin", ()=> {

    });
});
