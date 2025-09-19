
import { listAllValorantAgentsWithIds } from "./new-agentss.js";
import { listAllValorantMaps, setAgentToMap, saveMaps } from "./new-maps.js";

console.log("Starting renderer.js...");

async function init() {
  try {
    console.log("Fetching agents...");
    const agents = await listAllValorantAgentsWithIds();
    console.log("Agents fetched:", agents);
    
    console.log("Fetching maps...");
    const maps = await listAllValorantMaps();
    console.log("Maps fetched:", maps);

  const agentButtons = document.getElementById("agentButtons");
  const lockButton = document.getElementById("lockButton");
  const lockMapButton = document.getElementById("lockMapButton");
  const abbrechenButton = document.getElementById("abbrechenButton");
  const statusEl = document.getElementById("status");

  abbrechenButton.disabled = true;
  let activeButton = null;
  let selectedAgentId = null;
  let selectedAgentName = null;

  agents.forEach(agentObj => {
    const agentName = Object.keys(agentObj)[0];
    const agentId = agentObj[agentName];

    const btn = document.createElement("button");
    btn.textContent = agentName.charAt(0).toUpperCase() + agentName.slice(1);

    btn.onclick = () => {
      if (activeButton) activeButton.classList.remove("active");
      btn.classList.add("active");
      activeButton = btn;

      selectedAgentId = agentId;
      selectedAgentName = agentName;

      statusEl.textContent = `🕒 Bereit zum Locken: ${agentName}`;
    };

    agentButtons.appendChild(btn);
  });

  // Lock
  lockButton.onclick = () => {
    if (!selectedAgentId) {
      statusEl.textContent = "⚠️ Bitte wähle zuerst einen Agent!";
      return;
    }

    lockButton.disabled = true;
    abbrechenButton.disabled = false;

    statusEl.textContent = `🔒 ${selectedAgentName} wird gelockt...`;
    window.electronAPI.lockAgent(selectedAgentId);
  };

  // Lock based on current map's configured agent
  lockMapButton.onclick = async () => {
    lockMapButton.disabled = true;
    abbrechenButton.disabled = false;
    statusEl.textContent = "🔒 Lock Map-Agent wird gestartet...";
    
    // Get saved maps from localStorage in the frontend
    const { getSavedMaps } = await import('./new-maps.js');
    const savedMaps = getSavedMaps();
    
    // Send the saved maps data to main process
    window.electronAPI.lockMapAgentWithData(Array.from(savedMaps.entries()));
  };

  abbrechenButton.onclick = () => {
    window.electronAPI.cancelLock();
    abbrechenButton.disabled = true;
  };

  window.electronAPI.onCancelSuccess(() => {
    abbrechenButton.disabled = true;
    lockButton.disabled = false;
    if (lockMapButton) lockMapButton.disabled = false;
  });

  window.electronAPI.onLockSuccess(() => {
    lockButton.disabled = false;
    if (lockMapButton) lockMapButton.disabled = false;
  });

  window.electronAPI.onStatusUpdate(status => {
    statusEl.textContent = status;
  });

  // Create map-agent selection interface
  createMapAgentSelection(maps, agents);

    console.log("Renderer setup complete!");
  } catch (error) {
    console.error("Error in renderer.js:", error);
  }
}

function createMapAgentSelection(maps, agents) {
  const mapListEl = document.getElementById("mapList");
  
  mapListEl.innerHTML = "";
  
  const mapContainer = document.createElement("div");
  mapContainer.className = "map-agent-container";
  
  const mapsArray = Array.from(maps.entries());
  
  mapsArray.forEach(([mapUrl, mapData]) => {
    const mapItem = document.createElement("div");
    mapItem.className = "map-item";
    
    const mapNameEl = document.createElement("h3");
    mapNameEl.textContent = mapData.mapName;
    mapNameEl.className = "map-name";
    
    const agentSelect = document.createElement("select");
    agentSelect.className = "agent-select";
    agentSelect.dataset.mapUrl = mapUrl;
    
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Kein Agent gewählt";
    agentSelect.appendChild(defaultOption);
    
    agents.forEach(agentObj => {
      const agentName = Object.keys(agentObj)[0];
      const agentId = agentObj[agentName];
      
      const option = document.createElement("option");
      option.value = agentId;
      option.textContent = agentName.charAt(0).toUpperCase() + agentName.slice(1);
      
      if (mapData.agentId === agentId) {
        option.selected = true;
      }
      
      agentSelect.appendChild(option);
    });
    
    agentSelect.addEventListener("change", (e) => {
      const selectedAgentId = e.target.value;
      const mapUrl = e.target.dataset.mapUrl;
      
      setAgentToMap(mapUrl, selectedAgentId);
      saveMaps();
      
      console.log(`Agent ${selectedAgentId} assigned to map ${mapUrl}`);
    });
    
    mapItem.appendChild(mapNameEl);
    mapItem.appendChild(agentSelect);
    
    mapContainer.appendChild(mapItem);
  });
  
  mapListEl.appendChild(mapContainer);
}
init();
