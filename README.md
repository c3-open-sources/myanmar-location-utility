# Myanmar Location Utility

An utility package for myanmar locations: region, township, village tracts and villages.

## Features
- A flexible system to manage and manipulate location-based data such as `Region`, `Township`, `Village Tract`, and `Village`.

- Provides the ability to read data from pre-defined location files through a simple interface.

- Perform efficient relations across locations using foreign keys with the `lookup` function.

- Queue multiple lookups using a pipeline system that collects foreign keys and efficiently retrieves related data in one go.

- Load large JSON data without consuming high memory.

## Sample json data
- Region data
```json
[
    {
        "_id": 1,
        "mm_name": "ဧရာဝတီ",
        "en_name": "Ayeyarwady"
    }
]
```
- Township data
```json
[
    {
        "_id": 1,
        "mm_name": "ဝါးခယ်မ",
        "en_name": "Wakema",
        "region_id": 1
    }
]
```
- Village tract data
```json
[
    {
        "_id": 1,
        "mm_name": "ချောင်းဆုံ",
        "en_name": "Chaung Sone",
        "region_id": 1,
        "township_id": 1
    }
]
```
- Village data
```json
[
    {
        "_id": 1,
        "mm_name": "သာယာကုန်း",
        "en_name": "Thar Yar Kone",
        "region_id": 1,
        "township_id": 1,
        "village_tract_id": 1
    }
]
```

## Example usage (NodeJs)
- ### Location
    ```js
    const { Location } = require('myanmar-location-utility');

    // Reading all regions from the file
    const regions = await Location().read("region");

    // Lookup example (foreign key relationship lookup)
    const existingData = await Location().read("village");

    const villages = await Location(existingData)
                           .lookup("region", { as: "region_name", localId: "region_id", result: { select: "mm_name" } })
                           .lookup("township", { as: "township", localId: "township_id" })
                           .lookup("villageTract", { as: "villageTract", localId: "village_tract_id" })
                           .get();

    // Sample output of villages variable
    [
        {
            _id: 1,
            mm_name: 'သာယာကုန်း',
            en_name: 'Thar Yar Kone',
            region_id: 1,
            township_id: 1,
            village_tract_id: 1,
            region_name: 'ဧရာဝတီ',
            township: { 
                _id: 1, 
                mm_name: 'ဝါးခယ်မ', 
                en_name: 'Wakema', 
                region_id: 1 
            },
            villageTract: {
                _id: 1,
                mm_name: 'ချောင်းဆုံ',
                en_name: 'Chaung Sone',
                region_id: 1,
                township_id: 1
            }
        }
    ]

    ```

- ### Specific location: Region, Township, Village Tract and Village
    ```js
        const { Region } = require('myanmar-location-utility');

        // Get all regions
        const regions = await Region.getAll();

        // Get region by id
        const region = await Region.getById(1);
    ```





