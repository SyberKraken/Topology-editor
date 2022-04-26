import GeoJSON from 'ol/format/GeoJSON.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js'
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js'
import { Feature } from 'ol';
import { Polygon } from 'ol/geom.js';
import { getJstsGeometryCoordinates } from './getter.mjs';


/* 
    +--------------------------------------------------------------+
    |                           FullGeoJSON                        |
    |                                ^                             |
    |                                |                             |
    |                                v                             |
    |            JSTS             GeoJSON               OL         |
    |        Geometries <--> FeatureCollection <-->   Features     |
    |                                ^                             |
    |                                |                             |
    |                                v                             |
    |            JSTS             GeoJSON               OL         |
    |         Geometry  <-->      Feature      <-->   Feature      |
    +--------------------------------------------------------------+
*/

/* Takes a full GeoJSON object and returns a GeoJSON FeatureCollection */
export const fullGeoJson2GeoJsonFeatureCollection = (fullGeoJson) => {
    delete fullGeoJson["crs"]
    return fullGeoJson
    //return featureCollection
}


/* Takes a featureCollection and returns a complete geoJson  */
export const geoJsonFeatureCollection2FullGeoJSON = (featureCollection) => {
    featureCollection["crs"] = {
        "type": "name",
        "properties": {
            "name": "EPSG:3006"
            }
        }
    //console.log(featureCollection)
    return featureCollection
}


/* Takes a GeoJSON FeatureCollection and returns a GeoJSON Feature */
export const geoJsonFeatureCollection2GeoJsonFeature = (geoJsonFeatureCollection, index) => {
    let geoJsonFeature = geoJsonFeatureCollection.features[index]
    return geoJsonFeature
}

/* Takes a GeoJSON Feature and returns a GeoJSON Feature Collection with a single*/
export const geoJsonFeature2geoJsonFeatureCollection = (geoJsonFeature) => {
    let geoJsonFeatureCollection = {
        "type":"FeatureCollection",
        "features":[]
    }
    geoJsonFeatureCollection.features.push(geoJsonFeature)
    return geoJsonFeatureCollection
}

/* Takes a featureCollection and returns an array of jsts geometries */
export const geoJsonFeatureCollection2JstsGeometries = (geoJsonFeatureCollection) => {
    
    let geometries = []
    geoJsonFeatureCollection.features.forEach(feature => {
        let geometry = geoJsonFeature2JstsGeometry(feature)
        geometries.push(geometry)
    })
    return geometries
}


/* takes an array of geometries and returns a FeatureCollection */
export const jstsGeometries2GeoJsonFeatureCollection = (jstsGeometries) => {

    let writer = new GeoJSONWriter()
    let featureList = []

    jstsGeometries.forEach(geom => {
        let writtenGeometry = writer.write(geom)
        let polygon = new Polygon(writtenGeometry.coordinates)
        let featureWrapping = new Feature(polygon)
        featureList.push(featureWrapping)
    });
    
    const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(featureList)
    return jsonObj
}

// ........ The functions above this line are where  want them to be

/* takes a geoJson feature and returns a jsts geometry  */
export const geoJsonFeature2JstsGeometry = (geoJsonFeature) => {
    const reader = new GeoJSONReader()
    let jsts = reader.read(geoJsonFeature)
    return jsts.geometry
}

/* Takes a jsts geometry and returns a geoJson feature */
export const jstsGeometry2GeoJsonFeature = (jstsGeometry) => {
    let writer = new GeoJSONWriter()
    let newFeature

    let writtenGeometry = writer.write(jstsGeometry)
    let polygon = new Polygon(writtenGeometry.coordinates)
    newFeature = new Feature(polygon)

    return newFeature
}

/* Takes an array of ol features and returns a feature collection */        
export const olFeatures2GeoJsonFeatureCollection = (olFeatures) => {
    console.log(olFeatures)
    const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(olFeatures)
    return jsonObj
} 

/* Takes a geoJson featureCollection and returns an Array of features */
export const geoJsonFeatureCollection2olFeatures = (featureCollection) => {
    return new GeoJSON().readFeatures(featureCollection)
}

export const olFeature2geoJsonFeature = (olFeature) => {
    let geoJsonFeature = new GeoJSON().writeFeatureObject(olFeature)
    return geoJsonFeature
}

export const geoJsonFeature2olFeature = (geoJsonFeature) => {
    let olFeature = new GeoJSON().readFeature(geoJsonFeature)
    return olFeature
}

export const geoJsonFeatureList2geoJsonFeatureCollection = (geoJsonFeatureList) => {
   
}

