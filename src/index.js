// Builds entry and chunk maps from src file structure, that webpack.config.react4xp uses to transpile the react4js component files

const path = require('path');
const glob = require('glob');

// eslint-disable-next-line no-undef
exports.SLASH = (process.platform === "win32") ? "\\" : "/";

// UGLY WINDOWS FIX/HACK: normalize the sourcePath: replace all backslashes with forward-slashes.
// If it starts with 'X:\' (where X is any letter), it's fairly safe to assume it's an absolute windows path and backslashes are fair game.
// If not, it's probably impossible to know for sure that the path is not a valid POSIX path with a backslash in it?
// If so, log a warning.
exports.normalizePath = (path) => {
    if (!(new RegExp('^[a-zA-Z]:\\\\', 'i').test(path)) && new RegExp('\\\\', 'i').test(path)) {
        console.warning("Backslashes found in path (" + JSON.stringify(path, null, 2) + "). Replacing with forward slashes.");
    }
    return path.replace(/\\/g, '/');
};

/** Builds component entries from files found under a directory, for selected file extensions, for being transpiled out to a target path. */
function buildEntriesToSubfolder(entrySet, verboseLog) {

    verboseLog("Entries from subfolder (entry set: " + JSON.stringify(entrySet) + ")");

    const sourcePath = exports.normalizePath(entrySet.sourcePath);
    const extensions = entrySet.sourceExtensions;
    let targetPath = (entrySet.targetSubDir || "").trim();
    if (targetPath.startsWith("/")) {
        targetPath = targetPath.substring(1);
    }

    // Builds and returns an object [entries]
    // where values are found files under directory [sourcePath] with any one of the fileExtensions in [extensions],
    // and the values are the corresponding filenames (full path under react4xp subfolder)
    // - which also is the access path (jsxPath) of each component in react4xp.
    return extensions.reduce(
        (accumulator, extension) => Object.assign(
            accumulator,
            glob.sync(path.join(sourcePath, '**/*.' + extension)).reduce(
                (obj, entry) => {
                    entry = exports.normalizePath(entry);
                    const parsedEl = path.parse(entry);
                    if (parsedEl && parsedEl.dir.startsWith(sourcePath)) {
                        let subdir = parsedEl.dir.substring(sourcePath.length).replace(/(^\/+)|(\/+$)/g, "");

                        // UGLY HACK: Platform-independent forced-forwardslash version of path.join
                        const name = [targetPath, subdir, parsedEl.name].filter(a => (a || "").trim()).join('/');

                        verboseLog("\tEntry: ", name, "->", entry);

                        obj[name] = entry;
                    }
                    return obj;
                }, {})
        ), {});
}


// Builds entries.json, which lists the entries: first-level react4xp components that shouldn't be counted as general dependencies.
function makeEntriesFile(entries, outputPath, entriesFilename, verboseLog) {
    const fs = require('fs');

    const entryList = Object.keys(entries);
    const entryFile = path.join(outputPath, entriesFilename);

    const dirs = outputPath.split(exports.SLASH);
    let accum = "";
    dirs.forEach(dir => {
        accum += dir + exports.SLASH;
        if (!fs.existsSync(accum)){
            verboseLog("\tCreate: " + accum);
            fs.mkdirSync(accum);
        }
    });
    fs.writeFileSync(entryFile, JSON.stringify(entryList, null, 2));

    verboseLog("React4xp entries (a.k.a jsxPath) listed in: " + entryFile + "\n");
}


// Entries are the non-dependency output files, i.e. react components and other js files that should be directly
// available and runnable to both the browser and the nashorn engine.
// This function builds the entries AND entries.json, which lists the first-level components that shouldn't be counted
// as general dependencies.
exports.getEntries = (entrySets, outputPath, entriesFilename, verbose) => {
    const verboseLog = verbose ? console.log : function () {};
    const entries = entrySets.reduce(
        (accumulator, entrySet) => Object.assign(accumulator, buildEntriesToSubfolder(entrySet, verboseLog)),
        {}
    );

    if (
        typeof outputPath === 'string' && outputPath.trim() !== '' &&
        typeof entriesFilename === 'string' && entriesFilename.trim() !== ''
    ) {
        makeEntriesFile(entries, outputPath, entriesFilename, verboseLog);
    }

    return entries;
};
