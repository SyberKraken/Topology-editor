/*/-----------------------------------------------------------------------------
This file contains extra helperfunctions for use anywhere
-----------------------------------------------------------------------------/*/

/*
    * removes matching feature from map, map is in this case a refrence.
    * @param    {Map} map: OL map object
    * @param    {Feature} polygon: OL feature to be removed
    */
export const deletePolygon = (map, polygon) => {
    if (map) {
        let layers = map.getLayers().getArray()[1].getSource()
        layers.removeFeature(polygon)                      
    } 
  }

/*
  * Returns if given polygons coordinate array is clockwise.
  * This does not guarantted to work with other types of geometry
  *  or features BCO(line 23).
  * @param    {Polygon} polygon: GeoJson polygon to be checked
  * @return   {Bool} : true or false
  */
const isClockwise = (polygon) => {
  const coordinates = polygon.geometry.coordinates[0]
  let sum = 0 
  for (let i = 0; i + 1 < coordinates.length; i++) {
    sum += (coordinates[i+1][0]-coordinates[i][0])*(coordinates[i+1][1]+coordinates[i][1])
  }

  return sum > 0
}


/*
  * Inverts coordinate array of given polygon.
  * This does not guaranteed to work with other types of geometry
  * @param    {Polygon} polygon: GeoJson polygon to be inverted
  * @return   {Polygon} : GeoJson polygon with inverted coordinate array
  */
export const fixCoordinateRotation = (polygon) => {
  if (isClockwise(polygon)) {
    let coordinates = polygon.geometry.coordinates[0]
    polygon.geometry.coordinates[0] = coordinates.reverse()
  }
  return polygon
  
}

/*
  * Checks if two coordinate arrays are equivalen (BROKEN)
  * This function might not be working as intended TODO: fix
  * @param   {Array[[int, int]]} coordinateArray1 : List of coordinate pairs
  * @param   {Array[[int, int]]} coordinateArray2 : List of coordinate pairs
  * @return  {Bool} : true or false
  */
export const coordinatesAreEquivalent = (coordinateArray1, coordinateArray2) => {
  let i = 0;
  while (coordinateArray2[i] && JSON.stringify(coordinateArray1[0]) !== JSON.stringify(coordinateArray2[i])) {
    i++;
  }
  if(!coordinateArray2[i]){
    return false
  }
  for(let j = 0; j < coordinateArray1.length; j++, i++){
    if(JSON.stringify(coordinateArray1[j]) !== JSON.stringify(coordinateArray2[i % coordinateArray2.length])){
      return false
    }
  }
  return true
}
