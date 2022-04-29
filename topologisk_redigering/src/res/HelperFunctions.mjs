
export const deletePolygon = (map, polygon) => {
    if (map) {
        let layers = map.getLayers().getArray()[1].getSource()
        layers.removeFeature(polygon)                      
    } 
  }

const isClockwise = (polygon) => {
  //console.log(polygon)
  const coordinates = polygon.geometry.coordinates[0]
  let sum = 0 
  for (let i = 0; i + 1 < coordinates.length; i++) {
    sum += (coordinates[i+1][0]-coordinates[i][0])*(coordinates[i+1][1]+coordinates[i][1])
  }

  return sum > 0
}

export const fixCoordinateRotation = (polygon) => {
  //console.log(polygon)
  if (isClockwise(polygon)) {
    let coordinates = polygon.geometry.coordinates[0]
    polygon.geometry.coordinates[0] = coordinates.reverse()
  }
  return polygon
  
}
  
export const coordinatesAreEquivalent = (coordinateArray1, coordinateArray2) => {
  let i = 0;
  while (coordinateArray2[i] && JSON.stringify(coordinateArray1[0]) != JSON.stringify(coordinateArray2[i])) {
    i++;
  }
  if(!coordinateArray2[i]){
    return false
  }
  for(let j = 0; j < coordinateArray1.length; j++, i++){
    if(JSON.stringify(coordinateArray1[j]) != JSON.stringify(coordinateArray2[i % coordinateArray2.length])){
      return false
    }
  }
  return true
}
/*   const getFeatureList = (map) => {
    return map.getLayers().getArray()[1].getSource().getFeatures()
  } */