import { listAllValorantMaps } from "./new-maps.js";
import { listAllValorantAgentsWithIds } from "./new-agentss.js";

const agents = await listAllValorantAgentsWithIds();
const mapDict = await listAllValorantMaps();
const agentButtons = document.getElementById("agentButtons");
const lockButton = document.getElementById("lockButton");
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

abbrechenButton.onclick = () => {
  window.electronAPI.cancelLock();
  abbrechenButton.disabled = true;
};

window.electronAPI.onCancelSuccess(() => {
  abbrechenButton.disabled = true;
  lockButton.disabled = false;
});

window.electronAPI.onLockSuccess(() => {
  lockButton.disabled = false;
});

window.electronAPI.onStatusUpdate(status => {
  statusEl.textContent = status;
});
