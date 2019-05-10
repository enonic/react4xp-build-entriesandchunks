# react4xp-build-entriesandchunks

**Enonic React4XP helper: goes through a directory tree during buildtime, generates objects for configuring a [webpack](https://webpack.js.org) build that matches React4xp's expected file structure.**

These config objects are a prerequisite for the dependency chunking in the [react4xp-build-components](https://www.npmjs.com/package/react4xp-build-components) build step, which in turn allows the [React4xp runtime lib](https://github.com/enonic/lib-react4xp) to deliver cached and optimized dependencies for react components.

## Jump to:
  - [Install](#install)
  - [Usage](#usage)
  - [Webpack helper methods](#webpack-helper-methods)
    - [.getEntries](#getentries)
      - [Side effect](#side-effect-entriesjson)
      - [Example](#getentries-example)
    - [.getCacheGroups](#getcachegroups)
      - [Example](#getcachegroups-example)

## Install

```bash
npm add --save-dev react4xp-build-entriesandchunks
```

## Usage

In `webpack.config.js`:

```javascript
var React4xpEntriesAndChunks = require('react4xp-build-entriesandchunks');

module.exports = {
    entry: React4xpEntriesAndChunks.getEntries(entrySets, outputPath, entriesFilename, verbose),
    
    optimization: {
        splitChunks: {
            name: false,
            cacheGroups: React4xpEntriesAndChunks.getCacheGroups(sourcePath, subfoldersToIgnore, priorities, verbose)
        }
    },
}

```

## Webpack helper methods

`index.js` exposes two helper methods: [`getEntries`](#getentries) and [`getCacheGroups`](#getcachegroups).

---
 
### `.getEntries`

```
.getEntries(entrySets [, outputPath [, entriesFilename [, verbose]]] )
```

Returns an object ready to be used in a `webpack.config.js` build file, under `module.exports.entry`. This object is built 
using source files found under one or more source path, filtering on certain file extensions, both defined in the 
entrysets. 

The **keys** in the returned object will determine into which files webpack should transpile the source files (and so, what
the transpiled code can be accessed as after transpilation. For react entry components, this is the same as the jsxPath). 

The **values** in the returned object are paths to the source files.  

`entrySets:` Mandatory, non-empty array of objects, each with two mandatory attributes and one optional: 
  - `sourcePath`: mandatory string, the root under which to search for source files
  - `sourceExtensions`: mandatory array of strings, file extensions (without a leading dot) for files to include
  - `targetSubDir`: optional string, name of subdirectory (relative, not full path) under `outputPath` where the files in this entrySet should be put. Works as a jsxPath prefix for entry components.
  
`outputPath`: optional string. Root react4xp target build folder.

`entriesFilename`: optional string. Filename for [the entries file](#side-effect-entriesjson). 

`verbose`: optional boolean. If truthy, a bit more logging during building.

#### Side effect: `entries.json`

If BOTH `outputPath` and `entriesFilename` are set, a json file by that name - usually `entries.json` - is created in that location, as a side effect of the search/entry generation. This file lists all the `jsxPath`s for entry components. Both a handy overview, and used in runtime to separate [entries from chunks](If BOTH `outputPath` and `entriesFilename` are set, a json file by that name - usually `entries.json` - is created in that location, as a side effect of the search/entry generation. This file lists all the `jsxPath`s for entry components. Both a handy overview, and used in runtime to separate [entries from chunks](https://www.npmjs.com/package/react4xp-build-components#output).



#### .getEntries example:

If the file structure is...

```
/project/
└── src/
|	└── site/
|	|	└── parts/
|	|		└── client/
|	|		|	└── client.js
|	|		|	└── client.jsx
|	|		└── example/
|	|			└── example.js
|	|			└── example.html
|	|			└── example.jsx
|	|			└── example.xml
|	|				
|	└── react4xp/
|		|
|		└── _entries/
|		|	    └── thisIsAnEntry.jsx
|		|
|		└── shared/
|			└── button.jsx
|			└── header.jsx
|				
└── build/		
```

...then running webpack with this setup...

```javascript
// webpack.config.js
module.exports = {
    
    //...
    
    entry: React4xpEntriesAndChunks.getEntries(
        [
            {
                sourcePath: `/project/src/react4xp/_entries/`,
                sourceExtensions: ['jsx', 'js', 'es6']
            },
            {
                sourcePath: "/project/src/site/",
                sourceExtensions: ['jsx'],
                targetSubDir: "site"                      
            }
        ],
        "/project/build/react4xp",
        "entries.json"
    )
        
    //...

};
```

...will generate this object in webpack.config under `entry`:

```json
 {
  "thisIsAnEntry": "/project/src/react4xp/_entries/thisIsAnEntry.jsx",
  "site/parts/client/client": "/project/src/site/parts/client/client.jsx",
  "site/parts/example/example": "/project/src/site/parts/example/example.jsx"
}

```

...and put the file `entries.json` under `/project/build/react4xp`:

```json
[
  "thisIsAnEntry",
  "site/parts/client/client",
  "site/parts/example/example"
]
```




---

### `.getCacheGroups`

```
.getCacheGroups(sourcePath [, subfoldersToIgnore [, priorities [, verbose]]] )
```

Sets up code splitting / defines chunks collecting commonly used dependency code that entry components can use to import functionality and shared components. Returns an object ready to use in webpack.config.js, under `module.exports.optimization.splitChunks.cacheGroups`.

This is designed to make a `vendors` chunk for shared code from `node_modules`, and after that a chunk for each subfolder under `sourcePath` (with the same chunk name as the top-level subfolder), collecting ALL code under each subfolder and making it available as exports. The exception is subfolders listed in `subfolderToIgnore`, which will be interpreted as entry folders. Each source file under entry folders is interpreted as an entry component, ready to render with the React4xp library.

`sourcePath`: mandatory string
`subfoldersToIgnore`: optional array of strings
`priorities`: optional onbject (string -> integer). Sets chunk priority for specific chunk folders, see the webpack docs for priority under code splitting.
`verbose`: optional boolean. If truthy, a bit more logging is output during building.


#### .getCacheGroups example:

In the same file structure as above, running webpack with this setup:

```javascript
// webpack.config.js
module.exports = {
    
    // ...
    
    optimization: {
        splitChunks: {
            name: false,
            cacheGroups: React4xpEntriesAndChunks.getCacheGroups(
                "/project/src/react4xp",
                [
                    "_entries"
                ],
                {
                    shared: 2
                }
            )
        }
    }
    
    // ...
	
}
```

...will detect which non-ignored subfolders are under `sourcePath` and generate a `cacheGroups` config object with specified chunk priorities, if any:

```json
{
  "vendors": {
    "name": "vendors",
    "enforce": true,
    "test": /[\\\/]node_modules[\\\/]/,
    "chunks": "all",
    "priority": 100
  },
  "shared": {
    "name": "shared",
    "enforce": true,
    "test": /\/project\/src\/react4xp\/shared\//,
    "chunks": "all",
    "priority": 2
  }
}
```
