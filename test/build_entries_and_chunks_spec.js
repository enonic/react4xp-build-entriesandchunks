import path from 'path';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

import React4xpEntriesAndChunks from '../lib';

const DIR_NAME = __dirname; // eslint-disable-line no-undef
const DIR_NAME_LENGTH = DIR_NAME.length + 1;
const DIR_NAME_AND_SHASH = DIR_NAME + React4xpEntriesAndChunks.SLASH;

describe("React4xp Webpack build: entries-and-chunks", ()=>{
    describe(".getEntries", ()=> {

        const OUTPUT_PATH = path.join(DIR_NAME, 'dummy-build', 'react4xp');

        const entry = React4xpEntriesAndChunks.getEntries(
            [
                {
                    sourcePath: path.join(DIR_NAME, 'dummy-src', 'react4xp', '_components'),
                    sourceExtensions: ['jsx', 'js', 'es6'],
                },
                {
                    sourcePath: path.join(DIR_NAME, 'dummy-src', 'site'),
                    sourceExtensions: ['jsx'],
                    targetSubDir: "site",
                },
            ],
            OUTPUT_PATH
        );
        console.log(JSON.stringify(entry, null, 2));

        // Matching files should be these, and only these:
        const EXPECTED_MATCHING_RELATIVE_PATHS = deepFreeze([
            path.join("dummy-src", "react4xp", "_components", "thisIsAnEntry.jsx"),
            path.join("dummy-src", "site", "parts", "example", "example.jsx"),
            path.join("dummy-src", "site", "parts", "client", "client.jsx"),
        ]);

        // Make sure the found result doesn't change during testing
        const ENTRY = deepFreeze(entry);



        it("scans files with selected file extensions under the source paths, " +
            "and builds an object where the values are full paths to matching files, " +
            "exactly one path per matching file", ()=>{


            const alreadySeen = [];

            Object.keys(ENTRY).forEach( key => {
                const foundPath = ENTRY[key];
                expect(foundPath.startsWith(DIR_NAME_AND_SHASH)).to.equal(true);

                const relativePath = foundPath.substring(DIR_NAME_LENGTH);

                expect(EXPECTED_MATCHING_RELATIVE_PATHS.indexOf(relativePath)).to.not.equal(-1);
                expect(alreadySeen.indexOf(relativePath)).to.equal(-1);
                alreadySeen.push(relativePath);
            });
        });



        it("finds the expected number of matching files", ()=>{
            expect(Object.keys(ENTRY).length).to.equal(3);
        });


        it("does not match files that have non-target file extensions", ()=>{
            Object.keys(ENTRY).forEach( key => {
                const foundPath = ENTRY[key];
                expect(foundPath.endsWith(".jsx")).to.equal(true);
            });
        });


        it("does not match files in existing, non-target directories", ()=>{
            Object.keys(ENTRY).forEach( key => {
                const foundPath = ENTRY[key];
                expect(foundPath.indexOf("shared")).to.equal(-1);
            });
        });


        it("produces an entries.json file in the output path, whose content matches the keys of the returned entry object", ()=>{
            Object.keys(ENTRY).forEach( key => {
                const foundPath = ENTRY[key];
                expect(foundPath.indexOf("shared")).to.equal(-1);
            });
        });
        OUTPUT_PATH
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
