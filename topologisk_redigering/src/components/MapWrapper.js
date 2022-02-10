import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';

//Put vector layer into map. sammanfoga kod från app och wrapper på ett smart sätt 

function MapWrapper( {writeCoordinates} ) {
    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;

    const handleMapClick = (e) => {
        writeCoordinates(e.coordinate)
    }

    useEffect(() => {
        const initialMap = new Map({
          target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: [0, 0],
                zoom: 0,
            }),
        });
        initialMap.on('click', handleMapClick)
        setMap(initialMap);
    }, []);



    return (
      <div style={{height:'100vh',width:'100%'}} ref={mapElement} className="map-container" />
    );
}

export default MapWrapper;