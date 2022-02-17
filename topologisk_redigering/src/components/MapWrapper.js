import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import {Fill, Stroke, Style} from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';

//TODO Save polygon
//TODO Put vector layer into map. sammanfoga kod från app och wrapper på ett smart sätt 

function MapWrapper() {
    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;
    const [draw, setDraw] = useState()

    const source = new VectorSource({wrapX: false});
    
    const vector = new VectorLayer({
        source: source,
      });
      //console.log(`SOURCE: ${source}`)

    const drawPolygon = () => {
        setDraw(new Draw({
            source: source,
            type: "Polygon",
        }));
    }

    const styles = [
        new Style({
            stroke: new Stroke({
              color: 'red',
              width: 1,
            }),
            fill: new Fill({
              color: 'rgba(125, 255, 255, 0.5)',
            }),
          }),
    ]

    const handleMapClick = (e) => {
        
    }


    /*const updateMap = (newFeature) => {
        const vectorSource = new VectorSource({projection: 'EPSG:4326'})
        vectorSource.addFeature(newFeature)
        const vectorLayer = new VectorLayer({source: vectorSource, style: styles, name: "Tag"})
        map.getLayerGroup().getLayers()
        map.addLayer(vectorLayer)
    }*/

    useEffect(() => {
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({ 
                    source: new OSM(),
                }),
                vector
            ],
            view: new View({
                center: [1800000, 1800000],
                zoom: 5,
            }),
        });
        initialMap.on('click', handleMapClick)
        setMap(initialMap);
        drawPolygon();  //TODO: move to button interaction

    }, []);

    useEffect(() => {
        if (map) {
             map.addInteraction(draw) 
            }
        }, [draw])

    return (
        <div style={{height:'100vh',width:'100%'}} ref={mapElement} className="map-container" />
    );
}

export default MapWrapper;
