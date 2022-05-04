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
    return geom._shell._points._coordinates
}
//Getters for geoJSON "FeatureCollections"


export const getGeoJsonProperties = (geosjonFeature) => {
    return geosjonFeature.properties
}

