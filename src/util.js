const fs = require("fs");
const JSONStream = require("JSONStream");

const DATA_PATH = __dirname+"/data";
const locationFile = Object.freeze({
    "region": "regions.json",
    "township": "townships.json",
    "villageTract": "village_tracts.json",
    "village": "villages.json"
});

/**
 * @param {Array<Object>} data 
 * @returns 
 */
function Location(data = null) {
    if (!(this instanceof Location)) {
        return new Location(data);
    }

    data = data;
    pipelines = [];

    /**
     * @param {"region"|"township"|"villageTract"|"village"} location 
     * @returns 
     */
    this.read = function(location) {
        return new Promise((resolve, reject) => {
            if (Object.keys(locationFile).includes(location)) {
                reject(new Error("Invalid location"));
            }
    
            data = require(`./data/${locationFile[location]}`);
            resolve(data);
        })
    }

    /**
     * @param {"region"|"township"|"villageTract"|"village"} location 
     * @param {Object} options
     * @param {String} options.as
     * @param {String} options.localId "Foreign key name in current data"
     * @param {String} [options.foreignId="_id"] "Primary key name in lookup file"
     * @param {Object} options.result
     * @param {String} [options.result.select=null] "Field name to select as result"
     */
    this.lookup =(location, options) => {
        if (!Object.keys(locationFile).includes(location)) {
            throw new Error("Invalid location");
        }

        pipelines.push({ 
            fileName: locationFile[location], 
            as: options.as || location,
            foreignId: options.foreignId || "_id",
            result: { select: options?.result?.select || null },
            ...options,
            ids: []
        });

        return this;
    }

    /**
     * 
     * @param {Object} options 
     * @param {Boolean} options.parallelLookup
     */
    this.get = async (options) => {
        if (!data) {
            return null;
        }

        const dataCount = data.length;

        // Extract foreign ids for all pipelines
        for (i = 0; i < dataCount; i++) {
            pipelines.forEach(pipeline => {
                pipeline.ids.push(data[i][pipeline.localId]);
            });
        }

        // Look up respective data for each pipeline
        const results = await Promise.all(pipelines.map(p => readFileOnDemand(p.fileName, p.foreignId, p.ids, p.result.select)));

        // Match each foreign id and append data at "as" field
        for (j = 0; j < dataCount; j++) {
            results.forEach((result, index) => {
                const as = pipelines[index]["as"];
                const id = pipelines[index].localId;
                data[j][as] = result[""+data[j][id]];
            })
        }

        return data;
    }

    function readFileOnDemand(fileName, primaryKeyName = "_id", ids = [], select = null) {
        return new Promise((resolve, reject) => {
            const filteredData = {};
            let noOfData = ids.length;
            const readStream = fs.createReadStream(`${DATA_PATH}/${fileName}`);
    
            readStream
                .pipe(JSONStream.parse("*"))
                .on("data", d => {
                    if (ids.includes(d[primaryKeyName])) {
                        if (select) {
                            filteredData[d[primaryKeyName]] = d[select];
                            d = null;
                        } else {
                            filteredData[d[primaryKeyName]] = d;
                        }
                        noOfData--;
                    } else {
                        d = null;
                    }
    
                    if (noOfData === 0) {
                        readStream.emit("close");
                    }
                })
                .on("close", () => resolve(filteredData))
                .on("error", (err) => reject(err));
        });
    }

    return this;
}

/**
 * @typedef {() => Promise<Array<Object>>} GetAllFunction
 */
function getAll() {
    return new Promise((resolve, reject) => {
        try {
            resolve(require(`./data/${this.fileName}`));
        }
        catch(err) {
            reject(err);
        }
    })
}

/**
 * @typedef {(id: string|number) => Promise<Object|null>} GetByIdFunction
 */
function getById(id) {
    return new Promise((resolve, reject) => {
        let result = null;
        const readStream = fs.createReadStream(`${DATA_PATH}/${this.fileName}`);
        readStream
            .pipe(JSONStream.parse("*"))
            .on("data", data => {
                if (data[this.primaryKey || "_id"] === id) {
                    result = data;
                    readStream.emit("close");
                }
            })
            .on("close", () => {
                resolve(result);
            })
            .on("error", (err) => reject(err));
    });
}

const Region = new (function () {
    Object.defineProperties(this, { 
        "fileName": { value: locationFile.region, enumerable: false },
        "primaryKey": { value: "_id", enumerable: false }
    });

    /**
     * @type {GetAllFunction}
     */
    this.getAll = getAll.bind(this);

    /**
     * @type {GetByIdFunction}
     */
    this.getById = getById.bind(this);
})();

const Township = new (function () {
    Object.defineProperties(this, { 
        "fileName": { value: locationFile.township, enumerable: false },
        "primaryKey": { value: "_id", enumerable: false }
    });

    /**
     * @type {GetAllFunction}
     */
    this.getAll = getAll.bind(this);

    /**
     * @type {GetByIdFunction}
     */
    this.getById = getById.bind(this);
})();

const VillageTract = new (function () {
    Object.defineProperties(this, { 
        "fileName": { value: locationFile.villageTract, enumerable: false },
        "primaryKey": { value: "_id", enumerable: false }
    });

    /**
     * @type {GetAllFunction}
     */
    this.getAll = getAll.bind(this);

    /**
     * @type {GetByIdFunction}
     */
    this.getById = getById.bind(this);
})();

const Village = new (function () {
    Object.defineProperties(this, { 
        "fileName": { value: locationFile.village, enumerable: false },
        "primaryKey": { value: "_id", enumerable: false }
    });

    /**
     * @type {GetAllFunction}
     */
    this.getAll = getAll.bind(this);

    /**
     * @type {GetByIdFunction}
     */
    this.getById = getById.bind(this);
})();

module.exports = {
    Location,
    Region,
    Township,
    VillageTract,
    Village
}