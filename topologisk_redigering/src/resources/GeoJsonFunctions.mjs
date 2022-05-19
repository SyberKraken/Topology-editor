import GeoJSON from 'ol/format/GeoJSON.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js'
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js'
import { Feature } from 'ol';
import { Polygon } from 'ol/geom.js';
/*/-----------------------------------------------------------------------------
This file contains functionlaity for operating on GeoJson objects,
mainly translators into, or from GeoJson concering varieties of 
OpenLayers and JSTS data structures.
-----------------------------------------------------------------------------/*/
/*
    * returns features from first source in OL map object
    * @map = OL map object
    */
export const getFeatureList = (map) => {
    return map.getLayers().getArray()[1].getSource().getFeatures()
}

/*
    * returns OL features from a GeoJson object
    * @geoJsonData = geojson object
    */
export const GeoJsonObjToFeatureList = (geoJsonData) => {
    return (new GeoJSON()).readFeatures(geoJsonData)
}

/*
    * returns a GeoJson object from the first source of an OL map
    * @map = OL map object
    */
export const featuresToGeoJson = (map) => {
    let features = [];
    if (map) {features = getFeatureList(map) }
    else {features = []}
    const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(features)
    jsonObj["crs"] = {
        "type": "name",
        "properties": {
            "name": "EPSG:3006"
        }
    }
    return jsonObj
} 

/*
    * returns a JSTS object from geojsondata
    * @geoJsonData = geojson object
    */
export const geoJsonToJsts = (geoJson) => {
    let jsts = new GeoJSONReader().read(geoJson)
    return jsts
}



/*
    * returns a Geojson object from a JSTS featurecollection or an array of JSTS objects
    * !OBS REQUIRES USE OF .features can not use normal indexing
    * @jstsObject = JSTS featurecollection or array
    */
export const jstsToGeoJson = (jstsObject) => {

    //debugger

    let writer = new GeoJSONWriter()
    let featureList = []

    if(jstsObject.features) {
        jstsObject.features.forEach(feature => {
            let writtenGeometry = writer.write(feature.geometry)
            let polygon = new Polygon(writtenGeometry.coordinates)
            let featureWrapping = new Feature(polygon)
            featureList.push(featureWrapping)
        });
    }
    else {
        jstsObject.forEach(geom => {
            let writtenGeometry = writer.write(geom)
            let polygon = new Polygon(writtenGeometry.coordinates)
            let featureWrapping = new Feature(polygon)
            featureList.push(featureWrapping)
        });
    }

    const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(featureList)

    jsonObj["crs"] = {
        "type": "name",
        "properties": {
            "name": "EPSG:3006"
        }
    }
    return jsonObj
}