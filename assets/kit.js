// AI 新词站白话课：所有页面共用的小工具。页面里用 const { $, $$, ... } = KIT; 取出来用。
// 每个页面的 <body data-page="..."> 写上自己的 id（见下面 PAGES / SIM_PAGES），KIT 会自动画好顶栏、翻页和页脚，
// 并自动接管：点词看解释（.term）、马上答一题（.quiz）、计分条（[data-scorebar]）、阅读清单勾选（.readlist）。
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ---------- 页面清单 ----------
  const PAGES = [
    { id: 'home', href: 'index.html', short: '总览', title: '总览' },
    { id: 's1', href: 's1-find.html', short: '1 找词', title: '第 1 步 找新词', sim: 'sim-1' },
    { id: 's2', href: 's2-collect.html', short: '2 收词', title: '第 2 步 收词、扩词', sim: 'sim-2' },
    { id: 's3', href: 's3-onepage.html', short: '3 一页几词', title: '第 3 步 一页放几个词', sim: 'sim-3' },
    { id: 's4', href: 's4-structure.html', short: '4 结构', title: '第 4 步 定结构、定页面', sim: 'sim-4' },
    { id: 's5', href: 's5-page.html', short: '5 做页面', title: '第 5 步 做页面', sim: 'sim-5' },
    { id: 's6', href: 's6-links.html', short: '6 内外链', title: '第 6 步 内链、外链', sim: 'sim-6' },
    { id: 's7', href: 's7-tool.html', short: '7 工具收费', title: '第 7 步 做工具、收订阅', sim: 'sim-7' },
    { id: 's8', href: 's8-launch.html', short: '8 上线优化', title: '第 8 步 上线验收和优化', sim: 'sim-8' },
    { id: 'read', href: 'reading.html', short: '阅读路线', title: '新手阅读路线' },
  ];
  const SIM_PAGES = [
    { id: 'sim-0', href: 'sim-0.html', short: '开局', title: '开局：领取站长档案' },
    { id: 'sim-1', href: 'sim-1.html', short: '1 找词', title: '第 1 关 找词', step: 's1' },
    { id: 'sim-2', href: 'sim-2.html', short: '2 收词', title: '第 2 关 收词', step: 's2' },
    { id: 'sim-3', href: 'sim-3.html', short: '3 分组', title: '第 3 关 一页放几个词', step: 's3' },
    { id: 'sim-4', href: 'sim-4.html', short: '4 搭结构', title: '第 4 关 搭结构', step: 's4' },
    { id: 'sim-5', href: 'sim-5.html', short: '5 写首页', title: '第 5 关 写首页', step: 's5' },
    { id: 'sim-6', href: 'sim-6.html', short: '6 连内链', title: '第 6 关 连内链', step: 's6' },
    { id: 'sim-7', href: 'sim-7.html', short: '7 定价收款', title: '第 7 关 定价收款', step: 's7' },
    { id: 'sim-8', href: 'sim-8.html', short: '8 上线快进', title: '第 8 关 上线快进 3 个月', step: 's8' },
    { id: 'sim-end', href: 'sim-end.html', short: '结局', title: '结局：成绩单' },
  ];
  const pageById = id => PAGES.find(p => p.id === id) || SIM_PAGES.find(p => p.id === id);

  // ---------- 进度：只存在读者自己的浏览器里，存不了也照常显示 ----------
  const mem = {};
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('xc1.' + key);
        return raw == null ? (key in mem ? mem[key] : fallback) : JSON.parse(raw);
      } catch (e) { return key in mem ? mem[key] : fallback; }
    },
    set(key, val) {
      mem[key] = val;
      try { localStorage.setItem('xc1.' + key, JSON.stringify(val)); } catch (e) { /* 隐私模式等情况下存不了，只留在本页内存里 */ }
    },
    del(key) {
      delete mem[key];
      try { localStorage.removeItem('xc1.' + key); } catch (e) { /* 同上 */ }
    },
  };

  // ---------- 小工具 ----------
  function svgEl(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function el(tag, attrs = {}, html) {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    if (html != null) node.innerHTML = html;
    return node;
  }
  function bindSeg(group, onPick) {
    const buttons = $$('button', group);
    buttons.forEach(b => b.addEventListener('click', () => {
      buttons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      onPick(b.dataset.v, b);
    }));
  }
  function tween(ms, step, done) {
    if (reduce || !(ms > 0)) { step(1); if (done) done(); return; }
    const t0 = performance.now();
    (function frame(now) {
      const k = Math.min(1, (now - t0) / ms);
      step(k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
      if (k < 1) requestAnimationFrame(frame); else if (done) done();
    })(t0);
  }
  const afterPaint = fn => requestAnimationFrame(() => requestAnimationFrame(fn));
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const fmt = x => Math.round(x).toLocaleString('en-US');
  function replay(node, cls = 'enter') {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }
  function countUp(node, to, ms = 900, format) {
    const show = typeof format === 'function' ? format : fmt;
    const from = Number(node.dataset.val || 0);
    node.dataset.val = to;
    tween(ms, k => { node.textContent = show(from + (to - from) * k); });
  }
  function rng(seed = 1) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function confetti(box) {
    if (reduce) return;
    const c = el('span', { class: 'confetti', 'aria-hidden': 'true' });
    c.innerHTML = Array.from({ length: 28 }, (_, i) => `<i class="c${i % 4}" style="left:${(i * 37) % 100}%;--d:${(i % 7) * .08}s"></i>`).join('');
    box.appendChild(c);
    setTimeout(() => c.remove(), 2600);
  }

  // 列表重排：先改顺序，再让每一项从旧位置滑到新位置
  function flip(nodes, mutate, ms = 600) {
    const before = new Map(nodes.map(n => [n, n.getBoundingClientRect()]));
    mutate();
    if (reduce) return;
    nodes.forEach(n => {
      const a = before.get(n), b = n.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (!dx && !dy) return;
      n.style.transition = 'none';
      n.style.transform = `translate(${dx}px, ${dy}px)`;
      n.getBoundingClientRect();
      n.style.transition = `transform ${ms}ms cubic-bezier(.3, .7, .3, 1)`;
      n.style.transform = '';
    });
  }

  // 让一个“替身”从 from 飞到 to（比如词飞进篮子）。html 是替身里显示的内容，默认复制 from。
  function flyTo(from, to, { html, cls = 'chip ours', ms = 650 } = {}) {
    if (reduce) return Promise.resolve();
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const g = el('span', { class: cls, 'aria-hidden': 'true' }, html != null ? html : from.innerHTML);
    Object.assign(g.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', zIndex: 65, margin: 0, pointerEvents: 'none', transition: `transform ${ms}ms cubic-bezier(.5, 0, .3, 1), opacity ${ms}ms` });
    document.body.appendChild(g);
    const gw = g.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + gw.width / 2), dy = b.top + b.height / 2 - (a.top + gw.height / 2);
    return new Promise(res => {
      afterPaint(() => {
        g.style.transform = `translate(${dx}px, ${dy}px) scale(.6)`;
        g.style.opacity = '.2';
        setTimeout(() => { g.remove(); res(); }, ms);
      });
    });
  }

  // 一步一步看：root 里要有 .sp-dots、.sp-prev、.sp-next；paint(i, animate) 负责画第 i 步
  function makeSteps(root, labels, paint) {
    const dotsBox = $('.sp-dots', root), prev = $('.sp-prev', root), next = $('.sp-next', root);
    const dots = labels.map((lab, i) => {
      const b = el('button', { type: 'button', class: 'sp-dot', 'aria-label': `第 ${i + 1} 步` }, lab);
      b.addEventListener('click', () => go(i, true));
      dotsBox.appendChild(b);
      return b;
    });
    let cur = 0;
    function go(i, animate) {
      cur = i;
      dots.forEach((d, k) => {
        d.classList.toggle('done', k < i);
        if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === labels.length - 1;
      paint(i, animate);
    }
    if (prev) prev.addEventListener('click', () => { if (cur > 0) go(cur - 1, true); });
    if (next) next.addEventListener('click', () => { if (cur < labels.length - 1) go(cur + 1, true); });
    go(0, false);
    return { go, get cur() { return cur; } };
  }

  // ---------- 拖一拖：鼠标、手指都能拖；也可以先点一下词、再点目标框（手机上更顺手，也支持键盘） ----------
  // KIT.dnd(root, { items: '.dd-item', zones: '.dd-zone', accept(item, zone), onMove(item, zone, from) })
  // accept 返回 false 时词会弹回原处；zone 里第一个 .dd-zone-head 是标题，不会被挤掉。
  function dnd(root, opts = {}) {
    const itemSel = opts.items || '.dd-item', zoneSel = opts.zones || '.dd-zone';
    let picked = null;
    const zones = () => $$(zoneSel, root);
    zones().forEach(z => { if (!z.hasAttribute('tabindex')) z.tabIndex = 0; });
    function setPicked(item) {
      if (picked) picked.classList.remove('picked');
      picked = item;
      zones().forEach(z => z.classList.toggle('can-drop', !!item && z !== item.parentElement));
      if (item) item.classList.add('picked');
    }
    function moveTo(item, zone) {
      const from = item.parentElement;
      if (zone === from) { setPicked(null); return; }
      if (opts.accept && opts.accept(item, zone, from) === false) {
        item.classList.remove('wrong'); void item.offsetWidth; item.classList.add('wrong');
        setTimeout(() => item.classList.remove('wrong'), 700);
        setPicked(null);
        return;
      }
      const all = $$(itemSel, root);
      flip(all, () => zone.appendChild(item), 380);
      setPicked(null);
      if (opts.onMove) opts.onMove(item, zone, from);
    }
    let drag = null;
    root.addEventListener('pointerdown', e => {
      const item = e.target.closest(itemSel);
      if (!item || !root.contains(item) || item.disabled || e.button > 0) return;
      drag = { item, x0: e.clientX, y0: e.clientY, moved: false, ghost: null, id: e.pointerId };
    });
    window.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        const r = drag.item.getBoundingClientRect();
        drag.offX = drag.x0 - r.left; drag.offY = drag.y0 - r.top;
        drag.ghost = drag.item.cloneNode(true);
        drag.ghost.classList.add('dd-ghost');
        drag.ghost.classList.remove('picked');
        drag.ghost.style.width = r.width + 'px';
        document.body.appendChild(drag.ghost);
        drag.item.classList.add('lifting');
        setPicked(null);
      }
      e.preventDefault();
      drag.ghost.style.left = (e.clientX - drag.offX) + 'px';
      drag.ghost.style.top = (e.clientY - drag.offY) + 'px';
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const z = over && over.closest(zoneSel);
      zones().forEach(x => x.classList.toggle('over', x === z && root.contains(z)));
      if (e.clientY < 70) window.scrollBy(0, -12); else if (e.clientY > innerHeight - 70) window.scrollBy(0, 12);
    }, { passive: false });
    window.addEventListener('pointerup', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      zones().forEach(x => x.classList.remove('over'));
      if (!d.moved) { setPicked(picked === d.item ? null : d.item); return; }
      d.ghost.remove();
      d.item.classList.remove('lifting');
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const z = over && over.closest(zoneSel);
      if (z && root.contains(z)) moveTo(d.item, z);
    });
    window.addEventListener('pointercancel', () => {
      if (!drag) return;
      if (drag.ghost) drag.ghost.remove();
      drag.item.classList.remove('lifting');
      zones().forEach(x => x.classList.remove('over'));
      drag = null;
    });
    root.addEventListener('click', e => {
      if (!picked) return;
      const z = e.target.closest(zoneSel);
      if (z && root.contains(z) && !e.target.closest(itemSel)) moveTo(picked, z);
    });
    root.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const item = e.target.closest(itemSel);
      if (item) { e.preventDefault(); setPicked(picked === item ? null : item); return; }
      const z = e.target.closest(zoneSel);
      if (z && picked) { e.preventDefault(); moveTo(picked, z); }
    });
    $$(itemSel, root).forEach(i => { if (i.tagName !== 'BUTTON') i.tabIndex = 0; });
    return { moveTo, unpick: () => setPicked(null) };
  }

  // ---------- 点词看解释 ----------
  const TERMS = {
    seo: ['SEO', '让你的网页在谷歌搜索结果里排得更靠前的一套做法。', '打个比方：在商场里，把你的店挪到人流最多的位置。'],
    keyword: ['关键词', '别人在谷歌搜索框里打的那几个字。'],
    newword: ['新词', '最近一年才开始有人搜的词，比如刚发布的 AI 模型名。大家同一天起跑，新手也有机会。'],
    oldword: ['老词', '很早就有人搜、已经有一堆网站在抢的词。'],
    core: ['核心词', '一个页面主打的那一个词。'],
    longtail: ['长尾词', '核心词的细分说法，比如在后面加上用途、对象。搜的人少一些，但更具体，也更好排。'],
    root: ['词根', 'generator（生成器）、converter（转换器）、calculator（计算器）这类常用词。配上一个对象，就变成具体需求。'],
    intent: ['搜索意图', '搜这个词的人，心里真正想干什么：要一个工具？看一篇教程？找素材？还是找官网？'],
    volume: ['搜索量', '一个词每个月被搜多少次。'],
    kd: ['难度（KD）', 'SEO 工具估出来的“排到前面有多难”，0～100，越小越好排。只是估算，哥飞 2026 年说自己一般不看它。'],
    cpc: ['点击价（CPC）', '广告主在谷歌为一次点击付的钱。越高，说明这个词带来的流量越值钱。'],
    semrush: ['Semrush', '收费的查词工具：看一个词的搜索量、难度，也能看别人的网站靠哪些词拿流量。'],
    ahrefs: ['Ahrefs', '和 Semrush 差不多的收费工具，查词、查外链都行。它的 KD（难度）和 DR（网站权重分）很常用。'],
    similarweb: ['Similarweb', '查一个网站每月有多少人来、从哪来、哪些页面最近突然有了流量。'],
    trends: ['谷歌趋势（Google Trends）', '免费，看一个词的热度怎么随时间变化，还能把几个词放一起比谁更热。'],
    ads: ['谷歌 Ads 关键词规划师', '谷歌广告后台里免费的查词工具，能看谷歌自己统计的搜索量。哥飞最信它。'],
    gpts: ['GPTs', '在谷歌趋势里常被拿来当“尺子”的词：每天大约 5000 次搜索（哥飞 2025 年 4 月的说法）。新词热度是它的几分之一，一比就知道。'],
    serp: ['搜索结果页', '在谷歌搜一个词以后出来的那一页结果。排在前 10 的，就是你要比的对手。'],
    home: ['首页', '网站的门面，网址就是域名本身，比如 framepop.com。'],
    inner: ['内页', '网站里除了首页以外的页面，比如 framepop.com/image-to-video。'],
    subdomain: ['子域名', 'app.framepop.com 这种。哥飞说工具放子域名，在谷歌眼里就像两个网站，不利于排名。'],
    subdir: ['子目录', 'framepop.com/blog/ 这种，还是同一个网站里的一层。'],
    url: ['网址（URL）', '一个页面的地址。'],
    domain: ['域名', '网站的名字，比如 framepop.com。'],
    brand: ['品牌词', '直接搜某个产品、公司名字的词。搜它的人多半想找官网。'],
    trademark: ['商标', '别人注册保护的名字。哥飞说域名里带别人的商标，理论上就不行。'],
    title: ['Title（网页标题）', '浏览器标签上那行字，也是谷歌搜索结果里那行蓝色大字。'],
    desc: ['Description（描述）', '谷歌搜索结果里，标题下面那两行小字。'],
    h1: ['H1', '页面里最大的那个标题。一页只有一个，写这页的核心词。'],
    h2: ['H2', '页面里的小标题，每个小标题下面一段内容。'],
    tdh: ['TDH', '哥飞说的页面三要素：Title（标题）、Description（描述）、H（各级小标题，主要是 H1）。'],
    kwtag: ['keywords 标签', '网页代码里写关键词的地方，页面上看不到。哥飞说谷歌早就不看了，不用写。'],
    landing: ['落地页', '用户从谷歌点进来看到的那一页，要一眼说清你是干什么的。'],
    toolpage: ['精品工具页面', '哥飞的公式：工具 + 落地页文字 + 结果展示，合在同一个页面里。'],
    quality: ['精品页', '上线两周后，在 GSC 里有排名、有曝光、有点击，而且出的词是你想要的。'],
    faq: ['FAQ（常见问题）', '页面底部一问一答那一块，回答用户最常问的问题。'],
    ssr: ['服务器上写好文字', '网页的文字在服务器上就写进网页里，谷歌爬虫一打开就能看到；不是等浏览器运行脚本以后才冒出来。'],
    internal: ['内链', '你自己网站里，一个页面指向另一个页面的链接。', '打个比方：商场里的指示牌。'],
    external: ['外链', '别的网站指向你网站的链接，相当于别人推荐你。也叫反链。'],
    anchor: ['锚文本', '链接上显示的那几个字。写成关键词，谷歌就知道那一页讲的是什么。'],
    breadcrumb: ['面包屑', '页面顶上“首页 › 分类 › 当前页”那一行，告诉人和谷歌：这页在第几层。'],
    orphan: ['孤岛页', '没有任何链接指向的页面。谷歌的爬虫顺着链接走，走不到它。'],
    weight: ['权重', '谷歌给页面打的“信用分”，能顺着链接从一页传到另一页。'],
    dr: ['DR（网站权重分）', 'Ahrefs 给整个网站打的分，0～100。新站一般是 0。'],
    refdomain: ['引荐域名', '有多少个不同的网站链接到你。同一个网站链你 10 次，也只算 1 个。'],
    crawler: ['爬虫', '谷歌派出来自动逛网页的程序。它顺着链接从一页走到另一页。'],
    sitemap: ['sitemap（网站地图）', '一个列出网站所有页面的文件。交给谷歌，帮它找到页面；看别人的 sitemap，也能知道别人最近上了什么新页面。'],
    index: ['收录', '谷歌把你的页面收进它的库里。收录了，才可能出现在搜索结果里。'],
    chuci: ['出词', '收录以后，你的页面开始因为某些词出现在搜索结果里，GSC 里能看到这些词。哥飞说出词就是进了前 200 名。'],
    gsc: ['GSC（Google Search Console）', '谷歌给站长的免费后台：看页面收录了没有、被看到几次、被点了几次、别人搜什么词看到你。'],
    impr: ['曝光', '你的页面在搜索结果里被人看到的次数，不一定被点开。'],
    click: ['点击', '别人在搜索结果里点开你页面的次数。'],
    ctr: ['点击率', '点击 ÷ 曝光。标题写得好不好，看它。'],
    position: ['平均排名', '你的页面在搜索结果里平均排第几。'],
    wscore: ['网站及格线', '哥飞的算法：有曝光有点击的页面数 ÷ 谷歌发现的页面数，至少要到 1%（他写成 100‱）。'],
    cannibal: ['关键词蚕食', '一个网站好几个页面抢同一个词。哥飞说不用怕，细分词各做一页，用内链整合好就行。'],
    template: ['套模板', '一堆页面结构一模一样、只换了个词。2026 年谷歌开始打击，哥飞说问题出在“懒且贪”。'],
    baoxiao: ['保小图大', '哥飞给新手的路线：先把一个小词做稳，再扩到兄弟词，最后拿下更大的父词。'],
    brother: ['兄弟词', '和你的词同一层、需求相近的另一个词。'],
    parent: ['父词', '比你的词范围更大的上一级词，比如 ai video generator 是 lumibo video generator 的父词（示意）。'],
    liuzi: ['分门别类罗列', '哥飞的“六字真言”：把词和内容分好类，一层层列出来，画出来就是一棵树。'],
    orchard: ['数字果园', '一个站像一棵果树。新词站热度会过去，但树还在；不停地种下一棵，慢慢就成了一片果园。'],
    model: ['AI 模型', '真正干活的那个“大脑”，比如把文字变成视频的程序。'],
    api: ['接口（API）', 'AI 平台提供的“插座”：你的网站把用户的要求送过去，它把结果送回来，按次数或运行时间收钱。'],
    shell: ['网页外壳', '你做的网站本身：输入框、按钮、展示结果的地方。AI 工具站 = 别人的模型 + 你的外壳。'],
    vercel: ['Vercel', '放网站的平台：代码传上去，别人就能打开。注意它的免费版只许个人非商业使用。'],
    cloudflare: ['Cloudflare', '管域名的服务，有免费套餐：把域名指到放网站的地方。'],
    subscription: ['订阅', '按月或按年自动扣费。'],
    credits: ['积分包', '一次买一包使用次数，用完再买。'],
    creem: ['Creem', '一个海外收款平台。没公司的新手可以用护照注册，社群里很多人在用。'],
    stripe: ['Stripe', '最常见的海外收款平台。个人开通一般要香港银行卡等条件。'],
    chargeback: ['争议（拒付）', '用户付了钱，又去银行说“这钱不是我付的”要回来。争议多了，收款账号会被封。'],
    mvp: ['第一版', '只做一个页面、一个核心功能，先上线，其他以后补。'],
    adsense: ['AdSense', '谷歌的广告联盟：在你网站上放广告，按展示和点击分钱。'],
    uv: ['独立访客（UV）', '一段时间里来了多少个不同的人。'],
    multilang: ['多语言', '同一个网站做英语、西班牙语、日语等好几个语言版本。'],
    shiyi: ['示意', '为了讲清楚编的例子数字，不是真实数据。'],
    gefei: ['哥飞', '做出海网站的博主，web.cafe 社群“哥飞的朋友们”就是他办的。这里的方法大多出自他的教程和群聊。'],
    agent: ['哥飞 SEO Agent', 'seo.web.cafe 上的 AI 助手。它会翻哥飞的教程和群聊，整理成回答。'],
  };
  function addTerms(more) { Object.assign(TERMS, more); }
  let tip = null, tipFor = null;
  function hideTip() {
    if (!tipFor) return;
    tip.hidden = true;
    tipFor.setAttribute('aria-expanded', 'false');
    tipFor = null;
  }
  function showTip(btn) {
    const t = TERMS[btn.dataset.t];
    if (!t) throw new Error(`词典里没有这个词：${btn.dataset.t}`);
    hideTip();
    tip.innerHTML = `<b>${t[0]}</b><span>${t[1]}</span>${t[2] ? `<em>${t[2]}</em>` : ''}`;
    tip.hidden = false;
    const vw = document.documentElement.clientWidth, w = Math.min(320, vw - 24), r = btn.getBoundingClientRect();
    tip.style.width = w + 'px';
    tip.style.left = (Math.max(12, Math.min(r.left + r.width / 2 - w / 2, vw - w - 12)) + scrollX) + 'px';
    const h = tip.offsetHeight, below = r.bottom + 8;
    const top = below + h > innerHeight && r.top - 8 - h > 0 ? r.top - 8 - h : below;
    tip.style.top = (top + scrollY) + 'px';
    tipFor = btn;
    btn.setAttribute('aria-expanded', 'true');
  }
  function initTerms() {
    tip = el('div', { class: 'tip-pop', role: 'tooltip' });
    tip.hidden = true;
    document.body.appendChild(tip);
    $$('.term').forEach(b => {
      if (!TERMS[b.dataset.t]) throw new Error(`词典里没有这个词：${b.dataset.t}`);
      if (b.tagName !== 'BUTTON') throw new Error(`.term 要用 <button type="button">：${b.outerHTML}`);
      b.setAttribute('aria-expanded', 'false');
      b.title = '点一下看解释';
    });
    document.addEventListener('click', e => {
      const b = e.target.closest('.term');
      if (b) { if (tipFor === b) hideTip(); else showTip(b); return; }
      if (!e.target.closest('.tip-pop')) hideTip();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTip(); });
    addEventListener('resize', hideTip);
  }

  // ---------- 马上答一题 ----------
  // <div class="quiz" data-answer="B"> … <button class="q-opt" data-l="A">…</button> … <div class="q-ans" hidden><p class="q-verdict"></p>…解释…</div></div>
  // 子页面写在 <body data-page>；总览页的 body 由发布平台生成，所以写在最外层的 <div data-page> 上
  const pageId = () => (document.querySelector('[data-page]') || document.body).dataset.page || 'x';
  function initQuizzes() {
    const quizzes = $$('.quiz[data-answer]');
    const key = 'quiz.' + pageId();
    const saved = store.get(key, {});
    quizzes.forEach((q, i) => {
      const ans = q.dataset.answer;
      const opts = $$('.q-opt', q);
      if (!opts.some(o => o.dataset.l === ans)) throw new Error(`第 ${i + 1} 道题的答案 ${ans} 不在选项里`);
      opts.forEach(o => { o.type = 'button'; });
      const show = (picked, animate) => {
        opts.forEach(o => {
          o.disabled = true;
          o.classList.toggle('right', o.dataset.l === ans);
          o.classList.toggle('wrong', o.dataset.l === picked && picked !== ans);
          o.classList.toggle('picked', o.dataset.l === picked);
          if (!animate) o.style.animation = 'none';
        });
        const box = $('.q-ans', q);
        if (box) {
          const v = $('.q-verdict', box);
          if (v) {
            v.className = 'q-verdict ' + (picked === ans ? 'ok' : 'miss');
            v.textContent = picked === ans ? '答对了！' : `差一点，正确答案是 ${ans}`;
          }
          box.hidden = false;
          if (!animate) box.style.animation = 'none';
        }
      };
      if (saved[i]) show(saved[i], false);
      opts.forEach(o => o.addEventListener('click', () => {
        if (o.disabled) return;
        const s = store.get(key, {});
        s[i] = o.dataset.l;
        store.set(key, s);
        show(o.dataset.l, true);
        paintScore();
      }));
    });
    function paintScore() {
      const s = store.get(key, {});
      const total = quizzes.length;
      const done = quizzes.filter((_, i) => s[i]).length;
      const right = quizzes.filter((q, i) => s[i] === q.dataset.answer).length;
      $$('[data-scorebar]').forEach(sb => {
        sb.innerHTML = `<span>马上答一题：答对 <b>${right}</b> / ${total}</span><span class="meter"><i style="width:${total ? right / total * 100 : 0}%"></i></span><button type="button" class="btn" data-reset>重新答</button>`;
        $('[data-reset]', sb).addEventListener('click', () => { store.del(key); location.reload(); });
      });
      if (total) store.set('done.' + pageId(), { right, done, total });
    }
    paintScore();
  }

  // ---------- 阅读清单勾选 ----------
  function initReadlist() {
    $$('.readlist li').forEach(li => {
      const a = $('a', li), box = $('input[type="checkbox"]', li);
      if (!a || !box) return;
      const k = 'read.' + a.getAttribute('href');
      box.checked = !!store.get(k, false);
      li.classList.toggle('read', box.checked);
      box.addEventListener('change', () => { store.set(k, box.checked); li.classList.toggle('read', box.checked); });
    });
    $$('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
  }

  // ---------- 顶栏、翻页、页脚 ----------
  // 每一页的进度小字：讲解页看答题，模拟器看得分
  function progressOf(p) {
    const d = store.get('done.' + p.id, null);
    if (d && d.total && d.done) return { text: d.done === d.total ? `答对 ${d.right}/${d.total}` : `答了 ${d.done}/${d.total}`, ok: d.done === d.total };
    const s = store.get('sim.' + p.id, null);
    if (s && s.max) return { text: `${s.score} 分`, ok: true };
    return null;
  }
  // 顶栏：放得下就一排按钮全露出来；放不下就收成「当前页 + 上一页/下一页 + 全部页面」，
  // 点「全部页面」弹出目录面板（讲解 8 步、阅读路线、模拟器每一关），哪一页都能一步点到。
  function buildTopbar(top, id, isSim) {
    top.className = 'topbar';
    const home = PAGES[0], read = PAGES.find(p => p.id === 'read');
    const steps = PAGES.filter(p => /^s\d$/.test(p.id));
    const pills = isSim
      ? [{ ...home, short: '总览' }, ...SIM_PAGES.map(p => ({ ...p, simPill: true }))]
      : [home, ...steps, read, { id: 'sim-0', href: 'sim-0.html', short: '模拟器', simPill: true, simEntry: true }];
    const flat = isSim ? SIM_PAGES : PAGES;
    const i = flat.findIndex(p => p.id === id);
    const me = flat[i] || home, prev = flat[i - 1], next = flat[i + 1];
    const pill = p => {
      const pr = progressOf(p);
      const cur = p.id === id || (p.simEntry && isSim);
      const cls = [p.simPill ? 'sim' : '', pr && pr.ok ? 'done' : ''].join(' ').trim();
      return `<a href="${p.href}"${cls ? ` class="${cls}"` : ''}${cur ? ' aria-current="page"' : ''}>${p.short}</a>`;
    };
    const card = (p, n, sim) => {
      const pr = progressOf(p);
      return `<li><a href="${p.href}"${sim ? ' class="sim"' : ''}${p.id === id ? ' aria-current="page"' : ''}><span class="n">${n}</span><b>${p.title.replace(/^第 \d 步 |^第 \d 关 /, '')}</b>${pr ? `<em class="${pr.ok ? 'ok' : ''}">${pr.text}</em>` : '<em></em>'}</a></li>`;
    };
    const arrow = (p, dir) => p
      ? `<a class="tb-arrow" href="${p.href}" title="${dir === 'prev' ? '上一页' : '下一页'}：${p.title}" aria-label="${dir === 'prev' ? '上一页' : '下一页'}：${p.title}">${dir === 'prev' ? '‹' : '›'}</a>`
      : `<span class="tb-arrow off" aria-hidden="true">${dir === 'prev' ? '‹' : '›'}</span>`;
    top.innerHTML = `<div class="wrap tb-row">
      <a class="tb-home" href="index.html" title="回总览"><i>词</i><b>AI 新词站白话课</b></a>
      <nav class="tb-nav" aria-label="页面导航">${pills.map(pill).join('')}</nav>
      <div class="tb-mini">${arrow(prev, 'prev')}<span class="tb-cur">${me.title}</span>${arrow(next, 'next')}</div>
      <button type="button" class="tb-menu" aria-expanded="false" aria-controls="tb-panel"><span>全部页面</span><i aria-hidden="true">▾</i></button>
    </div>
    <div class="tb-panel" id="tb-panel" hidden>
      <div class="wrap">
        <div class="tb-sec"><h4>从这里开始</h4><ul class="tb-grid">${card(home, '首', false)}${card(read, '读', false)}</ul></div>
        <div class="tb-sec"><h4>讲解 · 8 步</h4><ul class="tb-grid">${steps.map((p, k) => card(p, k + 1, false)).join('')}</ul></div>
        <div class="tb-sec"><h4>站长模拟器 · 8 关</h4><ul class="tb-grid">${SIM_PAGES.map((p, k) => card(p, k === 0 ? '开' : k === SIM_PAGES.length - 1 ? '终' : k, true)).join('')}</ul></div>
      </div>
    </div>`;
    const nav = $('.tb-nav', top), row = $('.tb-row', top), btn = $('.tb-menu', top), panel = $('#tb-panel', top);
    // 放不放得下：先按一排全露出来量一下，挤了就收起来
    const fit = () => {
      top.classList.remove('tb-collapsed');
      const tight = nav.scrollWidth > nav.clientWidth + 1 || row.scrollWidth > row.clientWidth + 1;
      top.classList.toggle('tb-collapsed', tight);
    };
    fit();
    let raf = 0;
    addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    const open = yes => {
      panel.hidden = !yes;
      btn.setAttribute('aria-expanded', String(yes));
      top.classList.toggle('tb-open', yes);
      if (yes) { const cur = $('[aria-current="page"]', panel); if (cur) cur.focus({ preventScroll: true }); }
    };
    btn.addEventListener('click', () => open(panel.hidden));
    document.addEventListener('click', e => { if (!panel.hidden && !top.contains(e.target)) open(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
  }

  function chrome() {
    const id = pageId();
    const isSim = id.startsWith('sim');
    const top = $('#topbar');
    if (top) buildTopbar(top, id, isSim);
    const pager = $('#pager');
    if (pager) {
      pager.className = 'pager';
      const list = isSim ? SIM_PAGES : PAGES;
      const i = list.findIndex(p => p.id === id);
      const prev = list[i - 1], next = list[i + 1];
      const me = list[i];
      let html = '';
      if (!isSim && me && me.sim) {
        const s = SIM_PAGES.find(p => p.id === me.sim);
        html += `<a class="go-sim" href="${s.href}"><b>去模拟器玩「${s.title}」</b><span>讲完了，自己当一回站长，把这一步亲手做一遍。</span><em>开玩 →</em></a>`;
      }
      if (isSim && me && me.step) {
        const s = PAGES.find(p => p.id === me.step);
        html += `<p class="muted" style="font-size:14.5px">这一关对应的讲解：<a href="${s.href}">${s.title}</a></p>`;
      }
      html += `<div class="pg-row">${prev ? `<a class="prev" href="${prev.href}"><span>← 上一${isSim ? '关' : '页'}</span><b>${prev.title}</b></a>` : ''}${next ? `<a class="next" href="${next.href}"><span>下一${isSim ? '关' : '页'} →</span><b>${next.title}</b></a>` : ''}</div>`;
      pager.innerHTML = `<div class="wrap" style="display:grid;gap:14px">${html}</div>`;
    }
    const foot = $('#foot');
    if (foot) {
      foot.className = 'site-foot';
      foot.innerHTML = `<div class="wrap"><p>内容整理自哥飞在 web.cafe 社群的教程、公众号文章、群聊和社群成员的复盘，以及哥飞 SEO Agent 的回答。每条都标了来源：<span class="st hf">哥飞原话</span> <span class="st sq">社群经验</span> <span class="st tl">推出来的</span> <span class="st sy">示意</span>。web.cafe 的链接要登录社群才能看。</p><p>模拟器里的「Lumibo 2」和网站「FramePop」都是编出来的，所有数字都是示意，不是真实数据。答题进度只存在你自己的浏览器里。</p></div>`;
    }
  }

  // ---------- 模拟器共用：虚构的新词、词表、页面 ----------
  // bucket：home 首页主打 / text 写进已有页面的文字里 / own 单独做一页 / later 先不做。ok 里是“也说得通”的答案（拿一半分）。
  const SIM = {
    model: 'Lumibo 2',
    core: 'lumibo video generator',
    brand: 'FramePop',
    domain: 'framepop.com',
    words: [
      { w: 'lumibo video generator', v: 22000, bucket: 'home', why: '核心词：搜的人最多，意思最直接，首页就主打它。' },
      { w: 'lumibo ai video generator', v: 5400, bucket: 'text', ok: ['home'], why: '和核心词是同一件事，只多了个 ai，写进首页的标题或正文就行。' },
      { w: 'lumibo video generators', v: 900, bucket: 'text', why: '单复数，谷歌当成同一个词，放在同一页。' },
      { w: 'free lumibo video generator', v: 3600, bucket: 'text', why: '“免费”只是修饰，要的还是同一个工具。写进首页，比如“免费试 3 次”。' },
      { w: 'lumibo video generator online', v: 1300, bucket: 'text', why: '“在线”也是修饰，写进正文。' },
      { w: 'lumibo video generator no watermark', v: 800, bucket: 'text', why: '“无水印”是用户关心的问题，写进首页的 FAQ。' },
      { w: 'lumibo image to video', v: 8100, bucket: 'own', why: '上传图片变视频，是另一个功能，单独做一页。' },
      { w: 'lumibo text to video', v: 4400, bucket: 'own', why: '打字变视频，也是另一个功能，单独做一页。' },
      { w: 'lumibo prompts', v: 2900, bucket: 'own', why: '想找提示词（素材），做一个提示词模板页，像素材库一样。' },
      { w: 'how to use lumibo 2', v: 1600, bucket: 'own', ok: ['later'], why: '教程类问题，做一篇教程（博客）页。' },
      { w: 'lumibo 2 vs sora', v: 1000, bucket: 'own', ok: ['later'], why: '对比类，单独一页；也可以等第 3～6 周再做。' },
      { w: 'lumibo video maker', v: 2400, bucket: 'later', ok: ['own', 'text'], why: '同一件事的另一种叫法，也有人搜。哥飞说可以单独做一页，但新站先把首页做好，有数据了再拆；先写进首页正文也行。' },
      { w: 'lumibo for tiktok', v: 700, bucket: 'later', ok: ['own'], why: '用途页，第 2～4 周再做。' },
      { w: 'lumibo 2', v: 40000, bucket: 'text', ok: ['later'], why: '光秃秃的模型名，搜的人多半想找官网，第一名是官方。正文里提一句“支持 Lumibo 2”就行，不单独做页。' },
      { w: 'lumibo 2 download', v: 1900, bucket: 'later', why: '想下载官方 App，你给不了，先不做。' },
      { w: 'lumibo api', v: 1000, bucket: 'later', why: '开发者在找官方接口，不是你的用户，先不做。' },
      { w: 'lumibo 2 release date', v: 2000, bucket: 'later', ok: ['text'], why: '新闻类，查一次就走、热得快凉得快。先不做，或者在 FAQ 里提一句。' },
      { w: 'ai video generator', v: 450000, bucket: 'later', why: '父词，竞争极大。等兄弟词站稳了再“图大”。' },
    ],
    buckets: { home: '首页主打', text: '写进页面文字', own: '单独做一页', later: '先不做' },
    pages: [
      { id: 'home', path: '/', name: '首页', kw: 'lumibo video generator', day1: true, need: true },
      { id: 'i2v', path: '/image-to-video', name: '图生视频页', kw: 'lumibo image to video', day1: true },
      { id: 't2v', path: '/text-to-video', name: '文生视频页', kw: 'lumibo text to video', day1: true },
      { id: 'prompts', path: '/prompts', name: '提示词模板页', kw: 'lumibo prompts', day1: false },
      { id: 'pricing', path: '/pricing', name: '定价页', kw: '', day1: true, need: true },
      { id: 'about', path: '/about', name: '关于', kw: '', day1: true, need: true },
      { id: 'privacy', path: '/privacy', name: '隐私政策', kw: '', day1: true, need: true },
      { id: 'terms', path: '/terms', name: '服务条款', kw: '', day1: true, need: true },
      { id: 'howto', path: '/blog/how-to-use-lumibo-2', name: '教程', kw: 'how to use lumibo 2', day1: false },
      { id: 'vs', path: '/vs/sora', name: '对比页', kw: 'lumibo 2 vs sora', day1: false },
      { id: 'tiktok', path: '/for/tiktok', name: '用途页', kw: 'lumibo for tiktok', day1: false },
      { id: 'es', path: '/es/', name: '西班牙语版', kw: '', day1: false, trap: '多语言先别做' },
    ],
    save(level, score, max, extra) { store.set('sim.' + level, Object.assign({ score, max }, extra || {})); },
    load(level) { return store.get('sim.' + level, null); },
  };

  window.KIT = {
    reduce, NS, $, $$, el, svgEl, bindSeg, tween, afterPaint, sleep, fmt, replay, countUp, rng, confetti, flip, flyTo,
    makeSteps, dnd, store, TERMS, addTerms, PAGES, SIM_PAGES, pageById, SIM,
  };

  // kit.js 放在 body 最后，页面结构已经在了：顶栏、翻页立刻画，免得打开时闪一下。
  // 点词、答题等等页面自己的脚本跑完（可能先 addTerms）再初始化，所以放到下一拍。
  function boot() {
    initTerms();
    initQuizzes();
    initReadlist();
  }
  if ($('#topbar') || $('#pager') || $('#foot')) chrome(); else document.addEventListener('DOMContentLoaded', chrome);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot)); else setTimeout(boot);
})();
