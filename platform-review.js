import { esc, tr, link, header, notify } from "./platform-common.js";
let access = "",
  items = [];
async function call(body) {
  const r = await fetch("/api/platform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access,
      },
      body: JSON.stringify(body),
    }),
    d = await r.json();
  if (!r.ok) throw Error(d.error);
  return d;
}
function render() {
  document.querySelector("#page").innerHTML =
    header() +
    `<main id="main" class="platform-section"><div class="section-heading"><div><h1>${tr("投稿审核", "Submission review")}</h1><p>${tr("所有者审核入口。私人项目包不会公开。", "Owner moderation. Private project packages are never published.")}</p></div><button class="button" id="connect-review">${tr("导入所有者连接文件", "Import owner connection file")}</button></div><input id="review-file" type="file" accept=".json" hidden><p role="status" id="review-status"></p><div>${items.map((x) => `<article class="panel" data-review="${x.id}"><h2>${esc(x.title)}</h2><p>${esc(x.creator_name)} · ${esc(x.status)}</p><p>${esc(x.description)}</p><video controls playsinline preload="none" src="${esc(x.preview_url)}" style="max-width:100%;max-height:350px"></video><label>${tr("审核意见", "Review notes")}<textarea maxlength="1200"></textarea></label><div class="actions" style="margin-top:15px"><button class="button primary" data-status="approved" data-id="${x.id}">${tr("通过并发布", "Approve & publish")}</button><button class="button" data-status="rejected" data-id="${x.id}">${tr("退回修改", "Return for revision")}</button>${x.status === "approved" ? `<button class="button" data-status="withdrawn" data-id="${x.id}">${tr("撤下作品", "Withdraw")}</button>` : ""}</div></article>`).join("")}</div></main>`;
  document.querySelector("#connect-review").onclick = () =>
    document.querySelector("#review-file").click();
  document.querySelector("#review-file").onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file || file.size > 64000) throw Error();
      const d = JSON.parse(await file.text()),
        entry = d.sites?.find(
          (x) => new URL(x.url).hostname === location.hostname,
        );
      if (!entry?.accessToken) throw Error();
      access = entry.accessToken;
      items = (await call({ action: "review-list" })).items;
      render();
      document.querySelector("#review-status").textContent = tr(
        "已加载投稿。",
        "Submissions loaded.",
      );
    } catch {
      document.querySelector("#review-status").textContent = tr(
        "无法连接审核服务，请检查连接文件和云端配置。",
        "Could not connect. Check the owner file and cloud configuration.",
      );
    }
  };
  document.querySelectorAll("[data-status]").forEach(
    (b) =>
      (b.onclick = async () => {
        const note = b
          .closest("[data-review]")
          .querySelector("textarea")
          .value.trim();
        if (b.dataset.status === "rejected" && !note) {
          notify(
            tr(
              "请说明需要修改的位置和原因。",
              "Describe what needs revision and why.",
            ),
          );
          return;
        }
        b.disabled = true;
        try {
          await call({
            action: "review",
            id: b.dataset.id,
            status: b.dataset.status,
            note,
          });
          items = (await call({ action: "review-list" })).items;
          render();
          notify(tr("审核结果已保存。", "Review saved."));
        } catch {
          b.disabled = false;
          notify(
            tr("审核未完成，请重试。", "Review did not finish. Try again."),
          );
        }
      }),
  );
}
render();
window.addEventListener("platform-language", render);
