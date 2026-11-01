const { configuration, rest, user, equal } = require("../server/platform.js");
const uuid = (v) => typeof v === "string" && /^[a-f0-9-]{36}$/i.test(v),
  txt = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const send = (s, d) => res.status(s).json(d),
    c = configuration();
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return send(400, { error: "invalid_json" });
  }
  const action =
    req.method === "GET"
      ? req.query?.action ||
        new URL(req.url, "https://local").searchParams.get("action")
      : body.action;
  const configured = !!(
    c.url &&
    c.publicKey &&
    c.secret &&
    process.env.PLATFORM_LOGIN_READY === "true"
  );
  if (action === "config" && req.method === "GET")
    return send(200, {
      configured,
      url: configured ? c.url : null,
      publicKey: configured ? c.publicKey : null,
    });
  if (action === "publications" && req.method === "GET") {
    if (!c.url || !c.publicKey) return send(200, { items: [] });
    try {
      const items = await rest(
        "/rest/v1/psy_publications?select=id,title,description,creator_name,video_url,created_at&visible=eq.true&order=created_at.desc&limit=30",
        { admin: false },
      );
      return send(200, { items });
    } catch {
      return send(503, { error: "library_unavailable" });
    }
  }
  if (req.method !== "POST") return send(405, { error: "method" });
  if (!configured) return send(503, { error: "not_configured" });
  const origin = req.headers.origin;
  if (origin && origin !== process.env.WORKSPACE_ORIGIN)
    return send(403, { error: "origin" });
  if (JSON.stringify(body).length > 20000) return send(413, { error: "size" });
  const token = String(req.headers.authorization || "").replace(/^Bearer /, "");
  try {
    if (["review-list", "review"].includes(action)) {
      if (
        !process.env.WORKSPACE_ACCESS_SECRET ||
        !equal(token, process.env.WORKSPACE_ACCESS_SECRET)
      )
        return send(401, { error: "unauthorized" });
      if (action === "review-list") {
        const items = await rest(
          "/rest/v1/psy_submissions?select=*&order=created_at.desc&limit=40",
        );
        for (const row of items) {
          const signed = await rest(
            "/storage/v1/object/sign/psy-submissions/" + row.asset_path,
            { method: "POST", body: { expiresIn: 300 } },
          );
          row.preview_url = c.url + "/storage/v1" + signed.signedURL;
        }
        return send(200, { items });
      }
      if (
        !uuid(body.id) ||
        !["approved", "rejected", "withdrawn"].includes(body.status) ||
        (body.status === "rejected" && !txt(body.note, 1200))
      )
        return send(400, { error: "review" });
      const [row] = await rest(
        "/rest/v1/psy_submissions?id=eq." + body.id + "&limit=1",
      );
      if (!row) return send(404, { error: "missing" });
      if (body.status === "approved") {
        const destination =
          body.id + (row.mime.includes("mp4") ? ".mp4" : ".webm");
        try {
          await rest("/storage/v1/object/copy", {
            method: "POST",
            body: {
              bucketId: "psy-submissions",
              sourceKey: row.asset_path,
              destinationKey: destination,
              destinationBucket: "psy-public",
            },
          });
        } catch (e) {
          if (e.status !== 409) throw e;
        }
        await rest("/rest/v1/psy_publications?on_conflict=id", {
          method: "POST",
          body: {
            id: row.id,
            title: row.title,
            description: row.description,
            creator_name: row.creator_name,
            video_url:
              c.url + "/storage/v1/object/public/psy-public/" + destination,
            visible: true,
          },
          headers: { Prefer: "resolution=merge-duplicates" },
        });
      } else {
        await rest("/rest/v1/psy_publications?id=eq." + body.id, {
          method: "PATCH",
          body: { visible: false },
        });
        try {
          await rest("/storage/v1/object/psy-public", {
            method: "DELETE",
            body: {
              prefixes: [
                body.id + (row.mime.includes("mp4") ? ".mp4" : ".webm"),
              ],
            },
          });
        } catch (e) {
          if (e.status !== 404) throw e;
        }
      }
      await rest("/rest/v1/psy_submissions?id=eq." + body.id, {
        method: "PATCH",
        body: {
          status: body.status,
          review_note: txt(body.note, 1200),
          reviewed_at: new Date().toISOString(),
        },
      });
      return send(200, { status: body.status });
    }
    const u = await user(token);
    if (action === "my-submissions") {
      const items = await rest(
        "/rest/v1/psy_submissions?user_id=eq." +
          u.id +
          "&select=id,title,status,review_note,created_at&order=created_at.desc&limit=50",
      );
      return send(200, { items });
    }
    if (action === "list-projects") {
      const items = await rest(
        "/rest/v1/psy_projects?user_id=eq." +
          u.id +
          "&select=id,kind,title,path,updated_at&archived=eq.false&order=updated_at.desc&limit=50",
      );
      return send(200, { items });
    }
    if (action === "save-project") {
      if (
        !uuid(body.id) ||
        !["blue", "money"].includes(body.kind) ||
        !body.path?.startsWith(u.id + "/" + body.kind + "/" + body.id + "/") ||
        !new RegExp(
          "^" +
            u.id +
            "/" +
            body.kind +
            "/" +
            body.id +
            "/[a-f0-9-]{36}\\.zip$",
          "i",
        ).test(body.path) ||
        !Number.isInteger(body.size) ||
        body.size < 1 ||
        body.size > 52428800
      )
        return send(400, { error: "project" });
      await rest("/rest/v1/psy_projects?on_conflict=user_id,kind,id", {
        method: "POST",
        body: {
          id: body.id,
          user_id: u.id,
          kind: body.kind,
          title: txt(body.title, 200),
          path: body.path,
          size: body.size,
          updated_at: new Date().toISOString(),
          archived: false,
        },
        headers: { Prefer: "resolution=merge-duplicates" },
      });
      return send(200, { saved: true });
    }
    if (action === "submit") {
      if (
        !uuid(body.id) ||
        !uuid(body.project_id) ||
        !["video/mp4", "video/webm"].some((x) => body.mime?.startsWith(x)) ||
        !Number.isInteger(body.size) ||
        body.size < 1 ||
        body.size > 52428800 ||
        !new RegExp(
          "^" + u.id + "/submissions/" + body.id + "\\.(mp4|webm)$",
        ).test(body.path) ||
        !txt(body.title, 150) ||
        !txt(body.creator_name, 80)
      )
        return send(400, { error: "submission" });
      await rest("/rest/v1/psy_submissions", {
        method: "POST",
        body: {
          id: body.id,
          user_id: u.id,
          project_id: body.project_id,
          title: txt(body.title, 150),
          description: txt(body.description, 1200),
          creator_name: txt(body.creator_name, 80),
          language: txt(body.language, 20),
          asset_path: body.path,
          mime: txt(body.mime, 100),
          size: body.size,
          status: "pending",
        },
      });
      return send(200, { submitted: true, status: "pending" });
    }
    return send(400, { error: "action" });
  } catch (e) {
    return send(e.message === "unauthorized" ? 401 : 502, {
      error: e.message === "unauthorized" ? "unauthorized" : "service_request",
    });
  }
};
