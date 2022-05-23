import GeoJSON from 'ol/format/GeoJSON.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js'
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js'
import { Feature } from 'ol';
import { MultiPolygon, Polygon } from 'ol/geom.js';
import { GeometryFactory } from 'jsts/org/locationtech/jts/geom.js';

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

let propertiesTableJSTS = new Map()

/* 
*   Generates a random number to be used as an id in jsts geometry and the properties table
*   in order to keep track of properties at geojson <-> jsts conversion
*/
function getRandomId() {
    let id = Math.floor(Math.random() * 1000)
    if (propertiesTableJSTS.has(id)){
        getRandomId()
    }
    return id 
}


/* 
*   extract only featurecollection from a full geojson object
*   @param  {GeoJson Object}    fullGeoJson     A complete geojson object
*   @return {GeoJson FeatureCollection}         Extracted featureCollection from complete geojson
*/
export const fullGeoJson2GeoJsonFeatureCollection = (fullGeoJson) => {
    delete fullGeoJson["crs"]
    return fullGeoJson
}

/*  
*   convert a geojson featureCollection to a complete geojson object
*   @param  {GeoJson FeatureCollection}  featureCollection  a geojson featureCollection
*   @return {GeoJson Object}                                a complete geojson object
*/
export const geoJsonFeatureCollection2FullGeoJSON = (featureCollection) => {
    featureCollection["crs"] = {
        "type": "name",
        "properties": {
            "name": "EPSG:3006"
            }
        }
    return featureCollection
}

/* Takes a GeoJSON FeatureCollection and returns a GeoJSON Feature */
/*  
*   extract a single geojson feature from a geojson featureCollection
*   @param  {GeoJson FeatureCollection} geojsonFeatureCollection    a geojson featureCollection
*   @param  {Number}                    index                       a number specifying at which index in geojson featurecollecion you want to extract geojson feature from
*   @return {GeoJson Feature}                                       an extracted geojson feature.
*/
export const geoJsonFeatureCollection2GeoJsonFeature = (geoJsonFeatureCollection, index) => {
    let geoJsonFeature = geoJsonFeatureCollection.features[index]
    return geoJsonFeature
}

/*  
*   convert a single geojson feature to a geojson featureCollection
*   @param  {GeoJson Feature}   geoJsonFeature      a single geojson feature
*   @return {GeoJson FeatureCollection}             a geojson featureCollection with a single feature
*/
export const geoJsonFeature2geoJsonFeatureCollection = (geoJsonFeature) => {
    let geoJsonFeatureCollection = {
        "type":"FeatureCollection",
        "features":[]
    }
    geoJsonFeatureCollection.features.push(geoJsonFeature)
    return geoJsonFeatureCollection
}

/* takes a geoJson feature and returns a jsts geometry  */
/*  
*   convert a geojson feature to a jsts geometry. Store the features properties in a table mapping to a randomly generated id that is given to the geometry.
*   @param  {GeoJson Feature}   geoJsonFeature  a single geojson Feature
*   @return {JSTS Geometry}                     the converted geometry
*/
export const geoJsonFeature2JstsGeometry = (geoJsonFeature) => {

    let jsts
    if(geoJsonFeature.geometry.type === "Polygon"){
        jsts = new GeoJSONReader().read(geoJsonFeature.geometry)
        jsts.setSRID(getRandomId())
        propertiesTableJSTS.set(jsts._SRID, geoJsonFeature.properties)
        return jsts
    } else if(geoJsonFeature.geometry.type === "MultiPolygon"){
        jsts = new GeometryFactory().createMultiPolygon(geoJsonFeature.geometry)
        jsts.setSRID(getRandomId())
        propertiesTableJSTS.set(jsts._SRID, geoJsonFeature.properties)
        return jsts
    }


}

/* Takes a jsts geometry and returns a geoJson feature */
/*
*   convert a jsts geometry to a geojson feature. properties are fetched from table and added to feature  
*   @param   {JSTS Geometry}    jstsGeometry    a jsts geometry object
*   @return  {GeoJson Feature}                  a geojson feature that is either a polygon or a multipolygon
*/
export const jstsGeometry2GeoJsonFeature = (jstsGeometry) => {
    if(jstsGeometry.getGeometryType() === "Polygon"){
        let writer = new GeoJSONWriter()
        let getProperties = propertiesTableJSTS.get(jstsGeometry._SRID)
        propertiesTableJSTS.delete(jstsGeometry._SRID)
        let writtenGeometry = writer.write(jstsGeometry)    
        let polygon = new Polygon(writtenGeometry.coordinates)
        let newFeature = new Feature(polygon)
        newFeature.setProperties(getProperties)
        newFeature = new GeoJSON().writeFeatureObject(newFeature)
        return newFeature
    } else if (jstsGeometry.getGeometryType() === "MultiPolygon"){
        let properties = propertiesTableJSTS.get(jstsGeometry._SRID)
        const coordinates = jstsGeometry._geometries.coordinates
        const multiPolygon = new MultiPolygon([coordinates])
        let newFeature = new Feature(multiPolygon)
        newFeature.setProperties(properties)
        return new GeoJSON().writeFeatureObject(newFeature)
    }
}


/*  
*   convert a featureCollection to an array of jsts geometries
*   @param  {GeoJson FeatureCollection}     geojsonFeatureCollection    a geojson featureCollection
*   @return {JSTS GeometryCollection}                                   an array of jsts geometries
*/
export const geoJsonFeatureCollection2JstsGeometries = (geoJsonFeatureCollection) => {
    
    let geometries = []
    geoJsonFeatureCollection.features.forEach(feature => {
        let geometry = geoJsonFeature2JstsGeometry(feature)
        geometries.push(geometry)
    })
    return geometries
}

/*  
*   convert an array of jsts geometries to geojson features and adds them to a geojson featureCollection
*   @param  {JSTS GeometryCollection}   jstsGeometries      an array of jsts geometries
*   @return {GeoJson FeatureCollection}                     a geojson featureCollection
*/
export const jstsGeometries2GeoJsonFeatureCollection = (jstsGeometries) => {

    let featureList = []
    let featureCollection = {
        "type":"FeatureCollection",
        "features":[]
    }

    jstsGeometries.forEach(geom => {
        let newFeature = jstsGeometry2GeoJsonFeature(geom)
        featureList.push(newFeature)
    });
    
    featureCollection.features = featureList
    return featureCollection
}

/*  
*   convert an array of openlayers features to a geojson featureCollection
*   @param  {OpenLayers Features}   olFeatures  an array of openlayers features
*   @return {GeoJson FeatureCollection}         a geojson featureCollection
*/     
export const olFeatures2GeoJsonFeatureCollection = (olFeatures) => {
    const jsonObj = new GeoJSON({ projection: "EPSG:3006" }).writeFeaturesObject(olFeatures)
    return jsonObj
} 


/*  
*   convert a geojson featureCollection to an array of openlayers features
*   @param  {GeoJson FeatureCollection} featureCollection   a geojson featureCollection
*   @return {OpenLayers Features}                           an array of openlayers features
*/
export const geoJsonFeatureCollection2olFeatures = (featureCollection) => {
    return new GeoJSON().readFeatures(featureCollection)
}

/*  
*   convert an openlayer feature to a geojson feature
*   @param  {OpenLayers Feature}    olFeature   an openlayers feature
*   @return {GeoJson Feature}                   a geojson feature
*/
export const olFeature2geoJsonFeature = (olFeature) => {
    let geoJsonFeature = new GeoJSON().writeFeatureObject(olFeature)
    return geoJsonFeature
}

/*  
*   convert a geojson feature to an openlayers feature
*   @param  {GeoJson Feature}   geoJsonFeature    a geojson feature
*   @return {OpenLayers Feature}                  an openlayers feature
*/
export const geoJsonFeature2olFeature = (geoJsonFeature) => {
    let olFeature = new GeoJSON().readFeature(geoJsonFeature)
    return olFeature
}

/*  
*   convert a list of geojson features to a geojson featureCollection
*   @param  {Array}     geoJsonFeatureList      an array of geojson features
*   @return {GeoJson FeatureCollection}         a geojson featurecollection containing all features from in param
*/
export const geoJsonFeatureList2geoJsonFeatureCollection = (geoJsonFeatureList) => {
    let featureCollection = {
        "type":"FeatureCollection",
        "features":[]
    }
   featureCollection.features = geoJsonFeatureList
   return featureCollection
}

