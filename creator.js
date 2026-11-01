import {
  Store,
  createProject,
  uid,
  addAsset,
  download,
  backup,
  restorePackage,
  srt,
  safeURL,
  readiness,
} from "./workspace-core.js";
import { renderVideo } from "./workspace-render.js";
import {
  esc,
  tr,
  lang,
  link,
  icon,
  header,
  notify,
} from "./platform-common.js";
import {
  cloudConfig,
  accountDialog,
  cloudSession,
  saveCloud,
  loadCloud,
  showCloudProjects,
  submitFilm,
} from "./platform-cloud.js";
const blue = !document.body.classList.contains("money"),
  kind = blue ? "blue" : "money",
  store = new Store(kind),
  $ = (s) => document.querySelector(s),
  query = new URLSearchParams(location.search);
let project = null,
  step = 0,
  idea = "",
  ratio = "16:9",
  style = "cinema",
  styleChanged = false,
  recipe = null,
  chosen = "short",
  working = false,
  abort = null,
  ownerToken = "",
  provider = null,
  objectURLs = [],
  uploadTarget = null,
  restoring = false,
  bridge = null,
  outputDraft = { name: null, url: "" };
const stages = () =>
  blue
    ? [
        tr("故事", "Story"),
        tr("分镜", "Storyboard"),
        tr("画面与声音", "Visuals & sound"),
        tr("预览导出", "Preview & export"),
      ]
    : [
        tr("选择方向", "Choose"),
        tr("制定计划", "Plan"),
        tr("制作成果", "Make"),
        tr("检查交付", "Review"),
      ];
const styles = () => ({
  cinema: tr("电影感", "Cinematic"),
  ink: tr("水墨幻想", "Ink fantasy"),
  science: tr("清新科普", "Clear science"),
});
const demoShots = () => [
  {
    title: tr("星际启程", "Beyond the horizon"),
    description: tr(
      "深空行星地平线，探索者走向辽阔世界。",
      "An explorer walks towards a vast planetary horizon.",
    ),
    narration: tr("让想象进入画面。", "Bring imagination into the frame."),
    file: "hero-concept.jpg",
  },
  {
    title: tr("记忆档案", "The memory archive"),
    description: tr(
      "未来记忆档案馆，光与透明结构交织。",
      "Light weaves through a futuristic memory archive.",
    ),
    narration: tr(
      "把故事，做成看得见的世界。",
      "Turn a story into a world we can see.",
    ),
    file: "story-sf.jpg",
  },
  {
    title: tr("故事新生", "A story begins"),
    description: tr(
      "古老石碑与山谷，故事从裂缝中开启。",
      "A story emerges from an ancient stone monument.",
    ),
    narration: tr("蓝果短剧 · 开始创作", "BlueFruit · Start creating"),
    file: "story-xh.jpg",
  },
];
const tasks = () => ({
  short: {
    title: tr("制作一条品牌短片", "Make a brand short"),
    goal: tr(
      "为一个品牌或产品制作一条清楚、有记忆点的短片。",
      "Create a memorable short film for a brand or product.",
    ),
    output: tr("可播放视频与字幕", "Playable video and captions"),
    steps: [
      tr(
        "明确受众、用途与一句核心信息",
        "Define the audience, use and one key message",
      ),
      tr(
        "完成脚本与画面，制作可播放短片",
        "Develop the script and visuals, then make a playable film",
      ),
      tr(
        "核对视频与字幕，记录试用反馈",
        "Check the video and captions; record trial feedback",
      ),
    ],
  },
  tool: {
    title: tr("做一个实用小工具", "Build a useful tool"),
    goal: tr(
      "选择一个重复的工作，把它变成可以试用的小工具。",
      "Turn one repetitive task into a tool someone can try.",
    ),
    output: tr(
      "可试用链接、使用说明与测试记录",
      "Working link, instructions and test notes",
    ),
    steps: [
      tr(
        "找一个明确问题，写出输入与期望结果",
        "Choose a specific problem; define inputs and expected results",
      ),
      tr(
        "实现最小可用版本，使用实际样例测试",
        "Build a working version and test realistic examples",
      ),
      tr(
        "整理使用说明，让一位用户试用并记录反馈",
        "Write instructions; ask someone to try it and record feedback",
      ),
    ],
  },
  research: {
    title: tr("整理一份研究简报", "Prepare a research brief"),
    goal: tr(
      "围绕一个具体问题，整理来源可靠、结论清楚的研究简报。",
      "Research a specific question with traceable sources and clear conclusions.",
    ),
    output: tr(
      "研究文档、来源链接与结论摘要",
      "Research document, source links and summary",
    ),
    steps: [
      tr(
        "界定问题与读者，列出需要核对的事实",
        "Define the question and audience; list facts to verify",
      ),
      tr(
        "查阅原始来源，整理证据与不确定性",
        "Read primary sources; capture evidence and uncertainty",
      ),
      tr(
        "形成摘要、结论与可追溯的来源清单",
        "Write a summary and conclusions with traceable sources",
      ),
    ],
  },
});
function modeTitle() {
  return blue
    ? tr("先说说，你想讲什么故事。", "What story would you like to tell?")
    : tr("先完成一份，拿得出手的成果。", "Make your first useful deliverable.");
}
function currentStyle() {
  return {
    cinema: tr(
      "克制的电影感，统一色调与角色特征。",
      "Restrained cinematic composition, consistent color and characters.",
    ),
    ink: tr(
      "水墨幻想，留白与山水意象，统一笔触。",
      "Ink fantasy, landscape forms and negative space, consistent brushwork.",
    ),
    science: tr(
      "清楚、易懂的科学视觉，准确呈现，避免伪造数据。",
      "Clear, accessible science visuals. Represent facts accurately; do not invent data.",
    ),
  }[style];
}
function input(
  name,
  value,
  { area = false, label = "", type = "text", max = 3000 } = {},
) {
  return `<label>${esc(label)}${area ? `<textarea data-project="${name}" maxlength="${max}">${esc(value)}</textarea>` : `<input data-project="${name}" value="${esc(value)}" type="${type}" maxlength="${max}">`}</label>`;
}
function actions() {
  return `<div class="wizard-actions">${step ? `<button class="button" data-action="back">${icon("back")}${tr("上一步", "Back")}</button>` : ""}${step < 3 ? `<button class="button primary" data-action="next">${step === 0 ? tr(blue ? "创建我的故事" : "开始这个项目", blue ? "Create my story" : "Start this project") : tr("下一步", "Next")}${icon("arrow")}</button>` : ""}${step === 0 && blue ? `<button class="button" data-action="demo">${tr("用示例试一试", "Try a complete example")}</button>` : ""}</div>`;
}
function startPanel() {
  return `<div class="wizard-columns"><div><div class="wizard-heading"><h1>${modeTitle()}</h1><p>${blue ? tr("写一句想法，或从一份完整示例开始。", "Write an idea, or start with a complete example.") : tr("选一个方向。每一步都有具体任务和完成标准。", "Choose a direction, then follow concrete tasks and acceptance criteria.")}</p></div>${
    blue
      ? `<label class="idea-label">${tr("故事想法", "Story idea")}<textarea id="idea" maxlength="3000" placeholder="${tr("例如：一个能回收记忆的人，收到了来自明天的委托。", "An archivist who recycles memories receives a request from tomorrow.")}">${esc(idea)}</textarea></label><div class="choice-group"><span>${tr("画幅", "Format")}</span><div role="group" aria-label="${tr("选择画幅", "Choose format")}">${["16:9", "9:16"].map((v) => `<button data-ratio="${v}" aria-pressed="${ratio === v}">${v === "16:9" ? tr("横屏 16:9", "Landscape 16:9") : tr("竖屏 9:16", "Portrait 9:16")}</button>`).join("")}</div></div><div class="choice-group"><span>${tr("风格", "Style")}</span><div role="group" aria-label="${tr("选择风格", "Choose style")}">${Object.entries(
          styles(),
        )
          .map(
            ([k, v]) =>
              `<button data-style="${k}" aria-pressed="${style === k}">${v}</button>`,
          )
          .join("")}</div></div>`
      : `<div class="wizard-template-list">${Object.entries(tasks())
          .map(
            ([id, t]) =>
              `<button data-template="${id}"><strong>${t.title} ${icon("arrow")}</strong><span>${t.output}</span></button>`,
          )
          .join(
            "",
          )}</div>${input("goal", idea || tasks()[chosen].goal, { area: true, label: tr("你想解决什么问题？", "What do you want to solve?") })}`
  }${actions()}<p class="wizard-help">${tr("先体验，再完善。随时可以进入完整编辑器。", "Try it first. Refine as you go, or open the full editor anytime.")}</p></div><aside class="wizard-preview">${blue ? `<img src="/assets/hero-concept.jpg" width="1672" height="941" alt="${tr("示例使用的行星概念画面", "Planet concept artwork used in the example")}"><div><h2>${tr("6 秒品牌短片", "A six-second brand short")}</h2><p>${tr("含三张画面、字幕和原创氛围音轨。无需连接生成服务，即可编辑并导出。", "Three visuals, captions and an original ambient soundtrack. Edit and export without connecting a generation service.")}</p><button class="text-button" data-action="demo">${icon("play")}${tr("打开完整示例", "Open complete example")}</button></div>` : `<div class="sample-delivery"><span>${icon("check")}</span><h2>${tr("完成什么，一眼就知道", "Know what done looks like")}</h2><p>${tr("目标、三项任务、一份成果。先跑通一次，再考虑规模。", "One goal, three tasks, one deliverable. Complete the first cycle before scaling.")}</p><a href="${link("/#library")}">${tr("返回完整分类筛选", "Browse all project filters")}</a></div>`}</aside></div>`;
}
function planPanel() {
  const items = blue
    ? project.shots.filter((x) => !x.archived)
    : project.tasks.filter((x) => !x.archived);
  return `<div class="wizard-heading"><h1>${tr(blue ? "把故事，拆成看得见的镜头。" : "把目标，变成能完成的任务。", blue ? "Shape the story into shots." : "Turn the goal into clear tasks.")}</h1><p>${tr("直接修改下面的草稿。已有内容会随时保存。", "Edit the draft below. Your changes are saved as you go.")}</p></div><div class="wizard-actions"><button class="button" data-action="ai-plan">${tr(blue ? "用 AI 帮我拆分镜" : "用 AI 完善计划", blue ? "Plan shots with AI" : "Refine plan with AI")}</button>${blue ? `<button class="text-button" data-action="add-shot">${icon("plus")}${tr("添加镜头", "Add shot")}</button>` : ""}</div><div class="wizard-plan">${items.map((s, i) => (blue ? `<article class="wizard-card" data-id="${s.id}"><div class="wizard-card-head"><b>${String(i + 1).padStart(2, "0")}</b><label class="sr-only" for="title-${s.id}">${tr("镜头名称", "Shot name")}</label><input id="title-${s.id}" data-shot="title" data-id="${s.id}" value="${esc(s.title)}" maxlength="200"></div><div class="grid"><label class="wide">${tr("画面描述", "Visual description")}<textarea data-shot="description" data-id="${s.id}" maxlength="3000">${esc(s.description)}</textarea></label><label>${tr("画面字幕", "Caption")}<textarea data-shot="narration" data-id="${s.id}" maxlength="350">${esc(s.narration)}</textarea></label><label>${tr("秒数", "Seconds")}<input data-shot="duration" data-id="${s.id}" type="number" min="0.5" max="30" step="0.5" value="${s.duration}"></label></div><button class="text-button" data-action="remove-shot" data-id="${s.id}" ${items.length < 2 ? "disabled" : ""}>${tr("移除镜头", "Remove shot")}</button></article>` : `<article class="wizard-card"><label>${tr("任务", "Task")} ${i + 1}<input data-task="title" data-id="${s.id}" value="${esc(s.title)}" maxlength="300"></label><label>${tr("完成记录或证据", "Completion notes or evidence")}<textarea data-task="evidence" data-id="${s.id}" maxlength="3000">${esc(s.evidence)}</textarea></label><label class="check"><input type="checkbox" data-task-done="${s.id}" ${s.status === "done" ? "checked" : ""}>${tr("这一步已完成", "This task is complete")}</label></article>`)).join("")}</div>${actions()}`;
}
function mediaPanel() {
  return `<div class="wizard-heading"><h1>${tr(blue ? "给每个镜头，配上画面与声音。" : "把做出的成果，放进这个项目。", blue ? "Add the visuals and sound." : "Keep the result with your project.")}</h1><p>${blue ? tr("上传图片或短视频。示例素材可以直接使用，也可以替换。", "Upload images or video clips. Keep the example assets or replace them.") : tr("可以上传文件，或保存一个可访问的成果链接。", "Upload a file or save an accessible link.")}</p></div>${
    blue
      ? `<div class="wizard-media-grid">${project.shots
          .filter((s) => !s.archived)
          .map(
            (s, i) =>
              `<article><h3>${String(i + 1).padStart(2, "0")} · ${esc(s.title)}</h3><div class="wizard-shot-media" data-asset="${s.assetId}"><span>${tr("上传一张图片或一个视频片段", "Add an image or video clip")}</span></div><button class="button" data-action="upload-shot" data-id="${s.id}">${tr(s.assetId ? "替换画面" : "上传画面", s.assetId ? "Replace visual" : "Upload visual")}</button></article>`,
          )
          .join(
            "",
          )}</div><div class="wizard-audio"><button class="button" data-action="upload-audio">${tr(project.audioAssetId ? "替换配音或音乐" : "添加配音或音乐（选填）", project.audioAssetId ? "Replace narration or music" : "Add narration or music (optional)")}</button>${project.audioAssetId ? `<div data-asset="${project.audioAssetId}"></div><button class="text-button" data-action="remove-audio">${tr("移除音轨", "Remove audio")}</button>` : ""}</div><p class="wizard-help">${tr("示例包含原创氛围音轨。视频片段原声不会自动混入；可以单独上传配音或音乐。", "The example includes an original ambient track. Source clip audio is not mixed automatically; upload narration or music if needed.")}</p>`
      : `<form id="output-link-form" class="grid"><label>${tr("成果名称", "Deliverable name")}<input name="name" required maxlength="200" value="${esc(outputDraft.name ?? tasks()[chosen]?.output ?? project.title)}"></label><label>${tr("成果链接", "Deliverable link")}<input name="url" type="url" placeholder="https://" value="${esc(outputDraft.url)}" required></label><button class="button primary">${tr("保存链接", "Save link")}</button></form><div class="wizard-actions"><button class="button" data-action="upload-output">${tr("上传成果文件", "Upload a deliverable")}</button>${chosen === "short" || recipe?.id === "languo-short-drama" ? `<button class="button" data-action="blue-handoff">${tr("在蓝果制作短片", "Make the film in BlueFruit")}${icon("arrow")}</button>` : ""}</div><div class="wizard-plan">${project.outputs
          .filter((o) => !o.archived)
          .map(
            (o) =>
              `<article class="wizard-card"><strong>${esc(o.name)}</strong>${o.url ? `<p><a href="${esc(safeURL(o.url))}" target="_blank" rel="noopener noreferrer">${tr("打开成果", "Open result")}${icon("arrow")}</a></p>` : `<div class="wizard-shot-media" data-asset="${o.assetId}"></div>`}</article>`,
          )
          .join("")}</div>`
  }${actions()}`;
}
function outputPanel() {
  const last = project.outputs
    .filter((o) => !o.archived && o.assetId && /\.(mp4|webm)$/i.test(o.name))
    .at(-1);
  return `<div class="wizard-heading"><h1>${tr(blue ? "看一遍，带走你的作品。" : "核对一下，完成这次交付。", blue ? "Preview your work. Make it yours." : "Check the result and finish the delivery.")}</h1><p>${blue ? tr("先录制预览，再下载视频、字幕或完整项目包。", "Record a preview, then download the video, captions or full project.") : tr("确认任务与验收标准，保留反馈和下一步。", "Check tasks and acceptance criteria, then keep the feedback and next steps.")}</p></div>${
    blue
      ? `<p class="wizard-summary">${tr("分镜计划：", "Storyboard: ")}<strong>${project.shots.filter((s) => !s.archived).length}</strong> ${tr("个镜头", "shots")} · <strong>${project.shots
          .filter((s) => !s.archived)
          .reduce((n, s) => n + s.duration, 0)
          .toFixed(
            1,
          )}</strong> ${tr("秒", "seconds")} · ${project.ratio}</p>${last ? `<p class="wizard-help">${tr("最近保存的成片：", "Latest saved video: ")}${esc(last.name)}</p>` : ""}<div class="wizard-result">${last ? `<div data-result="${last.assetId}"></div>` : `<div class="cloud-status">${tr("画面就绪后，点击下方按钮录制成片。", "Once your visuals are ready, record the film below.")}</div>`}</div><div id="recording" hidden><progress id="render-progress" max="1" value="0"></progress><p id="render-label" role="status"></p><button class="button" data-action="cancel-render">${tr("停止录制", "Stop recording")}</button></div><div class="wizard-actions"><button class="button primary" data-action="render">${icon("play")}${tr(last ? "重新录制视频" : "录制并导出视频", last ? "Record a new version" : "Record & export video")}</button>${last ? `<button class="button" data-action="download-video" data-id="${last.id}">${tr("下载视频", "Download video")}</button>` : ""}${last && bridge ? `<button class="button" data-action="return-result">${tr("交回 AI for Money", "Return to AI for Money")}${icon("arrow")}</button>` : ""}<button class="button" data-action="srt">${tr("下载字幕", "Download captions")}</button><button class="button" data-action="backup">${tr("备份完整项目", "Back up project")}</button></div><p class="wizard-help">${tr("按实际时长录制，请保持本页在前台。最长 180 秒。", "Records in real time. Keep this page in the foreground. Maximum 180 seconds.")}</p><div class="wizard-actions"><button class="text-button" data-action="cloud-save">${tr("保存到账号", "Save to account")}</button>${last ? `<button class="text-button" data-action="submit">${tr("投稿到蓝果", "Submit to BlueFruit")}</button>` : ""}</div>`
      : `<div class="wizard-plan"><h2>${tr("验收标准", "Acceptance criteria")}</h2>${project.checks
          .filter((c) => !c.archived)
          .map(
            (c) =>
              `<label class="check"><input type="checkbox" data-check="${c.id}" ${c.done ? "checked" : ""}>${esc(c.title)}</label>`,
          )
          .join(
            "",
          )}${input("feedback", project.feedback, { area: true, label: tr("试用或客户反馈", "Trial or client feedback") })}<p class="wizard-summary">${tr("已完成任务", "Completed tasks")}：${project.tasks.filter((t) => !t.archived && t.status === "done").length} / ${project.tasks.filter((t) => !t.archived).length} · ${tr("成果", "Outputs")}：${project.outputs.filter((o) => !o.archived).length}</p><div class="wizard-actions"><button class="button primary" data-action="complete">${tr("检查并记录交付", "Check & record delivery")}</button><button class="button" data-action="backup">${tr("备份项目", "Back up project")}</button><button class="button" data-action="cloud-save">${tr("保存到账号", "Save to account")}</button></div><p class="wizard-help">${tr("交付记录由你确认，不表示平台已核验收款。", "Delivery is confirmed by you. This does not verify payment.")}</p></div>`
  }${actions()}`;
}
function advanced() {
  return `<details class="wizard-advanced"><summary>${tr("更多设置与 AI 服务", "More settings & AI service")}</summary><p>${tr("生成只在你点击时调用。当前图片生成服务受限，上传与导出仍可使用。", "Generation runs only when requested. Image generation is currently limited; upload and export remain available.")}</p><button class="button" data-action="account">${tr("登录账号", "Sign in")}</button><button class="button" data-action="owner-connect">${tr("所有者：连接生成服务", "Owner: connect generation service")}</button><input id="owner-file" type="file" accept=".json" hidden></details>`;
}
function render() {
  objectURLs.forEach((u) => URL.revokeObjectURL(u));
  objectURLs = [];
  document.title = blue
    ? tr("蓝果短剧 · 开始创作", "BlueFruit · Create")
    : tr("AI for Money · 第一个成果", "AI for Money · First deliverable");
  $("#page").innerHTML =
    header({ money: !blue, active: "create" }) +
    `<main id="main" class="wizard-wrap"><ol class="step-nav" aria-label="${tr("制作步骤", "Creation steps")}">${stages()
      .map(
        (s, i) =>
          `<li><button data-step="${i}" ${i > 0 && !project ? "disabled" : ""} ${i === step ? 'aria-current="step"' : ""}>${i + 1}　${s}</button></li>`,
      )
      .join(
        "",
      )}</ol><div id="wizard-body" class="wizard-form">${[startPanel, planPanel, mediaPanel, outputPanel][step]()}</div><p id="wizard-error" class="wizard-error" role="alert" hidden></p><p class="storage-inline" id="save-indicator">${tr("草稿保存在本浏览器。可随时备份。", "Drafts are saved in this browser. Back up anytime.")}</p><div class="wizard-foot"><a href="${link(blue ? "/studio.html" : "/projects.html") + (project ? "&project=" + project.id : "")}">${tr("打开完整编辑器", "Open full editor")}${icon("arrow")}</a><button class="text-button" data-action="cloud-projects">${tr("打开云端作品", "Open cloud projects")}</button>${project ? `<button class="text-button" data-action="new">${tr("开始另一个项目", "Start another project")}</button>` : ""}</div>${advanced()}<input id="creator-upload" type="file" hidden></main>`;
  hydrate();
}
function fail(error) {
  const message =
    error?.name === "AbortError"
      ? tr("已停止，已有内容已保留。", "Stopped. Existing work is preserved.")
      : error?.message === "goal"
        ? tr(
            "先写下想法或目标，也可以直接打开完整示例。",
            "Write an idea or goal, or open the complete example.",
          )
        : error?.message === "size"
          ? tr(
              "普通素材最多25 MB，合成视频最多80 MB；云端项目包最多50 MB。",
              "Uploads: 25 MB; rendered videos: 80 MB; cloud packages: 50 MB.",
            )
          : error?.message === "foreground"
            ? tr(
                "页面进入后台，录制已停止。请保持本页在前台后重试。",
                "Recording stopped when the page went into the background. Keep it in the foreground and try again.",
              )
            : error?.message === "storage"
              ? tr(
                  "浏览器无法保存，请下载备份后重试。",
                  "Browser storage is unavailable. Download a backup before trying again.",
                )
              : error?.message === "media"
                ? tr(
                    "请为每个镜头上传画面，再进行录制。",
                    "Add a visual to every shot before recording.",
                  )
                : error?.message === "duration"
                  ? tr(
                      "单次导出最长180秒，请缩短分镜时长。",
                      "A single export is limited to 180 seconds. Shorten the shots.",
                    )
                  : error?.message === "cloud_offline"
                    ? tr(
                        "账号与云端服务正在开通，当前可在本机编辑、录制和备份。",
                        "Account and cloud services are being set up. Edit, record and back up locally for now.",
                      )
                    : tr(
                        "操作未完成，已有内容仍保留。请重试或使用完整编辑器。",
                        "The operation did not finish. Existing work is preserved. Try again or use the full editor.",
                      );
  const el = $("#wizard-error");
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
  notify(message);
}
async function save(target = project, { keepPhase = false } = {}) {
  if (!target) return;
  target.updated = new Date().toISOString();
  if (!keepPhase && ["ready", "delivered"].includes(target.phase))
    target.phase = "active";
  try {
    await store.put("projects", target);
    const el = $("#save-indicator");
    if (el) el.textContent = tr("已保存到本浏览器", "Saved in this browser");
  } catch (e) {
    fail(e);
    throw e;
  }
}
function route() {
  if (!project) return;
  const u = new URL(location.href);
  u.searchParams.set("project", project.id);
  u.searchParams.set("step", step);
  u.searchParams.delete("story");
  u.searchParams.delete("recipe");
  u.searchParams.delete("demo");
  u.searchParams.delete("handoff");
  u.searchParams.delete("cloud");
  history.replaceState(null, "", u);
}
function changeStep(n) {
  if (working) return;
  step = n;
  route();
  render();
  $("#main").scrollIntoView({ block: "start" });
  const h = $("h1");
  h.tabIndex = -1;
  h.focus({ preventScroll: true });
}
async function makeProject(demo = false) {
  if (demo && project) project = null;
  if (project) {
    project.goal = idea.trim() || project.goal;
    project.ratio = ratio;
    if (styleChanged) project.style = currentStyle();
    await save();
    step = 1;
    route();
    render();
    return;
  }
  if (!demo && !idea.trim()) {
    fail({ message: "goal" });
    $("#wizard-error").textContent = tr(
      blue
        ? "先写一句故事想法，或点击“用示例试一试”。"
        : "请写下你想完成的具体成果。",
      blue
        ? "Write a story idea, or try the complete example."
        : "Describe the result you want to make.",
    );
    ($("#idea") || document.querySelector("[data-project=goal]"))?.focus();
    return;
  }
  outputDraft = { name: null, url: "" };
  const p = createProject(
    kind,
    demo
      ? tr("示例 · 蓝果品牌短片", "Example · BlueFruit brand short")
      : blue
        ? idea
            .trim()
            .split(/[。.!！\n]/)[0]
            .slice(0, 45)
        : recipe?.title || tasks()[chosen].title,
  );
  p.goal = demo
    ? tr(
        "制作一条6秒品牌短片，展示蓝果的幻想叙事风格。",
        "Make a six-second brand short introducing BlueFruit fantasy storytelling.",
      )
    : idea.trim();
  p.style = currentStyle();
  p.ratio = ratio;
  p.templateId = blue ? "" : chosen;
  p.phase = "active";
  p.checks = (
    blue
      ? [
          tr("画面与字幕清楚可读", "Visuals and captions are readable"),
          tr(
            "视频可播放，音量合适",
            "Video plays correctly with suitable audio",
          ),
          tr(
            "内容与最初的故事方向一致",
            "The result follows the original story",
          ),
        ]
      : recipe?.checks || [
          tr("成果能够打开并使用", "The result opens and works"),
          tr(
            "已按需求检查内容或功能",
            "Content or functionality has been checked",
          ),
          tr("已记录试用反馈", "Trial feedback has been recorded"),
        ]
  ).map((title) => ({ id: uid(), title, done: false, archived: false }));
  if (blue) {
    const names = [
      tr("开场", "Opening"),
      tr("转折", "Turning point"),
      tr("结尾", "Ending"),
    ];
    p.shots = names.map((title) => ({
      id: uid(),
      title,
      description: "",
      narration: "",
      duration: 3,
      assetId: "",
      assetHistory: [],
      characterId: "",
      archived: false,
    }));
    if (demo) {
      const items = demoShots();
      for (let i = 0; i < items.length; i++) {
        const r = await fetch("/assets/" + items[i].file);
        if (!r.ok) throw Error("media");
        const a = await addAsset(
          new File([await r.blob()], items[i].file, { type: "image/jpeg" }),
          store,
        );
        Object.assign(p.shots[i], {
          ...items[i],
          duration: 2,
          assetId: a.id,
          assetHistory: [a.id],
        });
        delete p.shots[i].file;
      }
      const r = await fetch("/assets/demo-ambient.mp3");
      if (!r.ok) throw Error("media");
      const a = await addAsset(
        new File([await r.blob()], "demo-ambient.mp3", { type: "audio/mpeg" }),
        store,
      );
      p.audioAssetId = a.id;
      p.audioHistory = [a.id];
      p.scope = tr(
        "三段结构：星际启程、记忆档案、故事新生。",
        "Three shots: beyond the horizon, the archive, a story begins.",
      );
    }
  } else {
    p.scope = recipe?.deliverable || tasks()[chosen].output;
    p.tasks = (recipe?.steps || tasks()[chosen].steps).map((title) => ({
      id: uid(),
      title,
      status: "todo",
      evidence: "",
      archived: false,
    }));
  }
  project = p;
  idea = p.goal;
  await save();
  step = 1;
  route();
  render();
}
async function hydrate() {
  const active = project?.id;
  for (const el of document.querySelectorAll("[data-asset],[data-result]")) {
    const id = el.dataset.asset || el.dataset.result;
    if (!id) continue;
    const a = await store.get("assets", id);
    if (project?.id !== active || !el.isConnected) return;
    if (!a?.blob) continue;
    const u = URL.createObjectURL(a.blob);
    objectURLs.push(u);
    if (a.mime.startsWith("image/"))
      el.innerHTML = `<img src="${u}" alt="${esc(a.name)}">`;
    else if (a.mime.startsWith("video/"))
      el.innerHTML = `<video src="${u}" controls playsinline preload="metadata" aria-label="${esc(a.name)}"></video>`;
    else if (a.mime.startsWith("audio/"))
      el.innerHTML = `<audio src="${u}" controls></audio>`;
    else el.innerHTML = `<p>${esc(a.name)}</p>`;
  }
}
function setBusy(on) {
  working = on;
  document.querySelectorAll("button, input, textarea, select").forEach((e) => {
    if (e.dataset.action !== "cancel-render") e.disabled = on;
  });
}
async function generatePlan() {
  if (!project) return;
  if (!provider?.enabled) {
    notify(
      tr(
        "生成服务暂不可用，可以直接编辑草稿。",
        "Generation is unavailable. You can edit the draft directly.",
      ),
    );
    return;
  }
  const session = await cloudSession();
  if (!ownerToken && !session) {
    const config = await cloudConfig();
    if (config.configured) {
      await accountDialog();
      return;
    }
    notify(
      tr(
        "可先编辑草稿或使用完整示例。所有者可以在“更多设置”连接生成服务。",
        "Edit the draft or try the complete example. Owners can connect generation under More settings.",
      ),
    );
    $("#wizard-error").hidden = false;
    $("#wizard-error").textContent = tr(
      "公共账号服务正在开通；当前生成服务仅对所有者开放。",
      "Public accounts are being set up; generation is currently available to the owner.",
    );
    return;
  }
  setBusy(true);
  try {
    const r = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (session?.access_token || ownerToken),
        },
        body: JSON.stringify({
          action: blue ? "storyboard" : "delivery",
          language: lang,
          input: {
            title: project.title,
            goal: project.goal,
            style: project.style,
            ratio: project.ratio,
            scope: project.scope,
            audience: project.audience,
          },
        }),
      }),
      d = await r.json();
    if (!r.ok) {
      if (d.error === "daily_limit") {
        notify(
          tr(
            "今日试用额度已用完，仍可手动编辑或使用示例。",
            "Today’s trial allowance is used up. You can still edit manually or use an example.",
          ),
        );
        return;
      }
      notify(
        tr(
          "生成暂未完成，已有内容已保留。可稍后重试。",
          "Generation did not finish. Existing work is preserved. Try again later.",
        ),
      );
      return;
    }
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-labelledby", "proposal-title");
    dialog.innerHTML = `<h2 id="proposal-title">${tr("先看一下生成的方案", "Review the generated plan")}</h2><p>${tr("加入后保留现有镜头和任务。AI 内容需要人工检查。", "Existing shots and tasks are preserved. Review AI content before use.")}</p><pre>${esc(JSON.stringify(d.result, null, 2))}</pre><div class="actions"><button id="apply-plan" class="button primary">${tr("加入项目", "Add to project")}</button><button id="cancel-plan" class="button">${tr("取消", "Cancel")}</button></div>`;
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("#cancel-plan").onclick = () => dialog.close();
    dialog.addEventListener("close", () => dialog.remove());
    dialog.querySelector("#apply-plan").onclick = async () => {
      const out = d.result;
      if (blue) {
        const characters = new Map(
          project.characters.map((c) => [c.name, c.id]),
        );
        for (const c of (out.characters || []).slice(0, 4)) {
          const name = String(c.name || "").slice(0, 100);
          if (!characters.has(name) && project.characters.length < 12) {
            const item = {
              id: uid(),
              name,
              description: String(c.description || "").slice(0, 2000),
              assetId: "",
              archived: false,
            };
            project.characters.push(item);
            characters.set(name, item.id);
          }
        }
        const newShots = (out.shots || [])
          .slice(0, 6)
          .map((s) => ({
            id: uid(),
            title: String(s.title || ""),
            description: String(s.description || ""),
            narration: String(s.narration || ""),
            duration: Math.max(0.5, Math.min(30, Number(s.duration) || 3)),
            assetId: "",
            assetHistory: [],
            characterId: characters.get(s.character) || "",
            archived: false,
          }));
        const emptyDraft = project.shots.every(
          (s) => !s.assetId && !s.description && !s.narration,
        );
        if (emptyDraft) project.shots.forEach((s) => (s.archived = true));
        project.shots.push(...newShots.slice(0, 30 - project.shots.length));
      } else {
        project.tasks.push(
          ...(out.tasks || [])
            .slice(0, 8)
            .map((t) => ({
              id: uid(),
              title: String(t.title || ""),
              status: "todo",
              evidence: "",
              archived: false,
            })),
        );
        project.scope = project.scope || out.outline || "";
      }
      project.checks.push(
        ...(out.acceptance || [])
          .slice(0, 6)
          .map((title) => ({
            id: uid(),
            title: String(title),
            done: false,
            archived: false,
          })),
      );
      project.aiHistory.push({ at: new Date().toISOString(), model: d.model });
      await save();
      dialog.close();
      render();
    };
  } finally {
    setBusy(false);
  }
}
async function exportFilm() {
  if (project.shots.some((s) => !s.archived && !s.assetId))
    throw Error("media");
  setBusy(true);
  abort = new AbortController();
  $("#recording").hidden = false;
  try {
    const result = await renderVideo(
      structuredClone(project),
      (id) => store.get("assets", id),
      {
        signal: abort.signal,
        onProgress: (v) => {
          $("#render-progress").value = v;
          $("#render-label").textContent =
            tr("正在录制 ", "Recording ") + Math.round(v * 100) + "%";
        },
      },
    );
    const name =
        project.title +
        "-v" +
        (project.outputs.length + 1) +
        "." +
        result.extension,
      a = await addAsset(
        new File([result.blob], name, { type: result.blob.type }),
        store,
        80,
      );
    project.outputs.push({
      id: uid(),
      name,
      assetId: a.id,
      url: "",
      created: new Date().toISOString(),
      archived: false,
    });
    await save();
    render();
    notify(
      tr(
        "视频已生成，可预览并下载。",
        "Your video is ready to preview and download.",
      ),
    );
  } finally {
    abort = null;
    setBusy(false);
    if ($("#recording")) $("#recording").hidden = true;
  }
}
function pick(target, accept) {
  uploadTarget = { ...target, projectId: project.id };
  $("#creator-upload").accept = accept;
  $("#creator-upload").click();
}
async function importOwner(file) {
  try {
    if (file.size > 64000) throw Error();
    const d = JSON.parse(await file.text()),
      entry = d.sites?.find(
        (s) => new URL(s.url).hostname === location.hostname,
      );
    if (!entry?.accessToken) throw Error();
    const r = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + entry.accessToken,
      },
      body: JSON.stringify({ action: "verify" }),
    });
    if (!r.ok) throw Error();
    ownerToken = entry.accessToken;
    notify(
      tr("生成服务已连接，本页有效。", "Generation connected for this page."),
    );
  } catch {
    notify(
      tr(
        "连接文件无效，或不属于本站。",
        "Invalid connection file, or not for this site.",
      ),
    );
  }
}
function blueOrigin() {
  return location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:4191"
    : "https://bluefruit.psyverse.fun";
}
function handoff() {
  const origin = blueOrigin(),
    nonce = uid(),
    sourceId = project.id,
    handoffBrief = {
      title: project.title,
      goal: project.goal,
      scope: project.scope,
      sourceProjectId: project.id,
      checks: project.checks.filter((c) => !c.archived).map((c) => c.title),
    };
  let child,
    ready = false;
  const listener = async (e) => {
    if (e.origin !== origin || e.source !== child || e.data?.nonce !== nonce)
      return;
    if (e.data.type === "BLUEFRUIT_READY") {
      ready = true;
      child.postMessage(
        { type: "BLUEFRUIT_BRIEF", nonce, brief: handoffBrief },
        origin,
      );
      notify(
        tr(
          "已打开蓝果，正在传递简报。",
          "BlueFruit is open. Transferring the brief.",
        ),
      );
    }
    if (e.data.type === "BLUEFRUIT_BRIEF_SAVED")
      notify(
        tr(
          "简报已在蓝果保存，可开始制作。",
          "Your brief is saved in BlueFruit. Start creating there.",
        ),
      );
    if (e.data.type === "BLUEFRUIT_RESULT") {
      const output = e.data.output;
      if (
        e.data.sourceProjectId !== sourceId ||
        !(output?.blob instanceof Blob) ||
        output.blob.size > 80 * 1024 * 1024 ||
        !/^video\/(mp4|webm)/.test(output.mime || "") ||
        typeof output.id !== "string"
      )
        return;
      try {
        const freshStore = new Store("money"),
          target = await freshStore.get("projects", sourceId);
        if (!target || target.archived) return;
        if (!target.outputs.some((o) => o.sourceOutputId === output.id)) {
          const asset = await addAsset(
            new File(
              [output.blob],
              String(output.name || "BlueFruit.mp4").slice(0, 200),
              { type: output.mime },
            ),
            freshStore,
            80,
          );
          target.outputs.push({
            id: uid(),
            name: asset.name,
            assetId: asset.id,
            url: "",
            sourceOutputId: output.id,
            created: new Date().toISOString(),
            archived: false,
          });
          target.updated = new Date().toISOString();
          if (["ready", "delivered"].includes(target.phase))
            target.phase = "active";
          await freshStore.put("projects", target);
          await store.put("projects", target);
          if (project?.id === sourceId) {
            project = target;
            render();
          }
        }
        child.postMessage(
          { type: "MONEY_RESULT_SAVED", nonce, outputId: output.id },
          origin,
        );
        notify(
          tr(
            "蓝果成片已保存在原交付项目中。",
            "The BlueFruit film is saved in the original delivery project.",
          ),
        );
      } catch {
        notify(
          tr(
            "成片未能保存，请在蓝果备份后重试。",
            "Could not save the film. Back up in BlueFruit and try again.",
          ),
        );
      }
    }
  };
  window.addEventListener("message", listener);
  child = window.open(origin + link("/create.html?handoff=" + nonce), "_blank");
  if (!child) {
    window.removeEventListener("message", listener);
    notify(
      tr(
        "浏览器拦截了新标签页，请允许打开蓝果。",
        "The browser blocked the new tab. Allow BlueFruit to open.",
      ),
    );
  }
  setTimeout(() => {
    if (!ready) window.removeEventListener("message", listener);
  }, 45000);
}
async function returnResult() {
  if (!bridge || !window.opener || window.opener.closed) {
    notify(
      tr(
        "原交付页已关闭。请先备份项目，再在交付工作台导入。",
        "The delivery page is closed. Back up the project, then import it in the delivery workspace.",
      ),
    );
    return;
  }
  const o = project.outputs
      .filter((o) => !o.archived && o.assetId && /\.(mp4|webm)$/i.test(o.name))
      .at(-1),
    a = o && (await store.get("assets", o.assetId));
  if (!a) throw Error("media");
  window.opener.postMessage(
    {
      type: "BLUEFRUIT_RESULT",
      nonce: bridge.nonce,
      sourceProjectId: project.sourceProjectId,
      output: { id: o.id, name: o.name, mime: a.mime, blob: a.blob },
    },
    bridge.origin,
  );
  notify(
    tr("正在把成片交回原项目…", "Returning the film to the original project…"),
  );
}

document.addEventListener("click", async (e) => {
  if (working && e.target.closest("a")) {
    e.preventDefault();
    notify(
      tr(
        "制作中，请等待完成或先停止。",
        "Work is in progress. Wait for completion or stop first.",
      ),
    );
    return;
  }
  const b = e.target.closest("button");
  if (!b) return;
  try {
    if (b.dataset.step !== undefined && project) {
      changeStep(Number(b.dataset.step));
      return;
    }
    if (b.dataset.ratio) {
      ratio = b.dataset.ratio;
      render();
      return;
    }
    if (b.dataset.style) {
      style = b.dataset.style;
      styleChanged = true;
      render();
      return;
    }
    if (b.dataset.template) {
      if (working) return;
      const previousDefault = tasks()[chosen]?.goal,
        custom = idea && idea !== previousDefault ? idea : "";
      chosen = b.dataset.template;
      recipe = null;
      idea = custom || tasks()[chosen].goal;
      project = null;
      setBusy(true);
      try {
        await makeProject(false);
      } finally {
        setBusy(false);
      }
      return;
    }
    const a = b.dataset.action;
    if (!a || (working && a !== "cancel-render")) return;
    switch (a) {
      case "next":
        if (!step) {
          setBusy(true);
          try {
            await makeProject(false);
          } finally {
            setBusy(false);
          }
        } else changeStep(step + 1);
        break;
      case "back":
        changeStep(step - 1);
        break;
      case "demo":
        setBusy(true);
        try {
          await makeProject(true);
        } finally {
          setBusy(false);
        }
        break;
      case "new":
        project = null;
        idea = "";
        outputDraft = { name: null, url: "" };
        step = 0;
        const u = new URL(location.href);
        u.searchParams.delete("project");
        u.searchParams.delete("step");
        history.replaceState(null, "", u);
        render();
        break;
      case "add-shot":
        if (project.shots.filter((s) => !s.archived).length < 6) {
          project.shots.push({
            id: uid(),
            title: tr("新镜头", "New shot"),
            description: "",
            narration: "",
            duration: 3,
            assetId: "",
            assetHistory: [],
            characterId: "",
            archived: false,
          });
          await save();
          render();
        }
        break;
      case "remove-shot":
        project.shots.find((s) => s.id === b.dataset.id).archived = true;
        await save();
        render();
        break;
      case "upload-shot":
        pick(
          { type: "shot", id: b.dataset.id },
          "image/png,image/jpeg,image/webp,video/mp4,video/webm",
        );
        break;
      case "upload-audio":
        pick(
          { type: "audio" },
          "audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg",
        );
        break;
      case "remove-audio":
        project.audioAssetId = "";
        await save();
        render();
        break;
      case "upload-output":
        pick(
          { type: "output" },
          "image/png,image/jpeg,image/webp,video/mp4,video/webm,application/pdf,text/plain,application/json",
        );
        break;
      case "render":
        await exportFilm();
        break;
      case "cancel-render":
        abort?.abort();
        break;
      case "download-video": {
        const o = project.outputs.find((o) => o.id === b.dataset.id),
          asset = await store.get("assets", o.assetId);
        if (!asset) throw Error("media");
        download(asset.blob, asset.name);
        break;
      }
      case "return-result":
        await returnResult();
        break;
      case "srt":
        download(
          new Blob([srt(project)], { type: "text/plain" }),
          project.title + ".srt",
        );
        break;
      case "backup":
        download(
          await backup(structuredClone(project), store),
          project.title + "-project.zip",
        );
        break;
      case "ai-plan":
        await generatePlan();
        break;
      case "owner-connect":
        $("#owner-file").click();
        break;
      case "account":
        await accountDialog();
        break;
      case "cloud-save":
        if (!(await cloudSession())) {
          await accountDialog();
          break;
        }
        setBusy(true);
        b.textContent = tr("正在保存…", "Saving…");
        try {
          await saveCloud(project, store);
          let status = document.querySelector("#cloud-save-status");
          if (!status) {
            status = document.createElement("p");
            status.id = "cloud-save-status";
            status.className = "wizard-help";
            status.setAttribute("role", "status");
            b.parentElement.after(status);
          }
          status.textContent = tr("上次云端保存：", "Last cloud save: ") + new Date().toLocaleTimeString(lang === "en" ? "en-US" : "zh-CN");
          notify(tr("已保存到账号", "Saved to account"));
        } finally {
          b.textContent = tr("保存到账号", "Save to account");
          setBusy(false);
        }
        break;
      case "cloud-projects":
        await showCloudProjects(async (row) => {
          restoring = true;
          project = await loadCloud(row, store, kind);
          await save(project, { keepPhase: true });
          step = 1;
          route();
          render();
          restoring = false;
        });
        break;
      case "submit":
        await submitFilm(project, store);
        break;
      case "blue-handoff":
        handoff();
        break;
      case "complete":
        if (readiness(project).length) {
          notify(
            tr(
              "请完成所有任务与验收标准，并添加一份成果。",
              "Complete the tasks and acceptance criteria, and add a deliverable.",
            ),
          );
          return;
        }
        project.phase = "delivered";
        await store.put("projects", project);
        notify(tr("已记录为交付完成", "Marked as delivered"));
        break;
    }
  } catch (err) {
    setBusy(false);
    fail(err);
  }
});
document.addEventListener("input", (e) => {
  const el = e.target;
  if (el.form?.id === "output-link-form") {
    outputDraft[el.name] = el.value;
    return;
  }
  if (el.id === "idea") {
    idea = el.value;
    return;
  }
  if (!project && el.dataset.project === "goal") {
    idea = el.value;
    return;
  }
  if (!project) return;
  if (el.dataset.project) {
    project[el.dataset.project] = el.value;
    save().catch(() => {});
  }
  if (el.dataset.shot) {
    const s = project.shots.find((s) => s.id === el.dataset.id);
    s[el.dataset.shot] =
      el.dataset.shot === "duration"
        ? Math.max(0.5, Math.min(30, Number(el.value) || 3))
        : el.value;
    save().catch(() => {});
  }
  if (el.dataset.task) {
    project.tasks.find((t) => t.id === el.dataset.id)[el.dataset.task] =
      el.value;
    save().catch(() => {});
  }
});
document.addEventListener("change", async (e) => {
  const el = e.target;
  try {
    if (el.id === "owner-file" && el.files[0]) {
      await importOwner(el.files[0]);
      return;
    }
    if (el.id === "creator-upload") {
      const f = el.files[0],
        context = uploadTarget;
      el.value = "";
      if (!f || !context || context.projectId !== project?.id) return;
      const allowed =
        context.type === "audio"
          ? /^audio\/(mpeg|wav|x-wav|mp4|x-m4a|aac|ogg)$/
          : context.type === "shot"
            ? /^(image\/(png|jpeg|webp)|video\/(mp4|webm))$/
            : /^(image\/(png|jpeg|webp)|video\/(mp4|webm)|application\/(pdf|json)|text\/plain)$/;
      if (!allowed.test(f.type)) throw Error("media");
      const p = project,
        a = await addAsset(f, store);
      if (context.type === "shot") {
        const s = p.shots.find((s) => s.id === context.id);
        s.assetId = a.id;
        s.assetHistory.push(a.id);
      } else if (context.type === "audio") {
        p.audioAssetId = a.id;
        p.audioHistory.push(a.id);
      } else
        p.outputs.push({
          id: uid(),
          name: f.name,
          assetId: a.id,
          url: "",
          created: new Date().toISOString(),
          archived: false,
        });
      await save(p);
      render();
      return;
    }
    if (el.dataset.shot === "duration")
      el.value = project.shots.find((s) => s.id === el.dataset.id).duration;
    if (el.dataset.taskDone) {
      project.tasks.find((t) => t.id === el.dataset.taskDone).status =
        el.checked ? "done" : "todo";
      await save();
    }
    if (el.dataset.check) {
      project.checks.find((c) => c.id === el.dataset.check).done = el.checked;
      await save();
    }
  } catch (err) {
    fail(err);
  }
});
document.addEventListener("submit", async (e) => {
  if (e.target.id !== "output-link-form") return;
  e.preventDefault();
  const d = new FormData(e.target),
    url = safeURL(d.get("url"));
  if (!url) {
    notify(tr("请使用 HTTPS 成果链接。", "Use an HTTPS link."));
    return;
  }
  project.outputs.push({
    id: uid(),
    name: String(d.get("name")).slice(0, 200),
    url,
    assetId: "",
    created: new Date().toISOString(),
    archived: false,
  });
  outputDraft = { name: null, url: "" };
  await save();
  render();
});
window.addEventListener("platform-language", render);
window.addEventListener("message", (e) => {
  if (
    bridge &&
    e.origin === bridge.origin &&
    e.source === window.opener &&
    e.data?.nonce === bridge.nonce &&
    e.data?.type === "MONEY_RESULT_SAVED"
  )
    notify(
      tr(
        "成片已交回原项目，可以返回 AI for Money 继续验收。",
        "The film is saved in the original project. Return to AI for Money for review.",
      ),
    );
});
async function init() {
  await store.ready;
  if (query.get("project"))
    project = await store.get("projects", query.get("project"));
  if (project && (project.kind !== kind || project.archived)) {
    project = null;
    notify(
      tr(
        "请在完整编辑器中恢复已归档项目后继续。",
        "Restore archived projects in the full editor before continuing.",
      ),
    );
  }
  if (project) {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("bluefruit-handoff-" + project.id) || "null",
      );
      if (saved && window.opener)
        bridge = {
          nonce: saved.nonce,
          origin:
            location.hostname === "127.0.0.1"
              ? "http://127.0.0.1:4192"
              : "https://ai-for-money.psyverse.fun",
        };
    } catch {}
    idea = project.goal;
    ratio = project.ratio;
    chosen = project.templateId || "tool";
    step = query.has("step")
      ? Math.max(0, Math.min(3, Number(query.get("step")) || 0))
      : 1;
  }
  if (query.get("story") && blue) {
    const r = await fetch(lang === "en" ? "/catalog-en.json" : "/catalog.json"),
      d = await r.json(),
      s = d.stories.find((s) => s.id === query.get("story"));
    if (s) idea = s.t + "。" + s.syn;
  }
  if (query.get("recipe") && !blue) {
    const r = await fetch(lang === "en" ? "/recipes-en.json" : "/recipes.json"),
      d = await r.json();
    recipe = d.find((t) => t.id === query.get("recipe"));
    if (recipe) {
      idea = recipe.description;
      chosen =
        recipe.id === "languo-short-drama"
          ? "short"
          : recipe.category === "tech"
            ? "tool"
            : "research";
    }
  }
  if (!blue && !project && !recipe && !idea) idea = tasks()[chosen].goal;
  render();
  if (blue && query.get("demo") === "1" && !project) {
    setBusy(true);
    try {
      await makeProject(true);
    } finally {
      setBusy(false);
    }
  }
  fetch("/api/generate", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => (provider = d))
    .catch(() => {});
  if (query.get("cloud") === "1")
    showCloudProjects(async (row) => {
      project = await loadCloud(row, store, kind);
      if (project) {
        await save(project, { keepPhase: true });
        step = 1;
        route();
        render();
      }
    }).catch(fail);
  if (query.has("handoff") && blue && window.opener) {
    const nonce = query.get("handoff"),
      allowed =
        location.hostname === "127.0.0.1"
          ? "http://127.0.0.1:4192"
          : "https://ai-for-money.psyverse.fun";
    const listener = async (e) => {
      if (
        e.origin !== allowed ||
        e.source !== window.opener ||
        e.data?.nonce !== nonce ||
        e.data?.type !== "BLUEFRUIT_BRIEF"
      )
        return;
      window.removeEventListener("message", listener);
      const b = e.data.brief;
      if (typeof b?.goal !== "string") return;
      project = createProject("blue", String(b.title || "").slice(0, 200));
      project.goal = b.goal.slice(0, 10000);
      project.scope = String(b.scope || "").slice(0, 10000);
      project.sourceProjectId = String(b.sourceProjectId || "").slice(0, 100);
      bridge = { nonce, origin: allowed };
      sessionStorage.setItem(
        "bluefruit-handoff-" + project.id,
        JSON.stringify({ nonce }),
      );
      project.shots = demoShots().map((s) => ({
        id: uid(),
        title: s.title,
        description: "",
        narration: "",
        duration: 3,
        assetId: "",
        assetHistory: [],
        characterId: "",
        archived: false,
      }));
      project.checks = (Array.isArray(b.checks) ? b.checks : [])
        .slice(0, 40)
        .map((title) => ({
          id: uid(),
          title: String(title).slice(0, 500),
          done: false,
          archived: false,
        }));
      idea = project.goal;
      try {
        await save();
        step = 1;
        route();
        render();
        window.opener.postMessage(
          { type: "BLUEFRUIT_BRIEF_SAVED", nonce },
          allowed,
        );
      } catch (err) {
        step = 1;
        render();
        fail(err);
      }
    };
    window.addEventListener("message", listener);
    window.opener.postMessage({ type: "BLUEFRUIT_READY", nonce }, allowed);
  }
}
init().catch(fail);
