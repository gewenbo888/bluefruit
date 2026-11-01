const fs = require("node:fs"),
  path = require("node:path");
const files = [
  "index.html",
  "works.html",
  "platform-works.js",
  "studio.html",
  "projects.html",
  "production.html",
  "watch.html",
  "create.html",
  "start.html",
  "account.html",
  "review.html",
  "i18n.js",
  "studio.js",
  "studio.css",
  "workbench.js",
  "workbench.css",
  "catalog.json",
  "catalog-en.json",
  "prompts.json",
  "recipes.json",
  "recipes-en.json",
  "og.png",
  "workspace.js",
  "workspace-core.js",
  "workspace-render.js",
  "workspace-container.js",
  "workspace.css",
  "creator.js",
  "platform.css",
  "platform-common.js",
  "platform-cloud.js",
  "platform-home.js",
  "platform-watch.js",
  "platform-account-page.js",
  "platform-review.js",
];
fs.rmSync("public", { recursive: true, force: true });
fs.mkdirSync("public");
for (const f of files)
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join("public", f));
for (const d of ["assets", "output"])
  if (fs.existsSync(d)) {
    fs.mkdirSync(path.join("public", d));
    for (const f of fs.readdirSync(d))
      if (/\.(jpg|jpeg|png|webp|svg|mp3|mp4)$/i.test(f))
        fs.copyFileSync(path.join(d, f), path.join("public", d, f));
  }
