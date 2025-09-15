export async function listAllValorantMaps() {
  try {
    const apiUrl = 'https://valorant-api.com/v1/maps';

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    const maps = data.data;

    const mapsDict = new Map();

    maps.forEach(map => {
      mapsDict.set(map.mapUrl, null);
    });

    console.log(mapsDict);

    return mapsDict;
  } catch (error) {
    console.error("Ein Fehler ist aufgetreten:", error.message);
  }
}
