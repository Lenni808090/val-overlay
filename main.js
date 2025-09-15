const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const {
  readLockfile,
  getLocalAccessToken,
  getPUUID,
  getEntitlement,
  getPregameMatchId,
  lockAgent,
  sleep,
  getPregameMapId,
} = require("./apiClient.js");

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 390,
    height: 520,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setAlwaysOnTop(true, "screen-saver");

  mainWindow.loadFile("index.html");
}

let canceled = false;

ipcMain.on("lock-canceled", async () => {
  canceled = true;
  console.log("abgebrochen");
});

ipcMain.on("lock-agent", async (event, agentId) => {
  console.log(`✅ Agent ID empfangen im Main Process: ${agentId}`);
  try {
    mainWindow.webContents.send("update-status", "Lese Lockfile...");
    const { port, token } = await readLockfile();

    mainWindow.webContents.send("update-status", "Hole Access Token...");
    const accessToken = await getLocalAccessToken(port, token);

    const clientVersion = "release-07.08-shipping-10-639691";
    const clientPlatform =
      "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9";
    const region = "eu";
    const shard = "eu";

    if (canceled) {
      mainWindow.webContents.send("update-status", "Vorgang abbgebrochen");
      canceled = false;
      mainWindow.webContents.send("cancel-success");
      return;
    }
    mainWindow.webContents.send("update-status", "Hole PUUID...");
    const puuid = await getPUUID(accessToken);

    if (canceled) {
      mainWindow.webContents.send("update-status", "Vorgang abbgebrochen");
      canceled = false;
      mainWindow.webContents.send("cancel-success");
      return;
    }
    mainWindow.webContents.send("update-status", "Hole Entitlement...");
    const entitlement = await getEntitlement(accessToken);

    if (canceled) {
      mainWindow.webContents.send("update-status", "Vorgang abbgebrochen");
      canceled = false;
      mainWindow.webContents.send("cancel-success");
      return;
    }
    mainWindow.webContents.send("update-status", "Warte auf Pregame-Match...");
    let matchId = null;
    while (!matchId) {
      if (canceled) {
        mainWindow.webContents.send("update-status", "Vorgang abgebrochen.");
        canceled = false;
        mainWindow.webContents.send("cancel-success");
        return;
      }
      matchId = await getPregameMatchId(
        region,
        shard,
        puuid,
        accessToken,
        entitlement,
        clientVersion,
        clientPlatform
      );
    }

    let mapId = await getPregameMapId(        
        region,
        shard,
        matchId,
        accessToken,
        entitlement,
        clientVersion,
        clientPlatform
      );
    
    console.log(mapId);
    mainWindow.webContents.send("update-status", "Warte 7 Sekunden...");

    let ms = 7500;
    while (ms >= 0) {
      if (canceled) {
        mainWindow.webContents.send("update-status", "❌ Vorgang abgebrochen.");
        return;
      }
      await sleep(100);
      ms -= 100;
    }

    if (canceled) {
      mainWindow.webContents.send("update-status", "Vorgang abbgebrochen");
      return;
    }
    mainWindow.webContents.send("update-status", "Locke Agent...");
    await lockAgent(
      region,
      shard,
      matchId,
      agentId,
      accessToken,
      entitlement,
      clientVersion,
      clientPlatform
    );

    mainWindow.webContents.send("lock-success");

    mainWindow.webContents.send("update-status", "Agent erfolgreich gelockt!");
  } catch (err) {
    mainWindow.webContents.send(
      "update-status",
      `Fehler beim Locken: ${err.message}`
    );
  }
});


app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
