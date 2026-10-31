/* Native, free sample screening. No client-side payment or access claims. */
(() => {
 'use strict';
 const T = text => window.SiteLanguage.t(text);
 const $ = selector => document.querySelector(selector);
 const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const player = $('#main-video-player');
 const dialog = $('#story-dialog');
 let catalog, prompts, episode = 1, genre = 'all', expanded = false, brief = '', toastTimer;
 function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500); }
 async function copy(text) { try { await navigator.clipboard.writeText(text); toast('已复制'); } catch { toast('浏览器限制复制，请手动选择文本或下载简报。'); } }
 function download(text, filename) { const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
 function selectEpisode(n, play = false) {
  const item = catalog.episodes.find(e => e.n === n); if (!item) return;
  episode = n;
  if (player.getAttribute('src') !== '/' + item.src) { player.pause(); player.src = '/' + item.src; player.load(); }
  document.querySelectorAll('[data-episode]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.episode) === n)));
  $('#player-status').textContent = item.title;
  $('#video-meta').textContent = `${item.resolution} · ${item.fps}fps`;
  $('#transcript-text').textContent = item.transcript;
  if (play) player.play().catch(() => toast('请点击播放器中的播放按钮。'));
 }
 player.addEventListener('loadedmetadata', () => {
  const item = catalog?.episodes.find(e => e.n === episode);
  if (item) $('#video-meta').textContent = `${player.videoWidth} × ${player.videoHeight} · ${Math.round(player.duration)} 秒`;
 });
 player.addEventListener('error', () => { $('#player-status').textContent = '这集暂时无法加载，请重试或选择其他集。'; });
 document.querySelector('.episodes').addEventListener('click', e => { const b = e.target.closest('[data-episode]'); if (b && catalog) selectEpisode(Number(b.dataset.episode), true); });
 $('#hero-play').addEventListener('click', () => { if (catalog) selectEpisode(episode, true); });
 const genres = {xh:'玄幻',sf:'科幻',gz:'怪谈',wx:'无限流'};
 function poster(item) {
  const image = {xh:'story-xh.jpg',sf:'story-sf.jpg',gz:'story-gz.jpg',wx:'hero-concept.jpg'}[item.g];
  return `<img src="/assets/${image}" alt="" loading="lazy" width="1000" height="560">`;
 }
 function renderStories() {
  const filtered = catalog.stories.filter(s => genre === 'all' || s.g === genre);
  const shown = expanded ? filtered : (genre === 'all' ? [filtered[0], filtered.find(s=>s.g==='sf'), filtered.find(s=>s.g==='gz')].filter(Boolean) : filtered.slice(0,3));
  $('#story-grid').innerHTML = shown.map((s,i) => `<button type="button" class="story" data-story="${s.id}"><div class="story-art">${poster(s,i)}<span>概念开发</span></div><div class="story-type">${genres[s.g]} · 故事设定</div><h3>${escape(s.t)}</h3><p>${escape(s.h)}</p><span class="story-open">阅读设定 <span aria-hidden="true">↗</span></span></button>`).join('');
  $('#story-count').textContent = `展示 ${shown.length} / ${filtered.length} 个设定`;
  $('#show-all').textContent = expanded ? '收起设定 ↑' : '查看全部设定 →';
  $('#show-all').setAttribute('aria-expanded', String(expanded));
 }
 $('#show-all').addEventListener('click', () => { if (!catalog) return; expanded = !expanded; renderStories(); });
 document.querySelector('.filters').addEventListener('click', e => { const b = e.target.closest('[data-genre]'); if (!b || !catalog) return; genre = b.dataset.genre; expanded = true; document.querySelectorAll('[data-genre]').forEach(x => x.setAttribute('aria-pressed', String(x===b))); renderStories(); });
 $('#story-grid').addEventListener('click', e => {
  const b = e.target.closest('[data-story]'); const item = catalog?.stories.find(s => s.id === b?.dataset.story); if (!item) return;
  $('#story-detail').innerHTML = `<p class="muted small">${genres[item.g]} · 概念开发</p><h2 id="story-title">${escape(item.t)}</h2><p class="story-hook">${escape(item.h)}</p><p>${escape(item.syn)}</p><p class="muted small">此条目是故事设定，尚无对应成片。现有视频请观看首页工程样片。</p><a class="button primary" href="#commercial" id="discuss-story">讨论这个方向 →</a>`;
  dialog.showModal();
  $('#discuss-story').addEventListener('click', () => { dialog.close(); $('#brief-idea').value = T(`我想讨论《${item.t}》这个故事方向。\n`); });
 });
 $('.dialog-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close(); } });
 function promptText() {
  const d = prompts?.[$('#prompt-genre').value]; if (!d) return '';
  return `${d.genre}\n\n开场\n${d.hookPrompt}\n${d.hookDialogue}\n\n转折\n${d.twistPrompt}\n${d.twistDialogue}\n\n集尾悬念\n${d.cliffPrompt}\n\n声音参考\n${d.audioPrompt}`;
 }
 function renderPrompts() { $('#prompt-content').textContent = promptText(); }
 $('#prompt-genre').addEventListener('change', renderPrompts);
 $('#copy-prompts').addEventListener('click', () => copy(T(promptText())));
 function renderBrief() {
  const form = new FormData($('#brief-form'));
  brief = `${T('蓝果短剧 · 制作需求简报')}

${T('项目想法：')} ${String(form.get('idea')).trim()}
${T('项目类型：')} ${form.get('type')}
${T('目标时长：')} ${String(form.get('duration')).trim()||T('待讨论')}
${T('称呼与联系方式：')} ${String(form.get('contact')).trim()||T('待补充')}

${T('请共同确认：用途与发布渠道、故事与视觉参考、预算范围、交付规格、修改次数与时间安排。')}`;
  $('#brief-preview').textContent = brief; $('#brief-result').hidden = false;
  $('#email-brief').href = 'mailto:gewenbo888@gmail.com?subject='+encodeURIComponent(T('蓝果短剧 · 制作咨询'))+'&body='+encodeURIComponent(brief);
 }
 $('#brief-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!$('#brief-idea').value.trim()) { $('#brief-idea').setCustomValidity(T('请填写项目想法。')); $('#brief-idea').reportValidity(); return; }
  renderBrief();
  $('#brief-result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
 });
 $('#brief-idea').addEventListener('input',()=>$('#brief-idea').setCustomValidity(''));
 document.addEventListener('languagechange',()=>{ $('#brief-idea').setCustomValidity('');if(brief)renderBrief(); });
 $('#copy-brief').addEventListener('click', () => copy(brief));
 $('#download-brief').addEventListener('click', () => { if (brief) download(brief,'bluefruit-project-brief.txt'); });
 Promise.all([fetch('/catalog.json').then(r => { if(!r.ok)throw Error('catalog');return r.json(); }),fetch('/prompts.json').then(r => { if(!r.ok)throw Error('prompts');return r.json(); })]).then(([c,p]) => {
  catalog=c;prompts=p; selectEpisode(1);renderStories();renderPrompts();
 }).catch(() => { $('#story-count').textContent = '故事资料暂时未能加载，请刷新重试。'; $('#video-meta').textContent='工程样片'; toast('部分资料未能加载，视频仍可直接播放。'); });
})();
