import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import {Circle, Fill, Stroke, Style} from 'ol/style';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';



//Put vector layer into map. sammanfoga kod från app och wrapper på ett smart sätt 

function MapWrapper( ) {
    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;
    const [coordinates, setCoordinates] = useState([]);
    const [features, setFeatures] = useState([]);
    const [testCoordinates, setTestCoordinates] = useState([]);

    const saveGEOJson = (points) => {
        console.log("saving geojson")
    }

    const handleMapClick = (e) => {
        writeCoordinates(e.coordinate)
    }

    const writeCoordinates = (newCoordinates) => {
    
        console.log(newCoordinates)
        setCoordinates(coordinates => [...coordinates,newCoordinates])
      }
//TODO while drawing add multinine
//TODO change form points to coordinates and dra polygon on start= end
//TODO add precision based on zoom
//
    const drawLayer = () => {
        setFeatures(features => [...features, new Feature(new Point(coordinates[coordinates.length -1]))])
        
        
        let startX = coordinates[0][0].toPrecision(1)
        let startY = coordinates[0][1].toPrecision(1)

        let endX = coordinates[coordinates.length-1][0].toPrecision(1)
        let endY = coordinates[coordinates.length-1][1].toPrecision(1)
        console.log(`${endX}, ${endY}`)
        if (startX === endX && startY === endY && coordinates.length > 2) {
            console.log("saving!")
            const vectorSource = new VectorSource({projection: 'EPSG:4326'})
            vectorSource.addFeatures(features)
            const vectorLayer = new VectorLayer({source: vectorSource})
            
            map.addLayer(vectorLayer)
            //setMap(map)
        
            console.log("såsen är klar")
            
            saveGEOJson(coordinates)
            setCoordinates(coordinates => [])
        }
        console.log("Features:", features)
    }

    const drawFeatures = () => {
       
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
                center: [1800000, 1800000],
                zoom: 5,
            }),
        });
        initialMap.on('click', handleMapClick)
        setMap(initialMap);
    }, []);

    useEffect(() => {
        coordinates.length !== 0? drawLayer(coordinates):
        console.log("FEATURES:", features)
        }, [coordinates])

    useEffect(() => {
        drawFeatures()
        
        }, [features])


    return (
        <div style={{height:'100vh',width:'100%'}} ref={mapElement} className="map-container" />
    );
}

export default MapWrapper;