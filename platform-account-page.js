import { header, tr, esc, link, notify } from "./platform-common.js";
import {
  acceptAuthReturn,
  accountDialog,
  cloudConfig,
  cloudSession,
  ownSubmissions,
} from "./platform-cloud.js";
const money = document.body.classList.contains("money");
let renderVersion = 0;
async function render() {
  const version = ++renderVersion;
  let error = false;
  try {
    await acceptAuthReturn();
  } catch {
    error = true;
  }
  if (version !== renderVersion) return;
  const config = await cloudConfig(),
    session = await cloudSession();
  if (version !== renderVersion) return;
  const message = !config.configured
    ? tr(
        "免费账号服务正在开通。现在可以先在本机制作、保存和备份项目。",
        "Free account services are being set up. For now, create, save and back up projects in this browser.",
      )
    : session
      ? esc(session.user?.email || "")
      : tr(
          "登录后可保存私有项目、跨设备打开，以及投稿作品。",
          "Sign in to save private projects, open them across devices and submit work.",
        );
  document.querySelector("#page").innerHTML =
    header({ money, active: "account" }) +
    `<main id="main" class="creator-login">
 <h1>${tr(session ? "你的作品，跟着你走。" : "登录账号，保存作品。", session ? "Your work goes with you." : "Sign in to keep your work.")}</h1>
 <p>${message}</p>${error ? `<p role="alert">${tr("登录链接未能验证，请重新请求。", "Could not verify the sign-in link. Request a new one.")}</p>` : ""}
 <div class="actions">${config.configured ? `<button class="button primary" id="login">${tr(session ? "管理账号" : "登录账号", session ? "Manage account" : "Sign in")}</button>` : ""}
 <a class="button" href="${link(money ? "/start.html" : "/create.html")}">${tr("先开始制作", "Start creating")}</a>
 ${session ? `<a class="button" href="${link("/works.html")}">${tr("打开云端作品", "Open cloud projects")}</a>` : ""}</div></main>`;
  document
    .querySelector("#login")
    ?.addEventListener("click", () =>
      accountDialog().catch(() =>
        notify(tr("暂时无法登录", "Sign-in is unavailable")),
      ),
    );
  if (session) {
    try {
      const items = await ownSubmissions(),
        section = document.createElement("section");
      section.className = "account-submissions";
      const states = {
        pending: tr("待审核", "Pending review"),
        approved: tr("已发布", "Published"),
        rejected: tr("需修改", "Revision requested"),
        withdrawn: tr("已撤下", "Withdrawn"),
      };
      section.innerHTML =
        `<h2>${tr("我的投稿", "My submissions")}</h2>` +
        (items.length
          ? items
              .map(
                (x) =>
                  `<article class="wizard-card"><strong>${esc(x.title)}</strong><p>${esc(states[x.status] || x.status)}</p>${x.review_note ? `<p>${esc(x.review_note)}</p>` : ""}</article>`,
              )
              .join("")
          : `<p>${tr("还没有投稿。完成短片后可在预览页提交。", "No submissions yet. Submit a film from its preview page.")}</p>`);
      if (version === renderVersion) document.querySelector("#main")?.append(section);
    } catch {}
  }
}
window.addEventListener("platform-language", render);
window.addEventListener("platform-account", render);
render();
