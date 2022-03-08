import React from 'react'
import GeoJSON from 'ol/format/GeoJSON';

/* 
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

    const featuresToGeoJson = () => {
        let features = [];
        if (map) {features = getFeatureList() }
        else {features = []}
        changeGeoJsonData(featuresToGeoJSON(features))
    }

    const getFeatureList = () => {
        return map.getLayers().getArray()[1].getSource().getFeatures()
    }
 */