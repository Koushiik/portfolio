var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var DEFAULT_CONTENT = {
  heroName: "Ariful Islam Koushik",
  heroSubtitle: "Product Operations & Technical Operations Leader",
  heroText: "Building scalable systems, smooth workflows, and reliable operations.",
  aboutParagraph1: "I\u2019m a Product Operations professional with 6+ years of experience managing large-scale systems, logistics, and technical operations. I enjoy turning complex operational problems into clear and scalable solutions.",
  aboutParagraph2: "I\u2019ve launched instant delivery services, led warehouse automation, managed 24/7 technical operations, and worked closely with engineering teams to build practical, reliable systems.",
  phoneNumber: "+8801622486838",
  email: "hello@koushik.bd",
  linkedinUrl: "https://www.linkedin.com/in/ariful-islam-koushik/"
};
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var createJsonResponse = /* @__PURE__ */ __name((status, body, corsHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...corsHeaders
  }
}), "createJsonResponse");
var parseCookies = /* @__PURE__ */ __name((request) => {
  const cookieHeader = request.headers.get("Cookie") || "";
  return cookieHeader.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}, "parseCookies");
var toBase64Url = /* @__PURE__ */ __name((bytes) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}, "toBase64Url");
var fromBase64Url = /* @__PURE__ */ __name((value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - normalized.length % 4);
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}, "fromBase64Url");
var utf8ToBase64 = /* @__PURE__ */ __name((value) => {
  const bytes = encoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}, "utf8ToBase64");
var base64ToUtf8 = /* @__PURE__ */ __name((value) => {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return decoder.decode(bytes);
}, "base64ToUtf8");
var importHmacKey = /* @__PURE__ */ __name(async (secret) => crypto.subtle.importKey(
  "raw",
  encoder.encode(secret),
  {
    name: "HMAC",
    hash: "SHA-256"
  },
  false,
  ["sign", "verify"]
), "importHmacKey");
var signSessionToken = /* @__PURE__ */ __name(async (payload, secret) => {
  const key = await importHmacKey(secret);
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, payloadBytes));
  return `${toBase64Url(payloadBytes)}.${toBase64Url(signature)}`;
}, "signSessionToken");
var verifySessionToken = /* @__PURE__ */ __name(async (token, secret) => {
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
}, "verifySessionToken");
var normalizeContent = /* @__PURE__ */ __name((raw = {}) => {
  const out = {};
  Object.keys(DEFAULT_CONTENT).forEach((key) => {
    const value = raw[key];
    out[key] = typeof value === "string" && value.trim() ? value.trim() : DEFAULT_CONTENT[key];
  });
  return out;
}, "normalizeContent");
var getAllowedOrigins = /* @__PURE__ */ __name((env) => {
  const list = String(env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (env.ALLOWED_ORIGIN && !list.includes(env.ALLOWED_ORIGIN)) {
    list.push(env.ALLOWED_ORIGIN);
  }
  return list;
}, "getAllowedOrigins");
var getCorsHeaders = /* @__PURE__ */ __name((request, env) => {
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
}, "getCorsHeaders");
var githubRequest = /* @__PURE__ */ __name(async (env, path, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "portfolio-admin-worker",
      ...options.headers || {}
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
    const detail = payload && (payload.message || payload.error) || raw && raw.trim() || `GitHub request failed (${response.status})`;
    throw new Error(detail);
  }
  return payload || {};
}, "githubRequest");
var getContentMeta = /* @__PURE__ */ __name(async (env) => githubRequest(
  env,
  `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${env.CONTENT_PATH}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`,
  { method: "GET" }
), "getContentMeta");
var updateContentFile = /* @__PURE__ */ __name(async (env, content, message) => {
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
}, "updateContentFile");
var readJsonBody = /* @__PURE__ */ __name(async (request) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
}, "readJsonBody");
var sessionCookie = /* @__PURE__ */ __name((token, maxAgeSeconds) => `session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAgeSeconds}`, "sessionCookie");
var clearSessionCookie = /* @__PURE__ */ __name(() => "session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0", "clearSessionCookie");
var isAuthorized = /* @__PURE__ */ __name(async (request, env) => {
  const token = parseCookies(request).session;
  const payload = await verifySessionToken(token, env.SESSION_SECRET);
  if (!payload || !payload.exp || Date.now() > payload.exp) return false;
  return true;
}, "isAuthorized");
var unauthorized = /* @__PURE__ */ __name((corsHeaders) => createJsonResponse(401, { error: "Unauthorized" }, corsHeaders), "unauthorized");
var src_default = {
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
        const payload = { exp: Date.now() + ttlSeconds * 1e3 };
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
        if (!await isAuthorized(request, env)) return unauthorized(corsHeaders);
        const meta = await getContentMeta(env);
        const decoded = base64ToUtf8(meta.content.replace(/\n/g, ""));
        const content = normalizeContent(JSON.parse(decoded));
        return createJsonResponse(200, { content }, corsHeaders);
      }
      if (path === "/admin/content" && request.method === "PUT") {
        if (!await isAuthorized(request, env)) return unauthorized(corsHeaders);
        const body = await readJsonBody(request);
        const content = await updateContentFile(env, body.content || {}, "content: update portfolio data via admin panel");
        return createJsonResponse(200, { content }, corsHeaders);
      }
      if (path === "/admin/content/reset" && request.method === "POST") {
        if (!await isAuthorized(request, env)) return unauthorized(corsHeaders);
        const content = await updateContentFile(env, DEFAULT_CONTENT, "content: reset portfolio data to defaults");
        return createJsonResponse(200, { content }, corsHeaders);
      }
      return createJsonResponse(404, { error: "Not found" }, corsHeaders);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected server error";
      return createJsonResponse(500, { error: message }, corsHeaders);
    }
  }
};

// ../../../.nvm/versions/node/v20.20.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.nvm/versions/node/v20.20.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-e4UT3L/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../.nvm/versions/node/v20.20.0/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-e4UT3L/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
