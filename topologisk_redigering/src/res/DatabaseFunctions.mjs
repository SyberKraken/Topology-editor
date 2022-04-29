import GeoJSON from "ol/format/GeoJSON.js"
import { geoJsonFeatureCollection2FullGeoJSON } from "../translation/translators.mjs"

// new terminal run command :  npm run http (for windows)
    //                            npm run httpl (for linux)
    // if you get an excution policy error run:
    //      Set-ExecutionPolicy Unrestricted (powershell admin to run http-server)
    // YOU NEED TO INSTALL json-server GLOBALLY FOR THE FOLLOWING FUNCTION TO WORK! (23/2)
    // npm install -g json-server

export const saveToDatabase = (featureCollection) => {
        //const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(features)
        const geojson = geoJsonFeatureCollection2FullGeoJSON(featureCollection)

        //console.log(JSON.stringify(geojson))

        fetch("http://localhost:4000/file1",
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify(geojson)
            })
            .then(function (res) { console.log(res) })
            .catch(function (res) { console.log(res) })
}



export const loadPolyFromDB = ([]) => {      
    //Cant load in layer while runnign at the moment.     
    //realoadMap(vectorLayerFromUrl("geoJsonExample2.geojson"))
}