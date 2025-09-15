export async function listAllValorantAgentsWithIds() {
  try {
    const apiUrl = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true';
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);

    const data = await response.json();
    const agents = data.data;

    if (!agents || agents.length === 0) return [];

    const agentObjs = [];
    agents.forEach(agent => {
      agentObjs.push({ [agent.displayName]: agent.uuid });
    });

    return agentObjs;

  } catch (error) {
    console.error("Ein Fehler ist aufgetreten:", error.message);
    return [];
  }
}

