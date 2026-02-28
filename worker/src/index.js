const DEFAULT_CONTENT = {
  heroName: "Ariful Islam Koushik",
  heroSubtitle: "Product Operations & Technical Operations Leader",
  heroText: "Building scalable systems, smooth workflows, and reliable operations.",
  heroPrimaryButtonLabel: "Contact Me",
  heroSecondaryButtonLabel: "View Projects",
  heroResumeButtonLabel: "Download Resume",
  aboutTitle: "About Me",
  aboutParagraph1:
    "I’m a Product Operations professional with 7+ years of experience managing large-scale systems, logistics, and technical operations. I enjoy turning complex operational problems into clear and scalable solutions.",
  aboutParagraph2:
    "I’ve launched instant delivery services, led warehouse automation, managed 24/7 technical operations, and worked closely with engineering teams to build practical, reliable systems.",
  skillsTitle: "Skills",
  skillsCard1Title: "Product & Operations",
  skillsCard1Items:
    "Product feature launches\nPRD preparation\nRoadmap execution\nStakeholder management\nAgile & Scrum collaboration",
  skillsCard2Title: "Operations & Logistics",
  skillsCard2Items:
    "Warehouse automation\nLast-mile delivery optimization\nInventory management\nProcess improvement",
  skillsCard3Title: "Tools & Technology",
  skillsCard3Items:
    "Microsoft 365 ecosystem\nPower Automate\nSharePoint\nAzure DevOps\nExcel, Word, PowerPoint",
  skillsCard4Title: "Leadership",
  skillsCard4Items:
    "Team recruitment & mentoring\nStaff training\nCross-functional coordination\nRoot-cause problem solving",
  experienceTitle: "Experience",
  experienceItem1Title: "Assistant Director, Product Operations",
  experienceItem1Meta: "Chaldal PLC · Feb 2024 – Present",
  experienceItem1Bullets:
    "Launched instant delivery with 10–15 minute fulfillment\nLed warehouse automation across 5+ sites\nOptimized last-mile delivery to reduce cost and time\nMentored product managers and built operational frameworks",
  experienceItem2Title: "Manager, Technical Operations & Product Ops",
  experienceItem2Meta: "Chaldal PLC · Jan 2022 – Jan 2024",
  experienceItem2Bullets:
    "Managed 24/7 operations for 3 data centers\nLed server relocation and infrastructure setup\nRecruited and trained technical operations teams",
  experienceItem3Title: "Executive & Associate, Technical Operations",
  experienceItem3Meta: "Chaldal PLC · Jul 2019 – Jan 2022",
  experienceItem3Bullets:
    "Handled critical technical escalations\nImproved internal support workflows\nMentored junior team members",
  projectsTitle: "Projects",
  project1Title: "Information Security Training",
  project1Description:
    "Trained 2,200+ employees using a Train-the-Trainer model with 100% participation.",
  project2Title: "Product Discoverability & Tagging",
  project2Description:
    "Led metadata optimization for 12,000+ SKUs to improve search accuracy and conversion.",
  project3Title: "Engineering Bootcamp",
  project3Description: "Managed end-to-end logistics for a 110-person engineering bootcamp.",
  blogTitle: "Blog Posts by Koushik",
  blog1Title: "Building Reliable 24/7 Ops Teams",
  blog1Description: "A practical playbook for staffing, escalation, and improvement loops in around-the-clock operations.",
  blog1Url: "#",
  blog1Body:
    "Running a 24/7 operations team is less about heroics and more about repeatable systems.\n\nAt Chaldal, we focused on three fundamentals: clear shift ownership, fast incident escalation, and tight feedback loops between operations and engineering.\n\nWhen those three are healthy, teams can handle pressure without burnout and customers still get a reliable experience.",
  blog2Title: "Instant Delivery: What Makes It Work",
  blog2Description: "Coming soon: Koushik is currently writing this post and will publish it soon.",
  blog2Url: "#",
  blog2Body: "",
  blog3Title: "Warehouse Automation Without Chaos",
  blog3Description: "Coming soon: Koushik is currently writing this post and will publish it soon.",
  blog3Url: "#",
  blog3Body: "",
  educationTitle: "Education",
  educationDegree: "Bachelor of Business Administration (BBA)",
  educationInstitutionYears: "National University (2016 – 2020)",
  contactTitle: "Get in Touch",
  phoneNumber: "+8801622486838",
  email: "hello@koushik.bd",
  linkedinUrl: "https://www.linkedin.com/in/ariful-islam-koushik/",
  footerName: "Ariful Islam Koushik"
};
const DEFAULT_UPDATE_COMMIT_MESSAGE = "content: update portfolio data via admin panel";
const DEFAULT_RESET_COMMIT_MESSAGE = "content: reset portfolio data to defaults";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const createJsonResponse = (status, body, corsHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders
    }
  });

const parseCookies = (request) => {
  const cookieHeader = request.headers.get("Cookie") || "";
  return cookieHeader.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

const toBase64Url = (bytes) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const utf8ToBase64 = (value) => {
  const bytes = encoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64ToUtf8 = (value) => {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return decoder.decode(bytes);
};

const importHmacKey = async (secret) =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign", "verify"]
  );

const signSessionToken = async (payload, secret) => {
  const key = await importHmacKey(secret);
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, payloadBytes));
  return `${toBase64Url(payloadBytes)}.${toBase64Url(signature)}`;
};

const verifySessionToken = async (token, secret) => {
  if (!token || !token.includes(".")) return null;
  const [payloadPart, sigPart] = token.split(".");
  if (!payloadPart || !sigPart) return null;

  try {
    const key = await importHmacKey(secret);
    const payloadBytes = fromBase64Url(payloadPart);
    const signatureBytes = fromBase64Url(sigPart);
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, payloadBytes);
    if (!isValid) return null;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    return payload;
  } catch {
    return null;
  }
};

const normalizeContent = (raw = {}) => {
  const out = {};
  Object.keys(DEFAULT_CONTENT).forEach((key) => {
    const value = raw[key];
    out[key] = typeof value === "string" && value.trim() ? value.trim() : DEFAULT_CONTENT[key];
  });
  return out;
};

const sanitizeCommitMessage = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  return normalized.slice(0, 140);
};

const getAllowedOrigins = (env) => {
  const list = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (env.ALLOWED_ORIGIN && !list.includes(env.ALLOWED_ORIGIN)) {
    list.push(env.ALLOWED_ORIGIN);
  }
  return list;
};

const getCorsHeaders = (request, env) => {
  const origin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS"
    };
  }
  return {};
};

const githubRequest = async (env, path, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "portfolio-admin-worker",
      ...(options.headers || {})
    },
    ...options
  });

  const raw = await response.text();
  const payload = (() => {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  if (!response.ok) {
    const detail =
      (payload && (payload.message || payload.error)) ||
      (raw && raw.trim()) ||
      `GitHub request failed (${response.status})`;
    throw new Error(detail);
  }
  return payload || {};
};

const getContentMeta = async (env) =>
  githubRequest(
    env,
    `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${env.CONTENT_PATH}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`,
    { method: "GET" }
  );

const updateContentFile = async (env, content, message) => {
  const meta = await getContentMeta(env);
  const normalized = normalizeContent(content);
  const raw = JSON.stringify(normalized, null, 2);
  const encoded = utf8ToBase64(raw);

  await githubRequest(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${env.CONTENT_PATH}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: encoded,
      sha: meta.sha,
      branch: env.GITHUB_BRANCH
    })
  });

  return normalized;
};

const readJsonBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};

const sessionCookie = (token, maxAgeSeconds) =>
  `session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAgeSeconds}`;

const clearSessionCookie = () => "session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0";

const isAuthorized = async (request, env) => {
  const token = parseCookies(request).session;
  const payload = await verifySessionToken(token, env.SESSION_SECRET);
  if (!payload || !payload.exp || Date.now() > payload.exp) return false;
  return true;
};

const unauthorized = (corsHeaders) => createJsonResponse(401, { error: "Unauthorized" }, corsHeaders);

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (request.method === "GET" && new URL(request.url).pathname === "/health") {
        return createJsonResponse(200, { ok: true }, corsHeaders);
      }

      const path = new URL(request.url).pathname;

      if (path === "/admin/login" && request.method === "POST") {
        const body = await readJsonBody(request);
        const password = typeof body.password === "string" ? body.password : "";
        if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET || !env.GITHUB_TOKEN) {
          return createJsonResponse(500, { error: "Worker is missing required secrets" }, corsHeaders);
        }
        if (password !== env.ADMIN_PASSWORD) {
          return createJsonResponse(401, { error: "Invalid password" }, corsHeaders);
        }

        const ttlSeconds = Number(env.SESSION_TTL_SECONDS || "28800");
        const payload = { exp: Date.now() + ttlSeconds * 1000 };
        const token = await signSessionToken(payload, env.SESSION_SECRET);
        const response = createJsonResponse(200, { ok: true }, corsHeaders);
        response.headers.set("Set-Cookie", sessionCookie(token, ttlSeconds));
        return response;
      }

      if (path === "/admin/session" && request.method === "GET") {
        const authenticated = await isAuthorized(request, env);
        return createJsonResponse(200, { authenticated }, corsHeaders);
      }

      if (path === "/admin/logout" && request.method === "POST") {
        const response = createJsonResponse(200, { ok: true }, corsHeaders);
        response.headers.set("Set-Cookie", clearSessionCookie());
        return response;
      }

      if (path === "/admin/content" && request.method === "GET") {
        if (!(await isAuthorized(request, env))) return unauthorized(corsHeaders);
        const meta = await getContentMeta(env);
        const decoded = base64ToUtf8(meta.content.replace(/\n/g, ""));
        const content = normalizeContent(JSON.parse(decoded));
        return createJsonResponse(200, { content }, corsHeaders);
      }

      if (path === "/admin/content" && request.method === "PUT") {
        if (!(await isAuthorized(request, env))) return unauthorized(corsHeaders);
        const body = await readJsonBody(request);
        const commitMessage = sanitizeCommitMessage(body.commitMessage, DEFAULT_UPDATE_COMMIT_MESSAGE);
        const content = await updateContentFile(env, body.content || {}, commitMessage);
        return createJsonResponse(200, { content }, corsHeaders);
      }

      if (path === "/admin/content/reset" && request.method === "POST") {
        if (!(await isAuthorized(request, env))) return unauthorized(corsHeaders);
        const body = await readJsonBody(request);
        const commitMessage = sanitizeCommitMessage(body.commitMessage, DEFAULT_RESET_COMMIT_MESSAGE);
        const content = await updateContentFile(env, DEFAULT_CONTENT, commitMessage);
        return createJsonResponse(200, { content }, corsHeaders);
      }

      return createJsonResponse(404, { error: "Not found" }, corsHeaders);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected server error";
      return createJsonResponse(500, { error: message }, corsHeaders);
    }
  }
};
