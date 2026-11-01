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
let catalog,
  genre = "all",
  expanded = false;
const genres = {
  xh: ["玄幻", "Fantasy"],
  sf: ["科幻", "Sci-fi"],
  gz: ["怪谈", "Strange tales"],
  wx: ["无限流", "Time loops"],
};
const artwork = {
  xh: "story-xh.jpg",
  sf: "story-sf.jpg",
  gz: "story-gz.jpg",
  wx: "hero-concept.jpg",
};
async function load() {
  try {
    const r = await fetch(lang === "en" ? "/catalog-en.json" : "/catalog.json");
    if (!r.ok) throw Error();
    catalog = await r.json();
    render();
  } catch {
    document.querySelector("#page").innerHTML =
      header() +
      `<main id="main" class="platform-section"><h1>${tr("作品资料暂时无法加载", "Could not load the catalogue")}</h1><p>${tr("请刷新重试，或打开原有播放器。", "Reload to try again, or open the original player.")}</p><a class="button" href="${link("/production.html#cinema")}">${tr("打开播放器", "Open player")}</a></main>`;
  }
}
function episodeLink(n = 1) {
  return link("/watch.html?episode=" + n);
}
function render() {
  const saved = readLibrary(),
    history = saved.last;
  const list = catalog.stories.filter((s) => genre === "all" || s.g === genre),
    featured = [
      catalog.stories.find((s) => s.id === "story-1"),
      catalog.stories.find((s) => s.id === "story-5"),
      catalog.stories.find((s) => s.id === "story-8"),
    ].filter(Boolean);
  document.title = tr(
    "蓝果短剧 · 看见另一个世界",
    "BlueFruit · See another world",
  );
  document.querySelector("#page").innerHTML =
    header() +
    `<main id="main"><section class="screening-hero"><img src="/assets/hero-concept.jpg" alt="" width="1672" height="941" fetchpriority="high"><div><h1>${tr("去看见，另一个世界。", "See another world.")}</h1><p>${tr("原创科幻与幻想叙事。", "Original science fiction and fantasy.")}</p><div class="actions"><a class="button primary" href="${history ? episodeLink(history.episode) : link("/watch.html?film=demo")}">${icon("play")}${tr(history ? "继续观看" : "观看样片", history ? "Continue watching" : "Watch samples")}</a><a class="button" href="${link("/create.html")}">${tr("开始创作", "Start creating")}</a></div></div><span class="art-note">${tr("背景为概念视觉", "Concept artwork")}</span></section><section class="platform-section" id="screenings">${history ? `<div class="continue-row"><div><strong>${tr("接着上次看", "Pick up where you left off")}</strong><p>${esc(catalog.episodes.find((e) => e.n === history.episode)?.title || "")} · ${Math.floor((history.time || 0) / 60)}:${String(Math.floor((history.time || 0) % 60)).padStart(2, "0")}</p></div><a class="button" href="${episodeLink(history.episode)}">${tr("继续播放", "Continue")}${icon("arrow")}</a></div>` : ""}<div class="section-heading"><div><h2>${tr("万劫不灭道", "The Undying Path")}</h2><p>${tr("六集工程样片 · 免费预览", "Six engineering samples · Free to watch")}</p></div><div class="actions"><button class="button" id="save-series" aria-pressed="${!!saved.following}">${icon(saved.following ? "check" : "bookmark")}${tr(saved.following ? "已加入追剧" : "加入追剧", saved.following ? "Following" : "Follow series")}</button><a class="button" href="#watchlist">${tr("我的看单", "My watchlist")}</a></div></div><div class="episode-rail">${catalog.episodes.map((e) => `<a class="episode-tile" href="${episodeLink(e.n)}"><div class="episode-frame"><img src="/assets/episode-${e.n}.jpg" width="300" height="534" alt="${tr("第", "Episode ")}${e.n}${tr("集样片截图", " sample frame")}" loading="lazy"><span class="play-hint">${icon("play")}</span></div><div class="episode-title"><b>${String(e.n).padStart(2, "0")}</b><span>${esc(e.title.replace(lang === "en" ? /^Episode\s*\d+\s*·\s*/ : /^第\s*\d+\s*集\s*·\s*/, ""))}</span></div><p class="episode-duration">${e.duration}${tr(" 秒", " seconds")} · ${esc(e.resolution)}</p></a>`).join("")}</div><p class="small muted" style="margin-top:15px">${tr("样片展示分镜、文字与旁白流程；故事设定与可播放内容分别展示。", "These samples demonstrate storyboards, text and narration. Story concepts are listed separately from playable work.")}</p></section><section class="platform-section" id="stories"><div class="section-heading"><div><h2>${tr("从一个故事开始", "Every world starts with a story")}</h2><p>${tr("正在开发的故事设定。你也可以从这里开始创作。", "Story concepts in development. Make one your starting point.")}</p></div><a class="text-button" href="${link("/create.html")}">${tr("打开创作台", "Open studio")} ${icon("arrow")}</a></div><div class="concept-rail">${featured.map((s) => `<a class="concept-tile" href="${link("/create.html?story=" + s.id)}"><img src="/assets/${artwork[s.g]}" alt="" width="1000" height="560" loading="lazy"><h3>${esc(s.t)}</h3><p>${tr("故事设定，尚无成片", "Story concept · No completed film yet")}</p></a>`).join("")}</div><div class="concept-filters" role="group" aria-label="${tr("故事类型", "Story genre")}">${Object.entries(
      { all: [tr("全部设定", "All concepts")], ...genres },
    )
      .map(
        ([g, n]) =>
          `<button data-genre="${g}" aria-pressed="${g === genre}">${g === "all" ? n[0] : tr(...n)}</button>`,
      )
      .join("")}</div><div class="concept-list">${list
      .slice(0, expanded ? 12 : 6)
      .map(
        (s) =>
          `<a href="${link("/create.html?story=" + s.id)}"><span>${esc(s.t)}</span><small>${tr(...genres[s.g])}</small></a>`,
      )
      .join(
        "",
      )}</div>${list.length > 6 ? `<button class="text-button" id="expand-concepts" aria-expanded="${expanded}">${tr(expanded ? "收起" : "查看全部十二个设定", expanded ? "Show fewer" : "See all twelve concepts")}</button>` : ""}</section><section class="platform-section" id="watchlist" ${saved.following || saved.demoSaved ? "" : "hidden"}><div class="section-heading"><div><h2>${tr("我的看单", "My watchlist")}</h2><p>${tr("追剧和进度保存在当前浏览器。", "Following and progress are saved in this browser.")}</p></div></div>${saved.demoSaved ? `<a class="continue-row" href="${link("/watch.html?film=demo")}"><div><strong>${tr("星际启程", "Beyond the horizon")}</strong><p>${tr("6 秒创作示例", "Six-second creation example")}</p></div>${icon("play")}</a>` : ""}${saved.following ? `<a class="continue-row" href="${episodeLink(history?.episode || 1)}"><div><strong>${tr("万劫不灭道", "The Undying Path")}</strong><p>${tr("六集工程样片", "Six engineering samples")}</p></div>${icon("play")}</a>` : ""}</section><section class="platform-section" id="community-work" hidden></section></main><footer class="platform-footer"><span>${tr("蓝果短剧 · 观看、创作，让故事继续。", "BlueFruit · Watch, create, keep the story going.")}</span><div><a href="${link("/production.html#commercial")}">${tr("制作咨询", "Production enquiries")}</a><a href="${link("/production.html#pipeline")}">${tr("制作资料", "Production resources")}</a><a href="https://psyverse.fun/">Psyverse</a></div></footer>`;
  document.querySelector("#save-series").onclick = () => {
    writeLibrary({ following: !readLibrary().following });
    render();
    notify(
      tr(
        readLibrary().following ? "已加入追剧" : "已取消追剧",
        readLibrary().following
          ? "Added to your watchlist"
          : "Removed from your watchlist",
      ),
    );
  };
  document.querySelector('[href="#watchlist"]').onclick = (e) => {
    if (!readLibrary().following && !readLibrary().demoSaved) {
      e.preventDefault();
      notify(
        tr(
          "看单还是空的，点击“加入追剧”收藏这部作品。",
          "Your watchlist is empty. Follow this series to save it.",
        ),
      );
    }
  };
  document.querySelector("#expand-concepts")?.addEventListener("click", () => {
    expanded = !expanded;
    render();
    document.querySelector("#stories").scrollIntoView({ block: "start" });
  });
  document.querySelectorAll("[data-genre]").forEach(
    (b) =>
      (b.onclick = () => {
        genre = b.dataset.genre;
        render();
        document.querySelector("#stories").scrollIntoView({ block: "start" });
      }),
  );
  loadCommunity();
}
async function loadCommunity() {
  try {
    const r = await fetch("/api/platform?action=publications"),
      d = await r.json();
    const el = document.querySelector("#community-work");
    if (!r.ok || !Array.isArray(d.items) || !d.items.length || !el) return;
    const safe = d.items.filter((x) => /^https:\/\//.test(x.video_url));
    el.hidden = false;
    el.innerHTML = `<div class="section-heading"><div><h2>${tr("创作者作品", "From the community")}</h2></div></div><div class="publication-grid">${safe.map((x) => `<article><video controls playsinline preload="none" src="${esc(x.video_url)}" aria-label="${esc(x.title)}"></video><h3>${esc(x.title)}</h3><p>${esc(x.creator_name)}</p></article>`).join("")}</div>`;
  } catch {}
}
window.addEventListener("platform-language", load);
load();
