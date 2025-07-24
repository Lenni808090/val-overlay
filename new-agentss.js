// Speichere diesen Code in einer Datei, z.B. listAgentsWithIds.js

async function listAllValorantAgentsWithIds() {
  try {
    // API-URL, um nur spielbare Charaktere zu erhalten
    const apiUrl = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true';

    // Sende die Anfrage an die API
    const response = await fetch(apiUrl);

    // Prüfe auf Fehler bei der Anfrage
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    const agents = data.data;

    if (agents && agents.length > 0) {
      console.log("Hier ist eine Liste aller spielbaren Valorant-Agenten mit ihren UUIDs:");

      // Sortiere die Agenten-Objekte alphabetisch nach ihrem Anzeigenamen
      agents.sort((a, b) => a.displayName.localeCompare(b.displayName));

      // Gib für jeden Agenten den Namen und die UUID aus
      agents.forEach(agent => {
        console.log(`- ${agent.displayName}: ${agent.uuid}`);
      });
      
    } else {
      console.log("Es konnten keine spielbaren Agenten gefunden werden.");
    }
  } catch (error) {
    console.error("Ein Fehler ist aufgetreten:", error.message);
  }
}

// Führe die Funktion aus
listAllValorantAgentsWithIds();