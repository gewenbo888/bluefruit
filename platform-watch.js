import {
  esc,
  tr,
  lang,
  link,
  icon,
  header,
  notify,
  readLibrary,
  writeLibrary,
} from "./platform-common.js";
const filmDemo = new URLSearchParams(location.search).get("film") === "demo";
let catalog,
  episode = Math.max(
    1,
    Math.min(
      6,
      Number(new URLSearchParams(location.search).get("episode")) || 1,
    ),
  ),
  player,
  lastSave = 0,
  autoNext = true;
function persist() {
  if (!player || !Number.isFinite(player.currentTime)) return;
  writeLibrary({
    [filmDemo ? "demoLast" : "last"]: {
      episode,
      time: player.currentTime,
      at: Date.now(),
      completed: player.ended,
    },
  });
}
async function load() {
  persist();
  try {
    const r = await fetch(lang === "en" ? "/catalog-en.json" : "/catalog.json");
    if (!r.ok) throw Error();
    catalog = await r.json();
    if (filmDemo) episode = 1;
    if (filmDemo)
      catalog = {
        episodes: [
          {
            n: 1,
            title: tr(
              "6 秒创作示例 · 星际启程",
              "Six-second creation example · Beyond the horizon",
            ),
            src: "assets/creator-demo.mp4",
            duration: 6,
            resolution: "1280 × 720",
            transcript: tr(
              "让想象进入画面。\n把故事，做成看得见的世界。\n蓝果短剧 · 开始创作",
              "Bring imagination into the frame.\nTurn a story into a world we can see.\nBlueFruit · Start creating",
            ),
          },
        ],
      };
    render();
  } catch {
    document.querySelector("#page").innerHTML =
      header() +
      `<main id="main" class="platform-section"><h1>${tr("播放器资料无法加载", "Could not load player details")}</h1><a class="button" href="${link("/production.html#cinema")}">${tr("打开原有播放器", "Open original player")}</a></main>`;
  }
}
function render() {
  const item = catalog.episodes.find((e) => e.n === episode);
  document.title =
    (filmDemo
      ? tr("星际启程", "Beyond the horizon")
      : tr("万劫不灭道", "The Undying Path")) +
    " · " +
    item.title;
  document.querySelector("#page").innerHTML =
    header() +
    `<main id="main" class="watch-main"><a class="watch-back" href="${link("/")}">${icon("back")}${tr("返回看短剧", "Back to watch")}</a><div class="watch-layout"><section><div class="watch-stage"><video id="watch-player" controls playsinline preload="metadata" poster="/assets/${filmDemo ? "hero-concept.jpg" : "episode-" + episode + ".jpg"}" src="/${esc(item.src)}" aria-label="${esc(item.title)}"></video></div><div class="watch-meta"><div><h1>${filmDemo ? tr("星际启程", "Beyond the horizon") : tr("万劫不灭道", "The Undying Path")}</h1><p>${esc(item.title)}</p><p id="video-detail">${esc(item.resolution)} · ${item.duration}${tr(" 秒", " seconds")} · ${tr(filmDemo ? "创作示例" : "工程样片", filmDemo ? "Creation example" : "Engineering sample")}</p></div><button class="button" id="follow" aria-pressed="${!!readLibrary()[filmDemo ? "demoSaved" : "following"]}">${icon(readLibrary()[filmDemo ? "demoSaved" : "following"] ? "check" : "bookmark")}${tr(readLibrary()[filmDemo ? "demoSaved" : "following"] ? "已收藏" : filmDemo ? "收藏示例" : "加入追剧", readLibrary()[filmDemo ? "demoSaved" : "following"] ? "Saved" : filmDemo ? "Save example" : "Follow")}</button></div><p id="playback-status" class="small muted" role="status"></p><details class="watch-notes"><summary>${tr("文稿与样片说明", "Transcript and sample notes")}</summary><p>${filmDemo ? tr("这是一条由三张概念画面、字幕和原创氛围音轨制作的创作示例，不是完整短剧。你可以在创作台替换画面和文字，制作自己的版本。", "A creation example made from three concept images, captions and an original ambient soundtrack. It is not a complete drama. Replace the visuals and captions in the studio to make your own version.") : tr("这些工程样片展示分镜、文字和旁白流程。旧音轨提及的收费或上线安排已过时，六集均可免费预览。音轨为中文，英文界面提供英文文稿。", "These engineering samples demonstrate storyboards, text and narration. Old audio references to paid access or launch plans are out of date. All six samples are free. Audio is Chinese; English transcripts are available.")}</p><p>${esc(item.transcript)}</p></details></section><aside class="watch-side"><h2>${tr(filmDemo ? "做一个自己的版本" : "选集", filmDemo ? "Make your own version" : "Episodes")}</h2><p>${tr(filmDemo ? "6 秒创作示例 · 画面、字幕与音轨" : "共六集 · 点击即可观看", filmDemo ? "Six-second example · Visuals, captions & narration" : "Six episodes · Select to watch")}</p><div class="episode-list">${catalog.episodes.map((e) => `<button data-episode="${e.n}" aria-current="${episode === e.n}"><span>${String(e.n).padStart(2, "0")}</span>${esc(e.title.replace(lang === "en" ? /^Episode\s*\d+\s*·\s*/ : /^第\s*\d+\s*集\s*·\s*/, ""))}</button>`).join("")}</div><div class="playback-options" ${filmDemo ? "hidden" : ""}><label><input id="auto-next" type="checkbox" ${autoNext ? "checked" : ""}>${tr("自动播放下一集", "Play next automatically")}</label>${!filmDemo && episode < 6 ? `<button class="text-button" id="next">${tr("下一集", "Next")}${icon("arrow")}</button>` : ""}</div><p class="small muted" style="margin-top:25px">${tr("观看进度自动保存在当前浏览器。", "Your progress is saved in this browser.")}</p><a class="button" style="margin-top:18px" href="${link(filmDemo ? "/create.html?demo=1" : "/create.html")}">${tr(filmDemo ? "使用这个示例" : "我也想创作", filmDemo ? "Use this example" : "Create your own story")}${icon("arrow")}</a></aside></div></main>`;
  player = document.querySelector("#watch-player");
  const saved = readLibrary()[filmDemo ? "demoLast" : "last"];
  player.addEventListener("loadedmetadata", () => {
    if (
      saved?.episode === episode &&
      !saved.completed &&
      saved.time > 0 &&
      saved.time < player.duration - 2
    )
      player.currentTime = saved.time;
    document.querySelector("#video-detail").textContent =
      `${player.videoWidth} × ${player.videoHeight} · ${Math.round(player.duration)}${tr(" 秒", " seconds")} · ${tr(filmDemo ? "创作示例" : "工程样片", filmDemo ? "Creation example" : "Engineering sample")}`;
  });
  player.addEventListener("timeupdate", () => {
    if (Date.now() - lastSave > 5000) {
      persist();
      lastSave = Date.now();
    }
  });
  player.addEventListener("pause", persist);
  player.addEventListener("ended", () => {
    persist();
    if (autoNext && !filmDemo && episode < 6) select(episode + 1, true);
    else
      document.querySelector("#playback-status").textContent = tr(
        "本集播放完毕。",
        "Episode finished.",
      );
  });
  player.addEventListener("error", () => {
    document.querySelector("#playback-status").innerHTML =
      `${tr("视频未能加载，请重试。", "Video could not load. Try again.")} <button class="text-button" id="retry-video">${tr("重试", "Retry")}</button>`;
    document.querySelector("#retry-video").onclick = () => player.load();
  });
  document
    .querySelectorAll("[data-episode]")
    .forEach(
      (b) => (b.onclick = () => select(Number(b.dataset.episode), true)),
    );
  document
    .querySelector("#next")
    ?.addEventListener("click", () => select(episode + 1, true));
  document.querySelector("#auto-next").onchange = (e) =>
    (autoNext = e.target.checked);
  document.querySelector("#follow").onclick = () => {
    writeLibrary({
      [filmDemo ? "demoSaved" : "following"]:
        !readLibrary()[filmDemo ? "demoSaved" : "following"],
    });
    const b = document.querySelector("#follow");
    b.setAttribute(
      "aria-pressed",
      !!readLibrary()[filmDemo ? "demoSaved" : "following"],
    );
    b.innerHTML =
      icon(
        readLibrary()[filmDemo ? "demoSaved" : "following"]
          ? "check"
          : "bookmark",
      ) +
      tr(
        readLibrary()[filmDemo ? "demoSaved" : "following"]
          ? "已收藏"
          : filmDemo
            ? "收藏示例"
            : "加入追剧",
        readLibrary()[filmDemo ? "demoSaved" : "following"]
          ? "Saved"
          : filmDemo
            ? "Save example"
            : "Follow",
      );
  };
}
function select(n, play = false) {
  persist();
  player.pause();
  episode = n;
  const u = new URL(location.href);
  u.searchParams.set("episode", n);
  history.replaceState(null, "", u);
  render();
  if (play)
    player
      .play()
      .catch(() =>
        notify(tr("点击播放器开始观看。", "Press play to start watching.")),
      );
}
window.addEventListener("pagehide", persist);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) persist();
});
window.addEventListener("platform-language", load);
load();
