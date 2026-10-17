// Pages advanced-mode worker. Static files still come from env.ASSETS.
// Set XAI_API_KEY on the Cloudflare project to let the door guy phrase
// neighborhood questions. Optional XAI_MODEL overrides the cheap default.
// With no key, /api/door-guy tells the page to use the local book.

var DEFAULT_MODEL = "grok-4.20-0309-non-reasoning";
var hits = new Map();

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function apiKey(env) {
  var key = env && env.XAI_API_KEY;
  return typeof key === "string" ? key.trim() : "";
}

function modelName(env) {
  var requested = env && env.XAI_MODEL;
  if (typeof requested === "string" && /^grok-[a-z0-9.-]{1,80}$/i.test(requested.trim())) {
    return requested.trim();
  }
  return DEFAULT_MODEL;
}

function sameSite(request) {
  var origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch (err) {
    return false;
  }
}

function allowed(ip, now) {
  var windowMs = 10 * 60 * 1000;
  var row = hits.get(ip);
  if (!row || now - row.start > windowMs) {
    if (hits.size > 1000) hits.clear();
    hits.set(ip, { start: now, n: 1 });
    return true;
  }
  row.n += 1;
  return row.n <= 12;
}

function compile(list) {
  return (list || []).map(function (source) {
    return new RegExp(source, "i");
  });
}

function hit(regexes, q) {
  for (var i = 0; i < regexes.length; i++) {
    if (regexes[i].test(q)) return true;
  }
  return false;
}

function skipModel(q, facts) {
  var match = facts.match || {};
  var emergency = compile(match.emergency);
  var mailbox = compile(match.mailbox);
  var packages = compile(match.package);
  var maintenance = compile(match.maintenance);
  var portal = compile(match.portal);
  var rent = compile(match.rent);
  var orientation = compile(match.orientation);
  var night = compile(match.night);
  var resident = compile(match.resident);
  var prospect = compile(match.prospect);
  if (hit(emergency, q) || hit(mailbox, q) || hit(packages, q) || hit(maintenance, q) || hit(portal, q)) return true;
  var goingOut = hit(night, q);
  if (hit(rent, q) && !goingOut) return true;
  if (hit(orientation, q) && !goingOut) return true;
  if ((hit(resident, q) || hit(prospect, q)) && !goingOut) return true;
  return false;
}

var bookCache = null;

async function loadBook(request, env) {
  if (bookCache) return bookCache;
  var res = await env.ASSETS.fetch(new URL("/door-facts.json", request.url));
  if (!res.ok) throw new Error("book");
  bookCache = await res.json();
  return bookCache;
}

function oaklandNow() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function cleanReply(value) {
  var text = String(value || "").replace(/\*\*/g, "").replace(/<[^>]*>/g, "").trim();
  if (!text || text.length > 900) return "";
  if (/as an ai|language model|i am grok|i'm grok/i.test(text)) return "";
  return text;
}

function historyOf(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-4).filter(function (item) {
    return item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string";
  }).map(function (item) {
    return { role: item.role, content: item.content.slice(0, 400) };
  });
}

async function doorGuy(request, env) {
  if (!sameSite(request)) return json({ via: "book" });
  if (request.method === "GET") return json({ via: "book", live: Boolean(apiKey(env)) });
  if (request.method !== "POST") return json({ via: "book" }, 405);

  var raw = await request.text();
  if (raw.length > 8000) return json({ via: "book" });
  var body;
  try {
    body = JSON.parse(raw);
  } catch (err) {
    return json({ via: "book" });
  }
  var message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 400) return json({ via: "book" });

  var facts;
  try {
    facts = await loadBook(request, env);
  } catch (err) {
    return json({ via: "book" });
  }
  if (skipModel(message.toLowerCase(), facts)) return json({ via: "book" });

  var key = apiKey(env);
  if (!key) return json({ via: "book", live: false });

  var ip = request.headers.get("cf-connecting-ip") || "anon";
  if (!allowed(ip, Date.now())) return json({ via: "book" });

  var system = facts.rules.join(" ") + " Oakland time now: " + oaklandNow() + ". Book: " + facts.prompt.join(" ");
  var payload = {
    model: modelName(env),
    temperature: 0.3,
    max_tokens: 220,
    messages: [{ role: "system", content: system }].concat(historyOf(body.history), [{ role: "user", content: message }]),
  };

  try {
    var upstream = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: "Bearer " + key,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined,
    });
    if (!upstream.ok) return json({ via: "book" });
    var data = await upstream.json();
    var reply = cleanReply(data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
    if (!reply) return json({ via: "book" });
    return json({ via: "live", reply: reply });
  } catch (err) {
    return json({ via: "book" });
  }
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    if (url.pathname === "/login" || url.pathname === "/login/") {
      return Response.redirect(new URL("/", url), 301);
    }
    if (url.pathname === "/api/door-guy") {
      try {
        return await doorGuy(request, env);
      } catch (err) {
        return json({ via: "book" });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
