import GeoJSON from 'ol/format/GeoJSON';

    const getFeatureList = (map) => {
        return map.getLayers().getArray()[1].getSource().getFeatures()
    }

    const GeoJsonObjToFeatureList = (geoJsonData) => {
        return (new GeoJSON()).readFeatures(geoJsonData)
    }

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
    }

    /* export const loadGeoJsonData = (map, geoJsonData) => {
        console.log(JSON.stringify(geoJsonData))
        const source = new VectorSource({
            wrapX: false,
            features: GeoJsonObjToFeatureList(geoJsonData)
        });
        map.getLayers().getArray()[1].setSource(source)
    } */