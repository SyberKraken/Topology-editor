import React from 'react'
import GeoJSON from 'ol/format/GeoJSON';


export const featuresToGeoJSON = (featureList) => {
        const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(featureList)
        jsonObj["crs"] = {
            "type": "name",
            "properties": {
                "name": "EPSG:3006"
            }
        }
        return jsonObj
    }


