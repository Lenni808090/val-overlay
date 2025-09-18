import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Allow local HTTPS with self-signed cert (Riot local endpoint)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lockfilePath = path.join(
  process.env.LOCALAPPDATA,
  "Riot Games",
  "Riot Client",
  "Config",
  "lockfile"
);

export async function readLockfile() {
  try {
    const content = await fs.readFile(lockfilePath, "utf-8");
    const parts = content.trim().split(":");
    if (parts.length !== 5) throw new Error("Unexpected lockfile format");
    return { port: parts[2], token: parts[3] };
  } catch (err) {
    console.error("Failed to read lockfile:", err.message);
    throw err;
  }
}

export async function getLocalAccessToken(port, token) {
  const authString = `riot:${token}`;
  const encodedAuth = Buffer.from(authString).toString("base64");

  const res = await fetch(`https://127.0.0.1:${port}/entitlements/v1/token`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${encodedAuth}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get local access token: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.accessToken; // OAuth access token
}

export async function getPUUID(accessToken) {
  const res = await fetch("https://auth.riotgames.com/userinfo", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "",
    },
  });
  if (!res.ok) throw new Error(`Failed to get PUUID: ${res.status}`);
  const data = await res.json();
  return data.sub;
}

export async function getEntitlement(accessToken) {
  const res = await fetch(
    "https://entitlements.auth.riotgames.com/api/token/v1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "",
      },
    }
  );
  if (!res.ok) throw new Error(`Failed to get entitlement: ${res.status}`);
  const data = await res.json();
  return data.entitlements_token;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPregameMatchId(
  region,
  shard,
  puuid,
  accessToken,
  entitlement,
  clientVersion,
  clientPlatform
) {
  const url = `https://glz-${region}-1.${shard}.a.pvp.net/pregame/v1/players/${puuid}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Riot-Entitlements-JWT": entitlement,
        "X-Riot-ClientVersion": clientVersion,
        "X-Riot-ClientPlatform": clientPlatform,
        "User-Agent": "",
      },
    });

    if (res.status === 404) {
      console.log(`Player not in pregame lobby yet`);
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Failed to get pregame match ID: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    const data = await res.json();
    return data.MatchID;
  } catch (error) {
    console.error(`Error during pregame match ID fetch: ${error.message}`);
  }
}

export async function getPregameMapId(
  region,
  shard,
  preGameMatchId,
  accessToken,
  entitlement,
  clientVersion,
  clientPlatform
) {
  const url = `https://glz-${region}-1.${shard}.a.pvp.net/pregame/v1/matches/${preGameMatchId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Riot-Entitlements-JWT": entitlement,
        "X-Riot-ClientVersion": clientVersion,
        "X-Riot-ClientPlatform": clientPlatform,
        "User-Agent": "",
      },
    });

    if (res.status === 404) {
      console.log(`Player not in pregame lobby yet`);
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Failed to get pregame match ID: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    const data = await res.json();
    console.log(data);
    return data.MapID;
  } catch (error) {
    console.error(`Error during pregame match ID fetch: ${error.message}`);
  }
}

export async function lockAgent(
  region,
  shard,
  matchId,
  agentId,
  accessToken,
  entitlement,
  clientVersion,
  clientPlatform
) {
  const url = `https://glz-${region}-1.${shard}.a.pvp.net/pregame/v1/matches/${matchId}/lock/${agentId}`;

  console.log("Attempting to lock agent with URL:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Riot-Entitlements-JWT": entitlement,
      "X-Riot-ClientVersion": clientVersion,
      "X-Riot-ClientPlatform": clientPlatform,
      "Content-Type": "application/json",
      "User-Agent": "",
    },
    body: "{}",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to lock agent: ${res.status} ${res.statusText} - ${text}`
    );
  }
  console.log(`Agent locked successfully with status ${res.status}`);
}
