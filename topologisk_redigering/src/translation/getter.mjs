//Getters for geoJSON "Features"

export const getFeatureCoordinates = (feature) => {
    return feature.getCoordinates
}

export const getOlFeatureCoordinates = (olFeature) => {
    return olFeature.getGeometry().getCoordinates()
}

//returns a list of ol feature objects
export const getListOfOlFeaturesFromMap = (map) => {
    return map.getLayers().getArray()[1].getSource().getFeatures()
}

export const getJstsGeometryCoordinates = (geom) => {
    let coords = []
    //if multipolygon, return all polygons in the coordinate in a single array
    if (geom._geometries) {   
        geom._geometries.forEach(geometry => {
            geometry._shell._points._coordinates.forEach(coordinatespair => {
                coords.push(coordinatespair)
            })
        });
        return coords
    }
    //else return the polygon's coordinates
    else {
        coords = geom._shell._points._coordinates
        return coords
    }
}

//Getters for geoJSON "FeatureCollections"
export const getGeoJsonProperties = (geosjonFeature) => {
    return geosjonFeature.properties
}

