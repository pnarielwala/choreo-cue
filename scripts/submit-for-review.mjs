import { execSync } from "node:child_process";
import { createSign } from "node:crypto";

const { ASC_API_KEY_ID, ASC_API_ISSUER_ID, ASC_API_KEY, ASC_APP_ID } =
  process.env;

if (!ASC_API_KEY_ID || !ASC_API_ISSUER_ID || !ASC_API_KEY || !ASC_APP_ID) {
  console.error(
    "Missing required env vars: ASC_API_KEY_ID, ASC_API_ISSUER_ID, ASC_API_KEY, ASC_APP_ID"
  );
  process.exit(1);
}

const BASE_URL = "https://api.appstoreconnect.apple.com/v1";
const POLL_INTERVAL_MS = 60_000;
const MAX_POLL_MINUTES = 15;

function generateJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "ES256", kid: ASC_API_KEY_ID, typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: ASC_API_ISSUER_ID,
      iat: now,
      exp: now + 1200,
      aud: "appstoreconnect-v1",
    })
  ).toString("base64url");

  const sign = createSign("SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign
    .sign(ASC_API_KEY.replace(/\\n/g, "\n"), "base64url");

  return `${header}.${payload}.${signature}`;
}

async function apiRequest(path, method = "GET", body = null) {
  const token = generateJWT();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

function getAppVersion() {
  try {
    return execSync(
      `node -p "require('./app.config.js').expo.version"`,
      { encoding: "utf8" }
    ).trim();
  } catch {
    console.error("Could not read app version from app.config.js");
    process.exit(1);
  }
}

async function waitForProcessedBuild(appVersion) {
  const maxAttempts = MAX_POLL_MINUTES;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `Polling for processed build (attempt ${attempt}/${maxAttempts})...`
    );

    const data = await apiRequest(
      `/builds?filter[app]=${ASC_APP_ID}&filter[version]=${appVersion}&filter[processingState]=VALID&sort=-uploadedDate&limit=1`
    );

    if (data.data?.length > 0) {
      const build = data.data[0];
      console.log(`Found processed build: ${build.id}`);
      return build;
    }

    if (attempt < maxAttempts) {
      console.log(`Build not ready yet, waiting ${POLL_INTERVAL_MS / 1000}s...`);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  console.error(
    `Build not processed after ${MAX_POLL_MINUTES} minutes, giving up.`
  );
  process.exit(1);
}

async function getOrCreateAppStoreVersion(buildId, appVersion) {
  // Check for existing editable version
  const existing = await apiRequest(
    `/appStoreVersions?filter[app]=${ASC_APP_ID}&filter[versionString]=${appVersion}&filter[appStoreState]=PREPARE_FOR_SUBMISSION`
  );

  let versionId;

  if (existing.data?.length > 0) {
    versionId = existing.data[0].id;
    console.log(`Found existing draft version: ${versionId}`);
  } else {
    console.log(`Creating new App Store version ${appVersion}...`);
    const created = await apiRequest("/appStoreVersions", "POST", {
      data: {
        type: "appStoreVersions",
        attributes: {
          versionString: appVersion,
          platform: "IOS",
        },
        relationships: {
          app: { data: { type: "apps", id: ASC_APP_ID } },
        },
      },
    });
    versionId = created.data.id;
    console.log(`Created version: ${versionId}`);
  }

  // Attach the build to the version
  console.log("Selecting build for version...");
  await apiRequest(`/appStoreVersions/${versionId}/relationships/build`, "PATCH", {
    data: { type: "builds", id: buildId },
  });

  return versionId;
}

async function submitForReview(versionId) {
  console.log("Submitting for App Store review...");
  await apiRequest("/appStoreVersionSubmissions", "POST", {
    data: {
      type: "appStoreVersionSubmissions",
      relationships: {
        appStoreVersion: {
          data: { type: "appStoreVersions", id: versionId },
        },
      },
    },
  });
  console.log("Submitted for review!");
}

async function main() {
  const appVersion = getAppVersion();
  console.log(`App version: ${appVersion}`);

  const build = await waitForProcessedBuild(appVersion);
  const versionId = await getOrCreateAppStoreVersion(build.id, appVersion);
  await submitForReview(versionId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
