# Enonic React4XP helper: buildtime generator of webpack config objects - entries and chunks

## Webpack helper methods

`index.js` exposes three helper methods:
  - [`getEntries`](#getentriesentrysets-outputpath--verbose)
  - [`getCacheGroups`](#getcachegroupssourcepath--subfolderstoignore--priorities--verbose)
  - [`getChunksPlugin`](#getchunkspluginoutputdir)

---
 
### `.getEntries(entrySets, outputPath [, verbose])`:

Returns an object ready to be used in a webpack.config.js build file, under `module.exports.entry`. This object is built 
using source files found under one or more source path, filtering on certain file extensions, both defined in the 
entrysets. 

The **keys** in the returned object will determine into which files webpack should transpile the source files (and so, what
the transpiled code can be accessed as after transpilation. For react entry components, this is the same as the jsxPath). 

The **values** in the returned object are paths to the source files.  

`entrySets:` Mandatory, non-empty array of objects, each with two mandatory attributes and one optional: 
  - `sourcePath`: mandatory string, the root under which to search for source files
  - `sourceExtensions`: mandatory array of strings, file extensions (without a leading dot) for files to include
  - `targetSubDir`: optional string, name of subdirectory (relative, not full path) under `outputPath` where the files in this entrySet should be put. Works as a jsxPath prefix for entry components.
  
`outputPath`: mandatory string. Root react4xp target build folder.

`verbose`: optional boolean. If truthy, a bit more logging is output during building.

#### Side effect: `entries.json`

During this generation/search, `getEntries` generates a json file, `entries.json` in the `outputPath`, listing all the jsxPaths for entry components. Both a handy overview, and used in runtime to separate entries from chunks.


#### EXAMPLE:

If the file structure is...

```
/project/
	src/
		site/
			parts/
	
				client/
					client.js
					client.jsx
	
				example/
					example.js
					example.html
					example.jsx
					example.xml
					
		react4xp/
	
			_components/
				thisIsAnEntry.jsx
	
			shared/
				button.jsx
				header.jsx
				
	build/		
```

...then running webpack with this setup...

```javascript
// webpack.config.js
module.exports = {
    
    //...
    
    entry: React4xpEntriesAndChunks.getEntries(
        [
            {
                sourcePath: `/project/src/react4xp/_components/`,
                sourceExtensions: ['jsx', 'js', 'es6']
            },
            {
                sourcePath: "/project/src/site/",
                sourceExtensions: ['jsx'],
                targetSubDir: "site"                      
            }
        ],
        "/project/build/react4xp"
    )
        
    //...

};
```

...will generate this object in webpack.config under `entry`:

```json
 {
  "thisIsAnEntry": "/project/src/react4xp/_components/thisIsAnEntry.jsx",
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

### `.getCacheGroups(sourcePath [, subfoldersToIgnore [, priorities [, verbose]]])`:

Sets up code splitting / defines chunks collecting commonly used dependency code that entry components can use to import functionality and shared components. Returns an object ready to use in webpack.config.js, under `module.exports.optimization.splitChunks.cacheGroups`.

This is designed to make a `vendors` chunk for shared code from `node_modules`, and after that a chunk for each subfolder under `sourcePath` (with the same chunk name as the top-level subfolder), collecting ALL code under each subfolder and making it available as exports. The exception is subfolders listed in `subfolderToIgnore`, which will be interpreted as entry folders. Each source file under entry folders is interpreted as an entry component, ready to render with the React4xp library.

`sourcePath`: mandatory string
`subfoldersToIgnore`: optional array of strings
`priorities`: optional onbject (string -> integer). Sets chunk priority for specific chunk folders, see the webpack docs for priority under code splitting.
`verbose`: optional boolean. If truthy, a bit more logging is output during building.


#### EXAMPLE:

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
                    "_components"
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

---

### `.getChunksPlugin(outputDir)`: 

Returns a `chunks-2-json-webpack-plugin`. If you put it in webpack.config.js under `module.exports.plugins`, it will put a `chunks.json` in the output directory `outputDir`. This file lists all entries and chunks, with their hashed names if that's used.

#### EXAMPLE:

Using the same file structure, and running the same `getEntries` and `getCacheGroups` as in the above examples:

Adding this to the plugins in webpack.config.js:

Running webpack with this setup...

```javascript
// webpack.config.js
module.exports = {
    
    // ...
    
    plugins: [
        React4xpEntriesAndChunks.getChunksPlugin("build/react4xp")
    ]
    
    // ...
	
}
```

will generate `build/react4xp/chunks.json` containing approximately this (note the cache-busting hashes - generated on build, that's why this is needed for reference):

```json
{
  "thisIsAnEntry": {
    "js": "/thisIsAnEntry.js"
  },
  "shared": {
    "js": "/shared.f8c265056.js"
  },
  "site/parts/client/client": {
    "js": "/site/parts/client/client.js"
  },
  "site/parts/example/example": {
    "js": "/site/parts/example/example.js"
  },
  "vendors": {
    "js": "/vendors.44ab9f5bc.js"
  }
}
```

There might also be sourcemaps references here.
