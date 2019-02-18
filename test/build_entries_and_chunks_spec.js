import path from 'path';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

import React4xpEntriesAndChunks from '../lib';

const DIR_NAME = __dirname; // eslint-disable-line no-undef
//const DIR_NAME_LENGTH = DIR_NAME.length + 1;
//const DIR_NAME_AND_SHASH = DIR_NAME + React4xpEntriesAndChunks.SLASH;

describe("React4xp Webpack build: entries-and-chunks", ()=>{
    describe(".getEntries", ()=> {

        const OUTPUT_PATH = path.join(DIR_NAME, 'dummy-build', 'react4xp');

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
        console.log("actualEntries: " + JSON.stringify(actualEntries, null, 2));

        const storedEntries = require(path.join(OUTPUT_PATH, "entries.json"));
        console.log("storedEntries: " + JSON.stringify(storedEntries, null, 2));

        // Matching files should be these, and only these:
        const EXPECTED_MATCHING_ENTRIES = deepFreeze({
            "thisIsAnEntry": path.join(DIR_NAME, "dummy-src", "react4xp", "_components", "thisIsAnEntry.jsx"),
            "site/parts/client/client": path.join(DIR_NAME, "dummy-src", "site", "parts", "client", "client.jsx"),
            "site/parts/example/example": path.join(DIR_NAME, "dummy-src", "site", "parts", "example", "example.jsx"),
        });

        // Make sure the results don't change during testing
        const FROZEN_ACTUAL_ENTRIES = deepFreeze(actualEntries);
        const FROZEN_STORED_ENTRIES = deepFreeze(storedEntries);


        it("scans files with selected file extensions under the source paths, " +
            "and builds an object where the values are full paths to matching files, " +
            "exactly one path per matching file, " +
            "and does not match files that have non-target file extensions " +
            "or files in existing, non-target directories", ()=>{

            expect(FROZEN_ACTUAL_ENTRIES).to.deep.equal(EXPECTED_MATCHING_ENTRIES);
        });


        it("produces an entries.json file in the output path, " +
            "whose content is an array that perfectly matches the keys of the returned entry object", ()=>{

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
    });

    describe(".getChunksPlugin", ()=> {

    });
});
