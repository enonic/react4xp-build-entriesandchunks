import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import path from 'path';

import React4xpEntriesAndChunks from '../lib';

const DIR_NAME = __dirname; // eslint-disable-line no-undef

describe("React4xp Webpack build: entries-and-chunks", ()=>{
    describe(".getEntries", ()=> {

        const OUTPUT_PATH = path.join(DIR_NAME, 'dummy-build', 'react4xp');

        // actualEntries object should exactly match this. storedEntries should exactly match these keys.
        const EXPECTED_MATCHING_ENTRIES = deepFreeze({
            "thisIsAnEntry": path.join(DIR_NAME, "dummy-src", "react4xp", "_components", "thisIsAnEntry.jsx"),
            "site/parts/client/client": path.join(DIR_NAME, "dummy-src", "site", "parts", "client", "client.jsx"),
            "site/parts/example/example": path.join(DIR_NAME, "dummy-src", "site", "parts", "example", "example.jsx"),
        });



        it("scans files with selected file extensions under the source paths, " +
            "and builds an object where the values are full paths to matching files, " +
            "exactly one path per matching file, " +
            "and does not match files that have non-target file extensions " +
            "or files in existing, non-target directories", ()=>{

            const actualEntries = React4xpEntriesAndChunks.getEntries(
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
            //console.log("actualEntries from .getEntries: " + JSON.stringify(actualEntries, null, 2));

            // Make sure the found results can't be altered during testing
            const FROZEN_ACTUAL_ENTRIES = deepFreeze(actualEntries);

            expect(FROZEN_ACTUAL_ENTRIES).to.deep.equal(EXPECTED_MATCHING_ENTRIES);
        });


        it("produces an entries.json file in the output path, " +
            "whose content is an array that perfectly matches the keys of the returned entry object", ()=>{

            const actualEntries = React4xpEntriesAndChunks.getEntries(
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

            // Loads as JSON data the expected file that should be side-effect-generated during .getEntries)
            const storedEntries = require(path.join(OUTPUT_PATH, "entries.json"));
            //console.log("storedEntries from entries.json: " + JSON.stringify(storedEntries, null, 2));

            // Make sure the found results can't be altered during testing
            const FROZEN_ACTUAL_ENTRIES = deepFreeze(actualEntries);
            const FROZEN_STORED_ENTRIES = deepFreeze(storedEntries);

            expect(Array.isArray(FROZEN_STORED_ENTRIES)).to.equal(true);

            Object.keys(FROZEN_ACTUAL_ENTRIES).forEach( key => {
                //console.log(JSON.stringify(key, null, 2));
                expect(FROZEN_STORED_ENTRIES.indexOf(key)).to.not.equal(-1);
            });

            FROZEN_STORED_ENTRIES.forEach( entry => {
                //console.log(JSON.stringify(entry, null, 2));
                expect(FROZEN_ACTUAL_ENTRIES[entry]).to.not.equal(undefined);
            });
        });
    });


    describe(".getCacheGroups", ()=> {
        const EXPECTED_CACHEGROUPS = deepFreeze({
            "vendors": {
                "name": "vendors",
                "enforce": true,
                "test": /[\\\/]node_modules[\\\/]/,
                "chunks": "all",
                "priority": 100,
            },
            "shared": {
                "name": "shared",
                "enforce": true,
                "test": new RegExp(path.join(DIR_NAME, "dummy-src", "react4xp", "shared")),
                "chunks": "all",
                "priority": 2,
            },
        });


        it("generates a optimization/splitChunks/cacheGroups webpack config object, " + 
            "with chunks matching subfolders under the source path, " + 
            "ignoring folder names in ignoreSubfolders, adding a standard vendors chunk, with priority=100 and giving " + 
            "all other chunks a priority of 1 unless specified in the priorites argument", ()=>{
                    
            const cacheGroups = React4xpEntriesAndChunks.getCacheGroups(
                    path.join(DIR_NAME, "dummy-src", "react4xp"),
                [
                    "_components",
                ],
                {
                    shared: 2,
                }
                );
            console.log("cacheGroups: " + JSON.stringify(cacheGroups, null, 2));
                
            const FROZEN_CACHEGROUPS = deepFreeze(cacheGroups); 

            expect(FROZEN_CACHEGROUPS).to.deep.equal(EXPECTED_CACHEGROUPS);
        });

    });

    describe(".getChunksPlugin", ()=> {

        const chunksPlugin = React4xpEntriesAndChunks.getChunksPlugin(
            path.join(DIR_NAME, "dummy-build", "react4xp")
        );
        console.log("chunksPlugin: " + chunksPlugin);
        console.log("chunksPlugin: " + JSON.stringify(chunksPlugin, null, 2));
        console.log("chunksPlugin Keys: " + JSON.stringify(Object.keys(chunksPlugin), null, 2));
        console.log("chunksPlugin type: " + JSON.stringify(typeof chunksPlugin, null, 2));

    });
});
