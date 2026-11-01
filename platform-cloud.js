import { backup, restorePackage, uid } from "./workspace-core.js";
import { esc, tr, notify, link } from "./platform-common.js";
let configuration, sessionMemory;
window.addEventListener("storage", (e) => {
  if (e.key === "psy-cloud-session-v1") {
    sessionMemory = null;
    window.dispatchEvent(new Event("platform-account"));
  }
});
const SESSION_KEY = "psy-cloud-session-v1";
export async function cloudConfig() {
  if (configuration) return configuration;
  try {
    const r = await fetch("/api/platform?action=config", { cache: "no-store" });
    if (!r.ok) throw Error();
    configuration = await r.json();
    return configuration;
  } catch {
    return { configured: false };
  }
}
function remember(session) {
  if (session && !session.expires_at)
    session.expires_at =
      Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600);
  if (session)
    session = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: { id: session.user?.id, email: session.user?.email || "" },
    };
  sessionMemory = session;
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
  window.dispatchEvent(new Event("platform-account"));
}
async function supabase(path, options = {}, token) {
  const config = await cloudConfig();
  if (!config.configured) throw Error("cloud_offline");
  const headers = { apikey: config.publicKey, ...options.headers };
  if (token) headers.Authorization = "Bearer " + token;
  const r = await fetch(config.url + path, { ...options, headers });
  if (!r.ok) {
    let d;
    try {
      d = await r.json();
    } catch {}
    throw Error(
      r.status === 401
        ? "sign_in"
        : d?.code === "over_email_send_rate_limit"
          ? "email_limit"
          : "cloud_request",
    );
  }
  if (r.status === 204) return null;
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}
export async function cloudSession() {
  if (!sessionMemory) {
    try {
      sessionMemory = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {}
  }
  if (!sessionMemory) return null;
  if (sessionMemory.expires_at * 1000 < Date.now() + 60000) {
    try {
      const d = await supabase("/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: sessionMemory.refresh_token }),
      });
      remember(d);
    } catch {
      remember(null);
      return null;
    }
  }
  return sessionMemory;
}
function modal(title) {
  const dialog = document.createElement("dialog");
  dialog.setAttribute("aria-labelledby", "cloud-dialog-title");
  dialog.innerHTML = `<button class="close" aria-label="${tr("关闭", "Close")}">×</button><div id="cloud-dialog-body"><h2 id="cloud-dialog-title">${esc(title)}</h2></div>`;
  dialog.querySelector(".close").onclick = () => dialog.close();
  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}
const PKCE_KEY = "psy-cloud-pkce-v1";
async function prepareProof() {
  const bytes = crypto.getRandomValues(new Uint8Array(48));
  const verifier = btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
  );
  const challenge = btoa(String.fromCharCode(...digest))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  sessionStorage.setItem(
    PKCE_KEY,
    JSON.stringify({ verifier, created: Date.now() }),
  );
  return challenge;
}
async function githubSignIn() {
  const config = await cloudConfig();
  if (!config.configured || !config.auth?.github) throw Error("cloud_offline");
  const challenge = await prepareProof();
  const url = new URL(config.url + "/auth/v1/authorize");
  url.search = new URLSearchParams({
    provider: "github",
    redirect_to: location.origin + link("/account.html"),
    code_challenge: challenge,
    code_challenge_method: "s256",
  }).toString();
  location.assign(url.href);
}
export async function accountDialog() {
  const config = await cloudConfig();
  if (!config.configured) throw Error("cloud_offline");
  const session = await cloudSession(),
    dialog = modal(
      tr(
        session ? "我的账号" : "登录并保存作品",
        session ? "My account" : "Sign in to save your work",
      ),
    ),
    body = dialog.querySelector("#cloud-dialog-body");
  if (session) {
    body.innerHTML += `<p>${esc(session.user?.email || "")}</p><p>${tr("项目和素材可保存到账号，在其他设备登录后打开。", "Save projects and assets to your account, then open them on another device.")}</p><button class="button" id="sign-out">${tr("退出登录", "Sign out")}</button>`;
    body.querySelector("#sign-out").onclick = async () => {
      const token = session.access_token;
      remember(null);
      try {
        await supabase("/auth/v1/logout", { method: "POST" }, token);
      } catch {}
      dialog.close();
    };
    return null;
  }
  body.innerHTML += `<p>${tr("登录后，作品默认仅自己可见。本浏览器保持登录，可随时退出。", "Your work is private by default. This browser stays signed in until you sign out.")}</p>${config.auth?.github ? `<button class="button primary" id="github-sign-in">${tr("使用 GitHub 登录", "Continue with GitHub")}</button><p>${tr("仅用于身份验证，不请求仓库读写权限。", "Used to verify your identity. No repository access is requested.")}</p>` : ""}${config.auth?.email ? `<form id="cloud-email"><label>${tr("邮箱", "Email")}<input type="email" name="email" required autocomplete="email" maxlength="254"></label><button class="button primary" style="margin-top:18px">${tr("发送登录链接", "Send sign-in link")}</button><p id="cloud-login-status" role="status"></p></form>` : ""}<p id="oauth-status" role="status"></p>`;
  body
    .querySelector("#github-sign-in")
    ?.addEventListener("click", async (event) => {
      event.currentTarget.disabled = true;
      try {
        await githubSignIn();
      } catch {
        body.querySelector("#oauth-status").textContent = tr(
          "无法开始登录，请稍后重试。",
          "Could not start sign-in. Please try again.",
        );
        event.target.disabled = false;
      }
    });
  const emailForm = body.querySelector("form");
  if (!emailForm) return null;
  body.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    const button = e.target.querySelector("button");
    button.disabled = true;
    try {
      const email = new FormData(e.target).get("email"),
        challenge = await prepareProof();
      await supabase(
        "/auth/v1/otp?redirect_to=" +
          encodeURIComponent(location.origin + link("/account.html")),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            create_user: true,
            code_challenge: challenge,
            code_challenge_method: "s256",
          }),
        },
      );
      body.querySelector("#cloud-login-status").textContent = tr(
        "登录链接已请求发送，请检查邮箱。若未收到，可稍后重试。",
        "Sign-in link requested. Check your inbox; if it does not arrive, try again later.",
      );
    } catch (err) {
      body.querySelector("#cloud-login-status").textContent = tr(
        "邮件未能发送。请稍后重试；你仍可在本机制作并备份。",
        "Could not send the email. Try again later; you can still work locally and back up.",
      );
    } finally {
      button.disabled = false;
    }
  };
  return null;
}
async function authenticated() {
  const config = await cloudConfig();
  if (!config.configured) throw Error("cloud_offline");
  const s = await cloudSession();
  if (!s) {
    await accountDialog();
    return null;
  }
  return s;
}
async function platform(body, token) {
  const r = await fetch("/api/platform", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "cloud_request");
  return d;
}
export async function saveCloud(project, store) {
  const s = await authenticated();
  if (!s) return;
  const zip = await backup(structuredClone(project), store);
  if (zip.size > 50 * 1024 * 1024) throw Error("size");
  const path = `${s.user.id}/${project.kind}/${project.id}/${uid()}.zip`;
  await supabase(
    "/storage/v1/object/psy-projects/" + path,
    {
      method: "POST",
      headers: { "Content-Type": "application/zip", "x-upsert": "false" },
      body: zip,
    },
    s.access_token,
  );
  await platform(
    {
      action: "save-project",
      id: project.id,
      kind: project.kind,
      title: project.title,
      path,
      size: zip.size,
      updated: project.updated,
    },
    s.access_token,
  );
}
export async function loadCloud(row, store, kind) {
  if (row.kind !== kind) throw Error("project");
  const s = await authenticated();
  if (!s) return null;
  const config = await cloudConfig(),
    r = await fetch(
      config.url + "/storage/v1/object/authenticated/psy-projects/" + row.path,
      {
        headers: {
          apikey: config.publicKey,
          Authorization: "Bearer " + s.access_token,
        },
      },
    );
  if (!r.ok) throw Error("cloud_request");
  const p = await restorePackage(
    new File([await r.blob()], "cloud-project.zip"),
    "blue" === row.kind ? "blue" : "money",
    store,
  );
  p.id = row.id;
  p.title = row.title;
  await store.put("projects", p);
  return p;
}
export async function showCloudProjects(onOpen) {
  const s = await authenticated();
  if (!s) return;
  const d = await platform({ action: "list-projects" }, s.access_token),
    dialog = modal(tr("云端作品", "Cloud projects")),
    body = dialog.querySelector("#cloud-dialog-body"),
    kind = document.body.classList.contains("money") ? "money" : "blue",
    items = d.items.filter((x) => x.kind === kind);
  body.innerHTML += items.length
    ? items
        .map(
          (x) =>
            `<button class="project-select" data-cloud-id="${esc(x.id)}"><strong>${esc(x.title)}</strong><span>${esc(new Date(x.updated_at).toLocaleString())}</span></button>`,
        )
        .join("")
    : `<p>${tr("还没有云端作品。先在项目中点击“保存到账号”。", "No cloud projects yet. Select Save to account in a project.")}</p>`;
  body.querySelectorAll("[data-cloud-id]").forEach(
    (b) =>
      (b.onclick = async () => {
        b.disabled = true;
        try {
          await onOpen(items.find((x) => x.id === b.dataset.cloudId));
          dialog.close();
        } catch {
          notify(
            tr(
              "无法打开项目，请重试。",
              "Could not open the project. Try again.",
            ),
          );
          b.disabled = false;
        }
      }),
  );
}
export async function submitFilm(project, store) {
  const s = await authenticated();
  if (!s) return;
  const output = project.outputs
    .filter((o) => !o.archived && o.assetId && /\.(mp4|webm)$/i.test(o.name))
    .at(-1);
  if (!output) throw Error("media");
  const asset = await store.get("assets", output.assetId);
  if (!asset || asset.blob.size > 50 * 1024 * 1024) throw Error("size");
  const mime = asset.mime.split(";")[0];
  const dialog = modal(tr("投稿到蓝果", "Submit to BlueFruit")),
    body = dialog.querySelector("#cloud-dialog-body");
  body.innerHTML += `<p>${tr("投稿仅发送你选定的成片、标题、简介与署名，私人项目包不会公开。审核通过后作品才会展示。", "Only the selected film, title, description and creator name are submitted. Your private project package stays private. Work appears publicly after approval.")}</p><form id="submit-film"><label>${tr("作品标题", "Film title")}<input name="title" required maxlength="150" value="${esc(project.title)}"></label><label>${tr("创作者署名", "Creator name")}<input name="creator" required maxlength="80"></label><label>${tr("作品简介", "Description")}<textarea name="description" required maxlength="1200"></textarea></label><label class="check"><input type="checkbox" required>${tr("我有权发布该作品，并同意审核通过后公开展示。", "I have the right to publish this work and agree to public display after approval.")}</label><button class="button primary">${tr("提交审核", "Submit for review")}</button><p role="status" id="submit-status"></p></form>`;
  body.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    const button = e.target.querySelector("button");
    button.disabled = true;
    try {
      const d = new FormData(e.target),
        id = uid(),
        extension = asset.mime.includes("mp4") ? "mp4" : "webm",
        path = `${s.user.id}/submissions/${id}.${extension}`;
      await supabase(
        "/storage/v1/object/psy-submissions/" + path,
        {
          method: "POST",
          headers: { "Content-Type": mime, "x-upsert": "false" },
          body: asset.blob,
        },
        s.access_token,
      );
      await platform(
        {
          action: "submit",
          id,
          path,
          mime,
          size: asset.blob.size,
          title: d.get("title"),
          description: d.get("description"),
          creator_name: d.get("creator"),
          language: document.documentElement.lang,
          project_id: project.id,
        },
        s.access_token,
      );
      body.querySelector("#submit-status").textContent = tr(
        "已提交，等待审核。可以在完整编辑器中继续修改草稿。",
        "Submitted for review. You can continue editing the private draft.",
      );
      button.hidden = true;
    } catch {
      body.querySelector("#submit-status").textContent = tr(
        "投稿未完成，请重试。你的本机作品未改变。",
        "Submission failed. Your local work is unchanged. Try again.",
      );
      button.disabled = false;
    }
  };
}
export async function acceptAuthReturn() {
  const query = new URLSearchParams(location.search),
    hash = new URLSearchParams(location.hash.slice(1));
  const code = query.get("code"),
    failed =
      query.has("error") || hash.has("error") || hash.has("access_token");
  if (!code && !failed) return false;
  query.delete("code");
  query.delete("error");
  query.delete("error_code");
  query.delete("error_description");
  history.replaceState(
    null,
    "",
    location.pathname + (query.size ? "?" + query : ""),
  );
  const raw = sessionStorage.getItem(PKCE_KEY);
  sessionStorage.removeItem(PKCE_KEY);
  if (failed || !code || code.length > 4096) throw Error("auth_return");
  let proof;
  try {
    proof = JSON.parse(raw);
  } catch {}
  if (
    !proof ||
    !/^[A-Za-z0-9_-]{64}$/.test(proof.verifier) ||
    Date.now() - proof.created > 600000 ||
    proof.created > Date.now()
  )
    throw Error("auth_return");
  const result = await supabase("/auth/v1/token?grant_type=pkce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auth_code: code, code_verifier: proof.verifier }),
  });
  if (!result?.access_token || !result.refresh_token)
    throw Error("auth_return");
  const user = await supabase("/auth/v1/user", {}, result.access_token);
  remember({ ...result, user });
  return true;
}

export async function ownSubmissions() {
  const s = await cloudSession();
  if (!s) return [];
  return (await platform({ action: "my-submissions" }, s.access_token)).items;
}
