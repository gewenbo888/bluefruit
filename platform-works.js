import { Store } from "./workspace-core.js";
import {
  header,
  tr,
  lang,
  esc,
  link,
  icon,
  notify,
} from "./platform-common.js";
import {
  cloudConfig,
  cloudSession,
  accountDialog,
  showCloudProjects,
  loadCloud,
} from "./platform-cloud.js";
const money = document.body.classList.contains("money"),
  kind = money ? "money" : "blue",
  store = new Store(kind);
let archived = false,
  projects = [],
  config = { configured: false };
const creator = () => (money ? "/start.html" : "/create.html"),
  editor = () => (money ? "/projects.html" : "/studio.html");
async function render() {
  const session = await cloudSession(),
    items = projects
      .filter((p) => !!p.archived === archived)
      .sort((a, b) => b.updated.localeCompare(a.updated));
  const states = {
    draft: tr("草稿", "Draft"),
    active: tr("制作中", "In progress"),
    ready: tr("待验收", "Ready for review"),
    delivered: tr("已交付", "Delivered"),
  };
  document.title =
    tr("我的作品", "My work") + " · " + (money ? "AI for Money" : "BlueFruit");
  document.querySelector("#page").innerHTML =
    header({ money, active: "works" }) +
    `<main id="main" class="platform-section works-page"><div class="section-heading"><div><h1>${tr(money ? "我的项目" : "我的作品", money ? "My projects" : "My work")}</h1><p>${tr("接着上次的想法，继续往前做。", "Pick up an idea and keep it moving.")}</p></div><a class="button primary" href="${link(creator())}">${icon("plus")}${tr("新建作品", "New project")}</a></div><div class="cloud-status">${config.configured ? tr(session ? "已登录。可以打开云端作品，或继续编辑本机草稿。" : "本机草稿无需登录。登录后可保存到账号、跨设备打开。", session ? "Signed in. Open cloud projects or keep working on local drafts." : "Local drafts work without an account. Sign in to save and open work across devices.") : tr("本机草稿自动保存。账号与云端服务正在开通，当前可以完整制作并下载备份。", "Local drafts save automatically. Account and cloud services are being set up. You can still create, export and back up.")} ${config.configured ? `<button class="text-button" id="cloud-projects">${tr(session ? "打开云端作品" : "登录账号", session ? "Open cloud projects" : "Sign in")}</button><a href="${link("/account.html")}">${tr("账号与投稿进度", "Account & submission status")}</a>` : ""}</div><div class="section-heading"><h2>${tr(archived ? "已归档" : "本机草稿", archived ? "Archived" : "Local drafts")}</h2><button class="text-button" id="toggle-archived">${tr(archived ? "查看进行中的作品" : "查看归档", archived ? "Show active projects" : "Show archived")}</button></div>${items.length ? `<div class="work-list">${items.map((p) => `<article class="work-row"><a href="${link((archived ? editor() : creator()) + "?project=" + p.id)}"><h2>${esc(p.title)}</h2><p>${esc((p.goal || "").slice(0, 150))}</p><span>${esc(states[p.phase] || states.draft)} · ${esc(new Date(p.updated).toLocaleDateString(lang === "en" ? "en-US" : "zh-CN"))}</span></a><a class="button" href="${link(editor() + "?project=" + p.id)}">${tr(archived ? "恢复与管理" : "完整编辑器", archived ? "Restore & manage" : "Full editor")}</a></article>`).join("")}</div>` : `<div class="empty works-empty"><h2>${tr(archived ? "还没有归档作品" : "第一份作品，从这里开始。", archived ? "No archived projects" : "Your first project starts here.")}</h2><p>${tr("从一个具体想法开始，或直接编辑完整示例。", "Start with an idea, or edit the complete example.")}</p><a class="button primary" href="${link(money ? "/start.html" : "/create.html?demo=1")}">${tr(money ? "选一个方向开始" : "打开完整示例", money ? "Choose a starting point" : "Open complete example")}</a></div>`}</main>`;
  document.querySelector("#toggle-archived").onclick = () => {
    archived = !archived;
    render();
  };
  document
    .querySelector("#cloud-projects")
    ?.addEventListener("click", async () => {
      try {
        if (!(await cloudSession())) {
          await accountDialog();
          return;
        }
        await showCloudProjects(async (row) => {
          const p = await loadCloud(row, store, kind);
          if (p) location.href = link(creator() + "?project=" + p.id);
        });
      } catch {
        notify(
          tr(
            "暂时无法打开云端作品，本机草稿仍可使用。",
            "Cloud projects are unavailable. Local drafts still work.",
          ),
        );
      }
    });
}
async function init() {
  projects = (await store.all("projects")).filter((p) => p.kind === kind);
  config = await cloudConfig();
  render();
}
window.addEventListener("platform-language", render);
window.addEventListener("platform-account", render);
window.addEventListener("pageshow", () => {
  store.all("projects").then((p) => {
    projects = p.filter((p) => p.kind === kind);
    render();
  });
});
init();
