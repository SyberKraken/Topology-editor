import { geoJsonFeatureCollection2FullGeoJSON } from "../translation/translators.mjs"

// new terminal run command :  npm run http (for windows)
    //                            npm run httpl (for linux)
    // if you get an excution policy error run:
    //      Set-ExecutionPolicy Unrestricted (powershell admin to run http-server)
    // YOU NEED TO INSTALL json-server GLOBALLY FOR THE FOLLOWING FUNCTION TO WORK! (23/2)
    // npm install -g json-server

/* Saves a GeoJson featureCollection to the file that was used as input data. */
export const saveToFile = (featureCollection) => {
        const geojson = geoJsonFeatureCollection2FullGeoJSON(featureCollection)

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