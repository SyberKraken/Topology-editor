# Topology Editor

This topology editor was created as part of the project course TDP032: Agile System Development at Linköping University.

## Description

Using a combination of JSTS, GeoJson and Openlayers, this topology editor can handle drawing, removing, modifying, merging, saving and loading of polygon based topologies.

User input is interpreted and modified to become valid topology data. For example, overlapping areas of different polygons are removed and polygons being drawn that cross themselves are corrected into several different polygons. 

## Requirements

- Node package manager (NPM) must be installed on the system. For installation instructions, see: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

## Known issues

- Multipolygons could not be fully implemented, leading to some known bugs when using these, sometimes resulting in the multipolygons being removed or not having their overlapping areas fixed.

## Getting started

- Open two instances of the terminal from the project root (the folder or directory where this README is located). One will be running the mock server and one the topology editor.

- In one terminal, start the mock server by running 'npm run http' if you're on Windows, or 'npm run httpl' if you're on MacOS or Linux. 

- In the other terminal, start the topology editor with 'npm start'.

A browser window running the topology editor will shortly be opened. 

## Using the editor

The editor supports both multipolygons and regular polygons. Multipolygons share the same attributes but are split in several self contained areas. Regular polygons have orange points on their corners while multipolygons do not. If one area of a multipolygon is clicked, the entire multipolygon will be selected. 

Operations supported by the editor are listed below:

- **Drawing**: Click on point on the map, then another to create a line between them. Continue placing points until you reach the starting point. Doubleclick to auto-finish the polygon. This creates a line between where you clicked and where the first point was placed.

- **Modifying**: Click and drag a line or point that has already been placed.

- **Merge**: Click on the polygon you want to merge, then click the polygon you want to merge it with. Mergeing two regular polygons that are not connected will turn them into a multipolygon.

- **Delete**: Double click a polygon to delete it. 

- **Save**: Click the save button in the top bar to save the current map to the server. Next time you reload the map, the map's current state will be loaded. 

## Credits

Andrei Platoga
Daniel Huber
Edvin Nilsson Sommermark
Josefin Bodin
Simon Gradin
Theodore Nilsson

