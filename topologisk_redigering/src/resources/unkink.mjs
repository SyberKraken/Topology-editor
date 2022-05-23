import simplepolygon from 'simplepolygon';
import IsValidOp from "jsts/org/locationtech/jts/operation/valid/IsValidOp.js";
import { Point, LineString, LinearRing, Polygon, MultiLineString, MultiPolygon } from 'ol/geom.js'
import MultiPoint from 'ol/geom/MultiPoint.js';
import { geoJsonFeature2JstsGeometry, geoJsonFeature2geoJsonFeatureCollection } from '../translation/translators.mjs';
import { fixCoordinateRotation } from './HelperFunctions.mjs';

/*
 * return true if @geoJsonFeature is valid, definition of valid in IsValidOP
 * @param {Feature} geoJsonFeature : GeoJson feature
 * @return {Bool}
*/
export const isValid = (geoJsonFeature) => {
    let jstsLastDrawnPoly
    try {
        jstsLastDrawnPoly = geoJsonFeature2JstsGeometry(geoJsonFeature)
        return IsValidOp.isValid(jstsLastDrawnPoly);
    } catch (error) {
        console.log("isvalid error")
        console.log("if illegalArgumentException cause is from mergepolygon")
        console.log(error)
    }
    return false
}

/*
 * unkinks a polygon and returns the resulting polygon(s)
 * @param {Feature} geoJsonFeature : Geojson feature
 * @return {FeatureCollection} : GeoJson FeatureCollection
*/
export const unkink = (polygon) => {
    //dont unkink multipoly?
    if (polygon.geometry.type !== "MultiPolygon")
    {        
        let unkinkedPolygons = simplepolygon(polygon)
        unkinkedPolygons.features.forEach(polygon => {
            polygon = fixCoordinateRotation(polygon)
        })
        return unkinkedPolygons
    }
    else {
        //TODO: support for unkink on multipolygons would perhaps start here...
        return geoJsonFeature2geoJsonFeatureCollection(polygon)
    }
}
