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
import { style } from '@mui/system';



//Put vector layer into map. sammanfoga kod från app och wrapper på ett smart sätt 

function MapWrapper( ) {
    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;
    const [coordinates, setCoordinates] = useState([]);
    const [features, setFeatures] = useState([]);
    const [testCoordinates, setTestCoordinates] = useState([]);

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

    const saveGEOJson = (points) => {
        console.log("saving geojson")
    }

    const handleMapClick = (e) => {
        writeCoordinates(e.coordinate)
    }

    const writeCoordinates = (newCoordinates) => {
    
        console.log(newCoordinates)
        setCoordinates(coordinates => [...coordinates, newCoordinates])
    }
    //adds features in he feature list to map and renders to screen
    const updateMap = (newFeature) => {
        const vectorSource = new VectorSource({projection: 'EPSG:4326'})
        vectorSource.addFeature(newFeature)
        const vectorLayer = new VectorLayer({source: vectorSource, style: styles, name: "Tag"})
        map.getLayerGroup().getLayers()
        map.addLayer(vectorLayer)
    }
//TODO Save polygon
//TODO change form points to coordinates and draw polygon on start= end
//TODO add precision based on zoom
//

    const checkPolygonCompleted = (coordinates, precision) => {
        let startX = coordinates[0][0].toPrecision(precision)
        let startY = coordinates[0][1].toPrecision(precision)

        let endX = coordinates[coordinates.length-1][0].toPrecision(precision)
        let endY = coordinates[coordinates.length-1][1].toPrecision(precision)
        console.log(`${endX}, ${endY}`)
        return startX === endX && startY === endY && coordinates.length > 2
    }

    const drawLayer = () => {

        if (coordinates.length > 1){
            let lineString = new LineString([coordinates[coordinates.length-1],coordinates[coordinates.length-2]])
            updateMap((new Feature(lineString) ))
        }
        
        

        //Runs when a propper polygon is detected
        if (checkPolygonCompleted(coordinates, 1)) {
            coordinates[coordinates.length - 1] = coordinates[0]
            const polyT = new Feature(new Polygon([coordinates]) )
            console.log(polyT)
            updateMap(polyT/* TODO Update map with polygon */)
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
        coordinates.length !== 0 && drawLayer(coordinates)
        //console.log("FEATURES: ", features)
        }, [coordinates])

    useEffect(() => {
        drawFeatures()
        
        }, [features])


    return (
        <div style={{height:'100vh',width:'100%'}} ref={mapElement} className="map-container" />
    );
}

export default MapWrapper;