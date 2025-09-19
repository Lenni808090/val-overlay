let savedMaps = new Map();

export function setAgentToMap(mapUrl, agentId) {
  const cachedMap = savedMaps.get(mapUrl);
  savedMaps.set(mapUrl, {...cachedMap, agentId: agentId});
}

export function saveMaps() {
  const mapsArray = Array.from(savedMaps.entries());
  localStorage.setItem('valorantMaps', JSON.stringify(mapsArray));
}

export function getSavedMaps(){
  loadMaps();
  return savedMaps;
}

export function loadMaps() {
  const saved = localStorage.getItem('valorantMaps');
  if (saved) {
    const mapsArray = JSON.parse(saved);
    savedMaps = new Map(mapsArray);
  }
}



export async function listAllValorantMaps() {
  try {
    const apiUrl = 'https://valorant-api.com/v1/maps';

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    const maps = data.data;

    loadMaps();
    maps.forEach(map => {
      if (!map.mapUrl.includes("HURM") && !map.mapUrl.includes("Range") && !map.mapUrl.includes("NPE")) {
          if(!savedMaps.has(map.mapUrl)) {
            savedMaps.set(map.mapUrl, {mapName: map.displayName, agentId: null});
            console.log(`Map ${map.displayName} (${map.mapUrl}) added to saved maps`);
          }
      }
    });

    console.log(savedMaps);

    saveMaps();
    
    return savedMaps; 
  } catch (error) {
    console.error("Ein Fehler ist aufgetreten:", error.message);
    return []; 
  }
}
