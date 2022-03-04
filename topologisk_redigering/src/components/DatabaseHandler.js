import GeoJSON from "ol/format/GeoJSON"

export const saveToDatabase = (features) => {
        const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(features)
        jsonObj["crs"] = {
            "type": "name",
            "properties": {
                "name": "EPSG:3006"
            }
        }

        console.log(JSON.stringify(jsonObj))

        fetch("http://localhost:4000/file1",
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify(jsonObj)
            })
            .then(function (res) { console.log(res) })
            .catch(function (res) { console.log(res) })
}

export const GeoJsonObjToFeatureList = (geoJsonData) => {
        return (new GeoJSON()).readFeatures(geoJsonData)
}

export const loadPolyFromDB = ([]) => {      
    //Cant load in layer while runnign at the moment.     
    //realoadMap(vectorLayerFromUrl("geoJsonExample2.geojson"))
}