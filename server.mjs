var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/database.ts
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
function createDatabase(env = process.env) {
  for (const key of ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]) {
    if (!env[key]) throw new Error(`Missing server configuration: ${key}`);
  }
  return mysql.createPool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectionLimit: 5,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true,
    multipleStatements: false,
    connectTimeout: 1e4,
    ...env.DB_SSL_CA_FILE ? { ssl: { ca: readFileSync(env.DB_SSL_CA_FILE, "utf8"), rejectUnauthorized: true } } : {}
  });
}
var init_database = __esm({
  "server/database.ts"() {
  }
});

// server/inquiry-store.ts
var inquiry_store_exports = {};
__export(inquiry_store_exports, {
  closeInquiryDatabase: () => closeInquiryDatabase,
  saveMysqlInquiry: () => saveMysqlInquiry
});
async function closeInquiryDatabase() {
  await db?.end();
  db = void 0;
}
async function saveMysqlInquiry(table, record2) {
  if (!["consultation_requests", "contact_messages"].includes(table)) throw new Error("Invalid inquiry table");
  db ||= createDatabase();
  const columns = Object.keys(record2);
  if (columns.some((c) => !/^[a-z_]+$/.test(c))) throw new Error("Invalid column");
  try {
    await db.execute("INSERT INTO `" + table + "` (" + columns.map((c) => "`" + c + "`").join(",") + ") VALUES (" + columns.map(() => "?").join(",") + ")", Object.values(record2));
  } catch (error) {
    if (error.code !== "ER_DUP_ENTRY") throw error;
    const [rows] = await db.execute("SELECT id FROM `" + table + "` WHERE id=?", [record2.id]);
    if (!rows.length) throw error;
  }
}
var db;
var init_inquiry_store = __esm({
  "server/inquiry-store.ts"() {
    init_database();
  }
});

// server/index.ts
init_database();
import "dotenv/config";

// server/app.ts
import express from "express";
import path2 from "node:path";
import { existsSync } from "node:fs";

// server/auth.ts
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
function hashPassword(password) {
  if (password.length < 14 || password.length > 256) throw new Error("Use a password between 14 and 256 characters.");
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password, encoded) {
  const [scheme, salt, hash] = encoded.split(":");
  if (scheme !== "scrypt" || !/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{128}$/.test(hash || "")) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
}
var tokenHash = (token) => createHash("sha256").update(token).digest("hex");
var newToken = () => randomBytes(32).toString("hex");
function cookieToken(cookie = "") {
  return cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith("lp_session="))?.slice(11) || "";
}

// server/content.ts
var fields = {
  pages: "slug title is_published meta_title meta_description sections order_index",
  attorneys: "slug full_name professional_title portrait_url primary_specialization biography email direct_phone linkedin_url is_partner is_featured is_published order_index practice_area_ids education bar_admissions professional_experience memberships awards selected_publications home_card_image_url home_modal_image_url partner_page_image_url",
  practice_areas: "slug title icon_name short_description full_description key_capabilities key_stat is_published order_index",
  articles: "slug title excerpt content reading_time category published_at author status featured_image practice_area_id",
  news: "slug title excerpt content date category status featured_image practice_area_id",
  site_settings: "settings",
  navigation: "label path is_visible order_index children",
  faqs: "category_id question answer order_index is_published",
  faq_categories: "name slug description order_index",
  consultation_requests: "reference_number full_name email_address contact_number company_name preferred_consultation_type practice_area_id preferred_date preferred_time brief_concern privacy_consent status internal_notes",
  contact_messages: "full_name email phone subject message status notes"
};
var json = new Set("sections settings children author key_capabilities practice_area_ids education bar_admissions professional_experience memberships awards selected_publications".split(" "));
function invalid(message = "Invalid content.") {
  return Object.assign(new Error(message), { status: 400 });
}
function record(table, value) {
  if (!Object.hasOwn(fields, table)) throw invalid("This table cannot be edited.");
  if (!value || Array.isArray(value) || typeof value !== "object" || typeof value.id !== "string" || !value.id.length || value.id.length > 191) throw invalid();
  const allowed = new Set(("id created_at updated_at " + fields[table]).split(" "));
  return Object.entries(value).map(([key, v]) => {
    if (!allowed.has(key)) throw invalid("Unknown field.");
    if (json.has(key)) return [key, JSON.stringify(v)];
    if (key.endsWith("_at") && v !== null) {
      if (typeof v !== "string" || !Number.isFinite(Date.parse(v))) throw invalid("Invalid date.");
      return [key, new Date(v).toISOString().slice(0, 23).replace("T", " ")];
    }
    if (v !== null && !["string", "number", "boolean"].includes(typeof v)) throw invalid();
    if ((key.startsWith("is_") || key === "privacy_consent") && typeof v !== "boolean") throw invalid("Invalid visibility.");
    return [key, v];
  });
}
async function writeContent(db3, table, body) {
  const { operation, rows, id } = body || {};
  if (!Object.hasOwn(fields, table)) throw invalid("This table cannot be edited.");
  if (operation === "delete") {
    if (typeof id !== "string" || !id.length || id.length > 191) throw invalid();
    const [result] = await db3.execute("DELETE FROM `" + table + "` WHERE id=?", [id]);
    return result.affectedRows ? [{ id }] : [];
  }
  if (!["upsert", "insert", "replace"].includes(operation) || operation === "replace" && table !== "navigation") throw invalid();
  if (!Array.isArray(rows) || rows.length > 200 || !rows.length && operation !== "replace") throw invalid();
  const prepared = rows.map((r) => record(table, r));
  if (new Set(rows.map((r) => r.id)).size !== rows.length) throw invalid("Duplicate record ID.");
  const connection = await db3.getConnection();
  try {
    await connection.beginTransaction();
    if (operation === "replace") await connection.query("DELETE FROM navigation");
    for (const entries of prepared) {
      const id2 = entries.find(([k]) => k === "id")[1];
      const [existing] = await connection.execute("SELECT id FROM `" + table + "` WHERE id=? FOR UPDATE", [id2]);
      if (operation === "upsert" && existing.length) {
        const changes = entries.filter(([k]) => k !== "id" && k !== "created_at");
        if (changes.length) await connection.execute("UPDATE `" + table + "` SET " + changes.map(([k]) => "`" + k + "`=?").join(",") + " WHERE id=?", [...changes.map(([, v]) => v), id2]);
      } else {
        await connection.execute("INSERT INTO `" + table + "` (" + entries.map(([k]) => "`" + k + "`").join(",") + ") VALUES (" + entries.map(() => "?").join(",") + ")", entries.map(([, v]) => v));
      }
    }
    await connection.commit();
    return rows.map((r) => ({ id: r.id }));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
function publicSettings(settings) {
  const groups = { general: "firmName tagline headline subheadline logoUrl secondaryLogoUrl faviconUrl establishedYear", contact: "address suiteFloor cityStateZip country telephone emergencyLine fax email consultationEmail officeHoursWeekday officeHoursWeekend googleMapEmbedUrl", social: "linkedin facebook twitter barDirectory", branding: "primaryAccent secondaryAccent backgroundColor cardBackgroundColor headingFont bodyFont", seo: "defaultTitle defaultDescription socialPreviewImage indexSite", seoDefaults: "metaTitle metaDescription" };
  const result = {};
  for (const [group, keys] of Object.entries(groups)) if (settings?.[group]) result[group] = Object.fromEntries(keys.split(" ").filter((k) => ["string", "number", "boolean"].includes(typeof settings[group][k])).map((k) => [k, settings[group][k]]));
  for (const key of ["firmName", "firmTagline", "foundedYear", "jurisdiction"]) if (["string", "number"].includes(typeof settings?.[key])) result[key] = settings[key];
  return result;
}

// server/public-content.ts
var publicTables = {
  pages: "is_published = 1",
  attorneys: "is_published = 1",
  practice_areas: "is_published = 1",
  articles: "status = 'published'",
  news: "status = 'published'",
  faqs: "is_published = 1",
  faq_categories: "1=1",
  navigation: "is_visible = 1",
  site_settings: "id = 'firm_settings'"
};
var jsonColumns = new Set("sections settings children author snapshot key_capabilities practice_area_ids education bar_admissions professional_experience memberships awards selected_publications".split(" "));
function normalize(rows) {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key,
    jsonColumns.has(key) && typeof value === "string" ? JSON.parse(value) : key.startsWith("is_") || key === "privacy_consent" ? Boolean(value) : value
  ])));
}
function sanitizePublicRows(table, rows) {
  return normalize(rows).map((row) => table === "site_settings" ? { id: row.id, settings: publicSettings(row.settings) } : row);
}

// server/media.ts
import path from "node:path";
import { mkdir, open, realpath, unlink } from "node:fs/promises";
import { randomUUID, createHash as createHash2 } from "node:crypto";
var mediaError = (status, message) => Object.assign(new Error(message), { status, expose: true });
function inside(root, file) {
  const relative = path.relative(root, file);
  return relative !== "" && !relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative);
}
async function mediaRoot(directory) {
  if (!directory || !path.isAbsolute(directory)) throw mediaError(503, "Persistent media storage is not configured.");
  if (directory.split(/[\\/]/).some((part) => ["hbuilds", "public_html", "dist"].includes(part))) throw new Error("MEDIA_ROOT must be outside deployment-managed folders.");
  await mkdir(directory, { recursive: true });
  const root = await realpath(directory), app2 = await realpath(process.cwd());
  if (root === app2 || inside(app2, root)) throw new Error("MEDIA_ROOT must be outside the application directory.");
  return root;
}
async function verifyMediaWritable(root) {
  const probe = path.join(root, ".write-test-" + randomUUID());
  let handle;
  try {
    handle = await open(probe, "wx", 384);
    await handle.writeFile("ok");
    await handle.sync();
  } catch (error) {
    throw new Error("MEDIA_ROOT is not writable by the Node.js process.", { cause: error });
  } finally {
    await handle?.close().catch(() => {
    });
    await unlink(probe).catch(() => {
    });
  }
}
async function mediaFile(root, relative) {
  if (!relative || relative.includes("\\") || relative.split("/").some((part) => !part || part === "." || part === "..") || path.isAbsolute(relative)) throw mediaError(400, "Invalid media path.");
  const file = await realpath(path.join(root, relative));
  if (!inside(root, file)) throw mediaError(400, "Invalid media path.");
  return file;
}
function fileKind(header) {
  if (header.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) return { ext: "png", mime: "image/png", type: "image" };
  if (header[0] === 255 && header[1] === 216 && header[2] === 255) return { ext: "jpg", mime: "image/jpeg", type: "image" };
  if (["GIF87a", "GIF89a"].includes(header.toString("ascii", 0, 6))) return { ext: "gif", mime: "image/gif", type: "image" };
  if (header.toString("ascii", 0, 4) === "RIFF" && header.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", mime: "image/webp", type: "image" };
  if (header.toString("ascii", 0, 5) === "%PDF-") return { ext: "pdf", mime: "application/pdf", type: "document" };
  if (header.toString("ascii", 4, 8) === "ftyp" && /^(isom|iso[2-9]|mp4[12]|avc1|M4V |dash)$/.test(header.toString("ascii", 8, 12))) return { ext: "mp4", mime: "video/mp4", type: "video" };
  if (header.subarray(0, 4).equals(Buffer.from("1a45dfa3", "hex")) && header.includes(Buffer.from("webm"))) return { ext: "webm", mime: "video/webm", type: "video" };
  throw mediaError(415, "Use JPG, PNG, WEBP, GIF, PDF, MP4 or WEBM. SVG uploads are not supported.");
}
var categories = /* @__PURE__ */ new Set(["portrait", "architectural", "branding", "general", "attorneys", "offices", "insights", "video"]);
function text(value, max, fallback = "") {
  if (value === void 0) return fallback;
  if (typeof value !== "string" || value.length > max) throw mediaError(400, "Invalid media details.");
  return value.trim();
}
async function uploadMedia(db3, directory, req, res) {
  if (req.get("content-type")?.split(";")[0] !== "application/octet-stream") throw mediaError(415, "Expected a binary file upload.");
  const name = text(req.query.name, 200, "Uploaded file") || "Uploaded file";
  const alt = text(req.query.alt, 500, name), category = text(req.query.category, 30, "general");
  if (!categories.has(category)) throw mediaError(400, "Invalid media category.");
  const limit = 100 * 1024 * 1024;
  if (Number(req.get("content-length")) > limit) throw mediaError(413, "File is too large.");
  const root = await mediaRoot(directory), id = "med-" + randomUUID(), storagePath = id + ".asset", file = path.join(root, storagePath);
  const handle = await open(file, "wx", 384);
  let committed = false, size = 0, header = Buffer.alloc(0);
  try {
    for await (const chunk of req) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > limit) throw mediaError(413, "File is too large.");
      if (header.length < 512) header = Buffer.concat([header, bytes.subarray(0, 512 - header.length)]);
      await handle.writeFile(bytes);
    }
    if (!size) throw mediaError(400, "The file is empty.");
    const kind = fileKind(header);
    if (kind.type !== "video" && size > 25 * 1024 * 1024) throw mediaError(413, "Images and documents must be at most 25 MB.");
    await handle.sync();
    await handle.close();
    const now = (/* @__PURE__ */ new Date()).toISOString(), url = "/media/" + id;
    await db3.execute(
      "INSERT INTO media (id,name,filename,original_name,storage_path,url,file_type,format,size_bytes,size,category,alt_text,uploaded_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))",
      [id, name, id + "." + kind.ext, text(req.query.filename, 255, id + "." + kind.ext), storagePath, url, kind.type, kind.ext.toUpperCase(), size, Math.ceil(size / 1024) + " KB", category, alt, req.admin.id]
    );
    committed = true;
    res.status(201).json({ url, storagePath, mediaItem: { id, name, url, fileType: kind.type, format: kind.ext.toUpperCase(), sizeBytes: size, size: Math.ceil(size / 1024) + " KB", category, altText: alt, createdAt: now, uploadedAt: now } });
  } finally {
    await handle.close().catch(() => {
    });
    if (!committed) await unlink(file).catch(() => {
    });
  }
}
async function serveMedia(db3, directory, req, res) {
  const [rows] = await db3.execute("SELECT storage_path,format FROM media WHERE id=?", [req.params.id]);
  if (!rows[0]?.storage_path) throw mediaError(404, "Media not found.");
  const root = await mediaRoot(directory);
  let file;
  try {
    file = await mediaFile(root, rows[0].storage_path);
  } catch (error) {
    if (error.code === "ENOENT") throw mediaError(404, "Media not found.");
    throw error;
  }
  const handle = await open(file, "r");
  const header = Buffer.alloc(512);
  let kind;
  try {
    const read = await handle.read(header, 0, 512, 0);
    kind = fileKind(header.subarray(0, read.bytesRead));
  } catch {
    throw mediaError(415, "Unsupported stored media.");
  } finally {
    await handle.close();
  }
  res.setHeader("Content-Type", kind.mime);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  if (kind.type === "document") res.setHeader("Content-Disposition", 'attachment; filename="document.pdf"');
  res.sendFile(file, { dotfiles: "deny" });
}
async function updateMedia(db3, req, res) {
  const name = text(req.body?.name, 200), alt = text(req.body?.altText, 500, name), category = text(req.body?.category, 30, "general");
  if (!name || !categories.has(category)) throw mediaError(400, "Invalid media details.");
  const [result] = await db3.execute("UPDATE media SET name=?,alt_text=?,category=?,updated_at=UTC_TIMESTAMP(6) WHERE id=?", [name, alt, category, req.params.id]);
  if (!result.affectedRows) throw mediaError(404, "Media not found.");
  res.json({ ok: true });
}
async function deleteMedia(db3, directory, req, res) {
  const root = await mediaRoot(directory);
  const [rows] = await db3.execute("SELECT storage_path FROM media WHERE id=?", [req.params.id]);
  if (!rows[0]) return res.json({ ok: true });
  const relative = rows[0].storage_path;
  await db3.execute("DELETE FROM media WHERE id=?", [req.params.id]);
  if (relative === req.params.id + ".asset" && /^med-[a-f0-9-]{36}\.asset$/.test(relative)) {
    try {
      await unlink(await mediaFile(root, relative));
    } catch (error) {
      if (error.code !== "ENOENT") console.error("Media file cleanup requires attention.");
    }
  }
  res.json({ ok: true });
}

// api/inquiry.ts
import nodemailer from "nodemailer";
import { createHash as createHash3 } from "node:crypto";
var attempts = /* @__PURE__ */ new Map();
var unavailable = "Your inquiry could not be sent. Please try again or contact lalusispartners@gmail.com directly.";
async function handler(req, res) {
  const reply = (status, body2) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body2));
  };
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(405, { error: "Use POST to submit an inquiry." });
  }
  if (!req.headers["content-type"]?.includes("application/json")) return reply(415, { error: "Expected JSON." });
  if (req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host) return reply(403, { error: "Invalid request origin." });
    } catch {
      return reply(403, { error: "Invalid request origin." });
    }
  }
  let body;
  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw) > 24e3) return reply(413, { error: "Please shorten your inquiry." });
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return reply(400, { error: "Invalid submission." });
  }
  const text2 = (key2, max, required = false) => {
    if (body[key2] !== void 0 && typeof body[key2] !== "string") throw new Error(`Invalid ${key2}.`);
    const value = (body[key2] || "").trim();
    if (required && !value || value.length > max) throw new Error(`Please check ${key2}.`);
    return value;
  };
  let data;
  let requestId;
  try {
    requestId = text2("requestId", 36, true);
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) throw new Error("Invalid submission identifier.");
    if (!["consultation", "contact"].includes(body.kind)) throw new Error("Invalid inquiry type.");
    data = {
      kind: body.kind,
      fullName: text2("fullName", 160, true),
      email: text2("email", 254, true),
      phone: text2("phone", 60),
      company: text2("company", 200),
      practiceArea: text2("practiceArea", 200),
      urgency: text2("urgency", 60),
      preferredDate: text2("preferredDate", 10),
      preferredTime: text2("preferredTime", 100),
      subject: text2("subject", 200),
      message: text2("message", 1e4, true),
      consent: body.consent === true
    };
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) throw new Error("Please enter a valid email address.");
    if (data.kind === "consultation" && !data.consent) throw new Error("Please acknowledge the consultation notice.");
    if (data.preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.preferredDate)) throw new Error("Invalid preferred date.");
  } catch (error) {
    return reply(400, { error: error.message });
  }
  const customSmtp = Boolean(process.env.SMTP_HOST);
  const smtpUser = (customSmtp ? process.env.SMTP_USER : process.env.GMAIL_SMTP_USER)?.trim();
  const smtpPassword = customSmtp ? process.env.SMTP_PASSWORD : process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s/g, "");
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const useMysql = process.env.INQUIRY_DATABASE === "mysql";
  const to = process.env.INQUIRY_EMAIL_TO || "lalusispartners@gmail.com";
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!smtpUser || !smtpPassword || ![465, 587].includes(smtpPort) || !useMysql && (!supabaseUrl || !supabaseKey)) {
    console.error("Inquiry endpoint configuration is incomplete.");
    return reply(503, { error: unavailable });
  }
  const now = Date.now();
  for (const [key2, value] of attempts) if (value.expires < now) attempts.delete(key2);
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0];
  const key = createHash3("sha256").update(ip).digest("hex");
  const attempt = attempts.get(key) || { count: 0, expires: now + 6e4 };
  if (attempt.count >= 5 || attempts.size >= 1e4) return reply(429, { error: "Please wait a minute before submitting again." });
  attempt.count++;
  attempts.set(key, attempt);
  const hash = createHash3("sha256").update(requestId + JSON.stringify(data)).digest("hex");
  const id = `inquiry-${hash}`;
  const referenceNumber = `LP-${hash.slice(0, 12).toUpperCase()}`;
  const details = [
    `Reference: ${referenceNumber}`,
    `Form: ${data.kind}`,
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "Not supplied"}`,
    `Company: ${data.company || "Not supplied"}`,
    `Practice area: ${data.practiceArea || "Not specified"}`,
    `Urgency: ${data.urgency || "Standard"}`,
    `Preferred date: ${data.preferredDate || "Not specified"}`,
    `Preferred time: ${data.preferredTime || "Not specified"}`,
    `Subject: ${data.subject || "Legal inquiry"}`,
    `Consent acknowledged: ${data.consent ? "Yes" : "No"}`,
    "",
    "Message:",
    data.message
  ].join("\n");
  const consultation = data.kind === "consultation";
  const record2 = consultation ? {
    id,
    reference_number: referenceNumber,
    full_name: data.fullName,
    email_address: data.email,
    contact_number: data.phone,
    company_name: data.company,
    preferred_consultation_type: "online",
    preferred_date: data.preferredDate || null,
    preferred_time: data.preferredTime,
    brief_concern: `Practice area: ${data.practiceArea}
Urgency: ${data.urgency}

${data.message}`,
    privacy_consent: data.consent,
    status: "new"
  } : {
    id,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    subject: data.subject || "Chambers legal inquiry",
    message: details,
    status: "unread"
  };
  try {
    if (useMysql) {
      const { saveMysqlInquiry: saveMysqlInquiry2 } = await Promise.resolve().then(() => (init_inquiry_store(), inquiry_store_exports));
      await saveMysqlInquiry2(consultation ? "consultation_requests" : "contact_messages", record2);
    } else {
      const saved = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${consultation ? "consultation_requests" : "contact_messages"}`, {
        method: "POST",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(record2),
        signal: AbortSignal.timeout(1e4)
      });
      if (!saved.ok) {
        const result = await saved.json().catch(() => ({}));
        if (saved.status !== 409 || result.code !== "23505") {
          console.error("Inquiry database insert failed:", saved.status, result.code);
          return reply(502, { error: unavailable });
        }
      }
    }
    const transport = nodemailer.createTransport({
      host: customSmtp ? process.env.SMTP_HOST : "smtp.gmail.com",
      port: customSmtp ? smtpPort : 465,
      secure: customSmtp ? smtpPort === 465 : true,
      requireTLS: customSmtp && smtpPort === 587,
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: 5e3,
      greetingTimeout: 5e3,
      socketTimeout: 1e4,
      disableFileAccess: true,
      disableUrlAccess: true
    });
    try {
      const receipt = await transport.sendMail({
        from: { name: "Lalusis & Partners Website", address: smtpUser },
        to,
        replyTo: data.email,
        messageId: "<" + id + "@" + smtpUser.split("@")[1] + ">",
        subject: (consultation ? "Consultation request" : "Chambers contact") + " - " + referenceNumber,
        text: details
      });
      if (!receipt.accepted?.length || receipt.rejected?.length) throw new Error("Recipient not accepted");
    } catch {
      console.error("SMTP notification failed.");
      return reply(502, { error: "Your inquiry was recorded, but the email notification failed. Please retry or contact the firm directly." });
    } finally {
      transport.close();
    }
    return reply(200, { id, referenceNumber });
  } catch {
    console.error("Inquiry submission encountered a network error.");
    return reply(502, { error: unavailable });
  }
}

// server/app.ts
var adminTables = /* @__PURE__ */ new Set([...Object.keys(publicTables), "media", "consultation_requests", "contact_messages", "activity_logs", "page_versions"]);
function createApp(db3, options) {
  const origin = new URL(options.origin).origin;
  const secure = options.secureCookies !== false;
  if (secure && !origin.startsWith("https://")) throw new Error("Production SITE_URL must use HTTPS.");
  const app2 = express();
  app2.disable("x-powered-by");
  const buckets = /* @__PURE__ */ new Map();
  function throttle(key, max, ms) {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.expires <= now) buckets.delete(k);
    const entry = buckets.get(key) || { count: 0, expires: now + ms };
    if (buckets.size >= 1e4 || ++entry.count > max) return false;
    buckets.set(key, entry);
    return true;
  }
  const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  app2.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app2.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app2.use("/api", (req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && req.headers.origin !== origin) return res.status(403).json({ error: "Invalid request origin." });
    next();
  });
  app2.use("/api/admin", (req, res, next) => req.method === "GET" ? next() : requireAdmin(req, res, () => express.json({ limit: "1mb" })(req, res, next)));
  app2.use("/api", express.json({ limit: "24kb" }));
  app2.get("/api/health", asyncRoute(async (_req, res) => {
    await db3.execute("SELECT 1");
    res.json({ ok: true });
  }));
  const dummy = hashPassword(newToken());
  app2.post("/api/auth/login", asyncRoute(async (req, res) => {
    if (!throttle("login:" + req.socket.remoteAddress, 10, 15 * 60 * 1e3)) return res.status(429).json({ error: "Please try again later." });
    const { email, password } = req.body || {};
    if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || password.length > 256) return res.status(400).json({ error: "Invalid credentials." });
    const [rows] = await db3.execute("SELECT * FROM app_admins WHERE email=? AND active=1", [email.trim().toLowerCase()]);
    const valid = verifyPassword(password, rows[0]?.password_hash || dummy);
    if (!valid || !rows[0]) return res.status(401).json({ error: "Invalid credentials." });
    const token = newToken();
    await db3.execute("DELETE FROM app_sessions WHERE expires_at <= UTC_TIMESTAMP(6)");
    await db3.execute("INSERT INTO app_sessions (token_hash,admin_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 8 HOUR))", [tokenHash(token), rows[0].id]);
    res.cookie("lp_session", token, { httpOnly: true, secure, sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 * 1e3 });
    res.json({ user: { id: rows[0].id, email: rows[0].email, role: "ADMINISTRATOR" } });
  }));
  const requireAdmin = asyncRoute(async (req, res, next) => {
    const token = cookieToken(req.headers.cookie);
    if (!/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ error: "Sign in required." });
    const [rows] = await db3.execute("SELECT a.id,a.email FROM app_sessions s JOIN app_admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(6) AND a.active=1", [tokenHash(token)]);
    if (!rows[0]) return res.status(401).json({ error: "Sign in required." });
    req.admin = rows[0];
    next();
  });
  app2.get("/api/auth/me", requireAdmin, (req, res) => res.json({ user: { ...req.admin, role: "ADMINISTRATOR" } }));
  app2.post("/api/auth/logout", asyncRoute(async (req, res) => {
    await db3.execute("DELETE FROM app_sessions WHERE token_hash=?", [tokenHash(cookieToken(req.headers.cookie))]);
    res.clearCookie("lp_session", { httpOnly: true, secure, sameSite: "strict", path: "/" });
    res.json({ ok: true });
  }));
  app2.get("/api/content/:table", asyncRoute(async (req, res) => {
    const filter = Object.prototype.hasOwnProperty.call(publicTables, req.params.table) ? publicTables[req.params.table] : null;
    if (!filter) return res.status(404).json({ error: "Not found." });
    const [rows] = await db3.query("SELECT * FROM `" + req.params.table + "` WHERE " + filter + " LIMIT 1000");
    res.json({ data: sanitizePublicRows(req.params.table, rows) });
  }));
  app2.get("/api/admin/:table", requireAdmin, asyncRoute(async (req, res) => {
    if (!adminTables.has(req.params.table)) return res.status(404).json({ error: "Not found." });
    const [rows] = await db3.query("SELECT * FROM `" + req.params.table + "` LIMIT 1000");
    res.json({ data: normalize(rows) });
  }));
  let uploads = 0;
  app2.post("/api/admin/media/upload", requireAdmin, asyncRoute(async (req, res) => {
    if (uploads >= 2) return res.status(429).json({ error: "Please wait for the current upload to finish." });
    uploads++;
    try {
      await uploadMedia(db3, options.mediaRoot, req, res);
    } finally {
      uploads--;
    }
  }));
  app2.post("/api/admin/media/:id/update", requireAdmin, asyncRoute((req, res) => updateMedia(db3, req, res)));
  app2.post("/api/admin/media/:id/delete", requireAdmin, asyncRoute((req, res) => deleteMedia(db3, options.mediaRoot, req, res)));
  app2.get("/media/:id", asyncRoute((req, res) => serveMedia(db3, options.mediaRoot, req, res)));
  app2.post("/api/admin/:table", requireAdmin, asyncRoute(async (req, res) => {
    if (!adminTables.has(req.params.table)) return res.status(404).json({ error: "Not found." });
    res.json({ data: await writeContent(db3, req.params.table, req.body) });
  }));
  const inquiry = options.inquiry || handler;
  app2.all("/api/inquiry", (req, res, next) => {
    if (req.method === "POST" && !throttle("inquiry:" + req.socket.remoteAddress, 5, 6e4)) return res.status(429).json({ error: "Please wait a minute before submitting again." });
    req.headers.host = new URL(origin).host;
    return Promise.resolve(inquiry(req, res)).catch(next);
  });
  app2.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));
  const dist = path2.resolve(options.dist || "dist");
  app2.get(/^\/partners(?:\/(.*))?$/, (req, res) => res.redirect(301, "/attorneys" + (req.params[0] ? "/" + encodeURIComponent(req.params[0]) : "")));
  app2.get(/^\/admin(?:\/.*)?$/, (_req, res) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.sendFile(path2.join(dist, "admin.html"));
  });
  app2.use(express.static(dist, { extensions: ["html"], redirect: false, dotfiles: "deny" }));
  app2.use((_req, res) => {
    res.status(404);
    res.setHeader("X-Robots-Tag", "noindex");
    const file = path2.join(dist, "404.html");
    existsSync(file) ? res.sendFile(file) : res.send("Not found");
  });
  app2.use((err, _req, res, _next) => {
    const status = [400, 404, 413, 415, 503].includes(err.status) ? err.status : err.code === "ER_DUP_ENTRY" ? 409 : err.type === "entity.too.large" ? 413 : err.type === "entity.parse.failed" ? 400 : 500;
    console.error("Backend request failed:", err.code || err.type || "internal");
    res.status(status).json({ error: err.expose ? err.message : status === 500 ? "Service temporarily unavailable." : "Invalid request." });
  });
  return app2;
}

// server/index.ts
if (process.env.INQUIRY_DATABASE !== "mysql") throw new Error("Set INQUIRY_DATABASE=mysql for the MySQL server.");
var db2 = createDatabase();
await db2.execute("SELECT 1");
var storage = await mediaRoot(process.env.MEDIA_ROOT);
await verifyMediaWritable(storage);
var app = createApp(db2, { mediaRoot: storage, origin: process.env.SITE_URL || "https://lalusispartnerslaw.com" });
var server = app.listen(Number(process.env.PORT || 3e3), "0.0.0.0", () => console.log("Website backend listening."));
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => {
  server.close(() => {
    db2.end().finally(() => process.exit(0));
  });
});
