export const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let preference = "zh";
try {
  preference = localStorage.getItem("psy-site-language") || "zh";
} catch {}
export let lang =
  new URLSearchParams(location.search).get("lang") || preference;
if (!["zh", "en"].includes(lang)) lang = "zh";
export const tr = (zh, en) => (lang === "en" ? en : zh);
export const link = (path) => {
  const u = new URL(path, location.origin);
  u.searchParams.set("lang", lang);
  return u.pathname + u.search + u.hash;
};
export const icon = (name = "arrow") =>
  `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{ play: '<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>', arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>', back: '<path d="M19 12H5m5-5-5 5 5 5"/>', check: '<path d="m5 12 4 4L19 6"/>', plus: '<path d="M12 5v14M5 12h14"/>' }[name] || ""}</svg>`;
export function setLanguage(next) {
  lang = next;
  try {
    localStorage.setItem("psy-site-language", next);
  } catch {}
  const u = new URL(location.href);
  u.searchParams.set("lang", next);
  history.replaceState(null, "", u);
  document.documentElement.lang = next === "en" ? "en" : "zh-CN";
  window.dispatchEvent(new Event("platform-language"));
}
export function languageButtons() {
  return `<div class="language" role="group" aria-label="Language"><button data-language="zh" aria-pressed="${lang === "zh"}">中文</button><button data-language="en" aria-pressed="${lang === "en"}">EN</button></div>`;
}
export function header({ money = false, active = "watch" } = {}) {
  return `<a class="skip" href="#main">${tr("跳至内容", "Skip to content")}</a><header class="platform-header"><a class="platform-brand" href="${link("/")}">${money ? "AI for Money" : "BLUEFRUIT <span>蓝果短剧</span>"}</a><nav aria-label="${tr("主导航", "Main navigation")}">${money ? `<a href="${link("/#library")}">${tr("项目库", "Project library")}</a>` : `<a href="${link("/")}" ${active === "watch" ? 'aria-current="page"' : ""}>${tr("看短剧", "Watch")}</a><a href="${link("/#stories")}">${tr("故事设定", "Story concepts")}</a>`}</nav><div class="header-actions"><a class="button primary header-create" href="${link(money ? "/start.html" : "/create.html")}">${tr(money ? "开始一个项目" : "开始创作", money ? "Start a project" : "Start creating")}</a><a class="my-work" href="${link("/works.html")}" ${active === "works" ? 'aria-current="page"' : ""}>${tr("我的作品", "My work")}</a>${languageButtons()}</div></header>`;
}
export function notify(message) {
  let el = document.querySelector("#notice-toast");
  if (!el) {
    el = document.createElement("p");
    el.id = "notice-toast";
    el.className = "notice-toast";
    el.setAttribute("role", "status");
    document.body.append(el);
  }
  el.textContent = message;
  el.hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => (el.hidden = true), 5000);
}
export function readLibrary() {
  try {
    const v = JSON.parse(localStorage.getItem("bluefruit-viewer-v1"));
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
export function writeLibrary(patch) {
  try {
    localStorage.setItem(
      "bluefruit-viewer-v1",
      JSON.stringify({ ...readLibrary(), ...patch }),
    );
  } catch {
    notify(
      tr(
        "无法保存观看记录，请检查浏览器存储设置。",
        "Could not save viewing history. Check browser storage settings.",
      ),
    );
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-language]");
  if (b) setLanguage(b.dataset.language);
});
document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
