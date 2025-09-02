// ==UserScript==
// @name         YouTube コメント検索（PC/モバイル共通）
// @namespace    yt-comment-filter-mobile-auto-stable
// @version      1.0
// @description  コメント一覧オープンで1回だけ自動表示。モバイル/PCとも top/left/width/height で固定表示。
// @match        https://m.youtube.com/*
// @match        https://www.youtube.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  /** =========================
   *  位置・サイズの編集ポイント
   *  ========================= */
  const POS_CONFIG = {
    // モバイル動画: https://m.youtube.com/watch?v=
    m_video:  { top: 260, left: 0,  width: 240,   height: 30 },
    // モバイルショート: https://m.youtube.com/shorts/*
    m_shorts: { top: 230, left: 0,  width: 240,   height: 30 },

    // PC 動画: https://www.youtube.com/watch?v=
    pc_video:  { top: 0, left: 980, width: 180,  height: 30 },

    // PC ショート: https://www.youtube.com/shorts/*
    pc_shorts: { top: 0,  left: 980, width: 180,  height: 30 },
  };

  const BOX_ID = 'yt-comment-filter-box';
  const HL_CLASS = 'ytc-hl';

  let prevListOpen = false;
  let listObserver = null;

  /** small utils */
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isVisible = (el) => !!el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';

  /** 現在モード判定 */
  function getMode() {
    const host = location.host;
    const path = location.pathname;
    const isMobile = /^m\.youtube\.com$/.test(host);
    const isShorts = /^\/shorts\//.test(path);
    if (isMobile) return isShorts ? 'm_shorts' : 'm_video';
    return isShorts ? 'pc_shorts' : 'pc_video';
  }

  /** 代表的なコメント要素（可視のものだけ返す） */
  function findCommentItems() {
    const items = document.querySelectorAll([
      // モバイル
      'ytm-comment-thread-renderer',
      'ytm-comment-renderer',
      // PC
      'ytd-comment-thread-renderer',
      'ytd-comment-renderer',
      // 旧/中間要素
      '#content-text.ytd-comment-view-model'
    ].join(','));
    return Array.from(items).filter(isVisible);
  }

  /** 「コメント一覧が開いている」判定（※厳密化：可視のコメント要素がある時のみ true） */
  function isCommentListOpen() {
    return findCommentItems().length > 0;
  }

  /** コメント一覧の✕（Close）を拾う（自前UI除外） */
  function findPanelCloseButtons() {
    const box = document.getElementById(BOX_ID);
    const btns = $all('button, ytm-icon-button button, tp-yt-paper-icon-button, yt-icon-button button')
      .filter(b => {
        if (box && box.contains(b)) return false;
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const text = (b.textContent || '').trim();
        return (
          aria.includes('閉じる') ||
          aria.includes('close') ||
          /^[✕×x]$/.test(text)
        );
      });
    return btns;
  }

  /** UI生成 */
  function ensureBox() {
    let box = document.getElementById(BOX_ID);
    if (box) return box;

    box = document.createElement('div');
    box.id = BOX_ID;
    Object.assign(box.style, {
      position: 'fixed',
      top: '250px',
      left: '0px',
      display: 'none',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(255,255,255,0.96)',
      color: '#111',
      border: '1px solid #ccc',
      padding: '8px',
      zIndex: '999999',
      borderRadius: '12px',
      boxShadow: '0 8px 28px rgba(0,0,0,.25)',
      backdropFilter: 'blur(4px)',
      maxWidth: '92vw'
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'キーワード';
    input.autocomplete = 'off';
    Object.assign(input.style, {
      fontSize: '16px',
      padding: '8px 10px',
      border: '1px solid #bbb',
      borderRadius: '10px',
      minWidth: '0',
      maxWidth: '100%',
      flex: '1 1 auto',
    });

    const btnSearch = document.createElement('button');
    btnSearch.textContent = '検索';
    Object.assign(btnSearch.style, {
      fontSize: '15px',
      padding: '10px 12px',
      border: '1px solid #bbb',
      borderRadius: '10px',
      cursor: 'pointer',
      flex: '0 0 auto',
    });

    btnSearch.addEventListener('click', () => runSearch(input.value.trim()));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(input.value.trim()); });

    box.append(input, btnSearch);
    document.body.appendChild(box);

    // ハイライト用
    const style = document.createElement('style');
    style.textContent = `
      .${HL_CLASS} {
        outline: 3px solid orange !important;
        outline-offset: 2px;
        border-radius: 8px;
        background: rgba(255,165,0,.08) !important;
      }
    `;
    document.head.appendChild(style);

    return box;
  }

  /** 表示時：位置サイズ適用（モバイル/PC とも固定） */
  function applyFixedLayout(box) {
    const mode = getMode();
    const cfg = POS_CONFIG[mode] || {};
    // 位置
    if (typeof cfg.top === 'number')  box.style.top  = cfg.top  + 'px';
    if (typeof cfg.left === 'number') box.style.left = cfg.left + 'px';
    // 競合防止
    box.style.right = 'auto';
    box.style.bottom = 'auto';
    // サイズ
    if (cfg.width && cfg.width > 0)  box.style.width  = cfg.width  + 'px';
    else box.style.removeProperty('width');
    if (cfg.height && cfg.height > 0) box.style.height = cfg.height + 'px';
    else box.style.removeProperty('height');
  }

  /** 1回表示（表示時は常に空欄・フォーカスなし） */
  function showBoxOnceOnOpen() {
    const box = ensureBox();
    if (box.style.display !== 'flex') {
      // 表示前にクリア＆フォーカス外し
      const input = box.querySelector('input');
      if (input) { input.value = ''; input.blur(); }
      // 固定レイアウト適用
      applyFixedLayout(box);
      // 表示
      box.style.display = 'flex';
      // YouTube 側クローズ連動
      bindPanelCloseButtons();
    }
  }

  function hideBoxInternal() {
    const box = document.getElementById(BOX_ID);
    if (box) box.style.display = 'none';
    clearHighlights();
  }

  /** コメント一覧が閉じられた時：ボックス非表示 */
  function handleListClosed() {
    hideBoxInternal();
  }

  /** ✕連動：コメント一覧のクローズボタンで閉じたらボックスも閉じる */
  function bindPanelCloseButtons() {
    findPanelCloseButtons().forEach(btn => {
      if (!btn.__ytc_close_bound) {
        btn.addEventListener('click', () => {
          hideBoxInternal();
        }, { capture: true, once: false });
        btn.__ytc_close_bound = true;
      }
    });
  }

  /** 検索（要素ベース→フォールバック） */
  function runSearch(keyword) {
    const box = document.getElementById(BOX_ID);
    if (!box) return;

    clearHighlights();

    const input = box.querySelector('input');
    if (!keyword) {
      alert('キーワードを入力してください');
      input && input.focus();
      return;
    }
    const low = keyword.toLowerCase();

    const items = findCommentItems();
    if (items.length) {
      let found = 0;
      items.forEach(item => {
        const txt = (item.innerText || item.textContent || '').toLowerCase();
        if (txt.includes(low)) {
          item.classList.add(HL_CLASS);
          item.style.display = '';
          found++;
        } else {
          item.style.display = 'none';
          item.setAttribute('data-ytc-hidden', '1');
        }
      });
      if (found) {
        const first = items.find(el => el.classList.contains(HL_CLASS));
        first && first.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    // フォールバック（ハイライトのみ）
    const nodes = findTextNodes(document.body, 1500);
    const matchedRoots = [];
    for (const t of nodes) {
      if ((t.nodeValue || '').toLowerCase().includes(low)) {
        const root = guessItemRoot(t.parentElement || document.body);
        if (!matchedRoots.includes(root)) matchedRoots.push(root);
      }
    }
    if (matchedRoots.length) {
      matchedRoots.forEach(r => r.classList.add(HL_CLASS));
      matchedRoots[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    alert('キーワードに一致するコメントは見つかりませんでした');
  }

  function clearHighlights() {
    document.querySelectorAll('.' + HL_CLASS).forEach(el => el.classList.remove(HL_CLASS));
    document.querySelectorAll('[data-ytc-hidden="1"]').forEach(el => {
      el.style.display = '';
      el.removeAttribute('data-ytc-hidden');
    });
  }

  /** テキストノード探索（フォールバック用） */
  function findTextNodes(root, max = 800) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const s = (node.nodeValue || '').trim();
        if (s.length < 2) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p || !isVisible(p)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const out = [];
    while (walker.nextNode() && out.length < max) out.push(walker.currentNode);
    return out;
  }

  /** コメント1件の親らしい要素を推定（フォールバックのハイライト用） */
  function guessItemRoot(fromEl) {
    let n = fromEl;
    for (let i = 0; i < 8 && n && n !== document.body; i++) {
      const tag = (n.tagName || '').toLowerCase();
      if (/^(ytm-|ytd-)/.test(tag)) return n;
      if (n.getAttribute && n.getAttribute('id') === 'content-text') return n;
      if (n.getAttribute && /comment/i.test(n.getAttribute('id') || '')) return n;
      if (n.classList && /comment/i.test(n.className)) return n;
      if (n.offsetHeight >= 44 && n.offsetWidth >= 120) return n;
      n = n.parentElement;
    }
    return fromEl;
  }

  /** コメント入口クリック検出（一覧オープンを監視で拾う） */
  function onPotentialCommentEntryClick(e) {
    const t = e.target;
    if (!t) return;
    const btn = t.closest('button, a, tp-yt-paper-button, yt-button-shape button');
    if (!btn) return;
    const text = (btn.textContent || '').replace(/\s+/g, '');
    const isCommentEntry =
      /コメント/.test(text) || /Comments?/i.test(text) ||
      /一番上のコメント/.test(text) || /件数/.test(text);
    if (!isCommentEntry) return;
  }

  /** コメント一覧の開閉を監視して、開いた瞬間に1回だけ自動表示／閉じたら非表示 */
  function watchListOpenClose() {
    if (listObserver) listObserver.disconnect();

    const check = () => {
      const open = isCommentListOpen();
      if (open && !prevListOpen) {
        showBoxOnceOnOpen();
      } else if (!open && prevListOpen) {
        handleListClosed();
      }
      prevListOpen = open;
    };

    listObserver = new MutationObserver(() => check());
    listObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
    // 初期チェック
    setTimeout(check, 200);
  }

  /** SPA遷移などで状態リセット */
  function installNavHandlers() {
    const reset = () => {
      prevListOpen = false;
      hideBoxInternal();
    };
    window.addEventListener('yt-navigate-finish', reset, { passive: true });
    window.addEventListener('popstate', reset, { passive: true });
    window.addEventListener('hashchange', reset, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') reset();
    });
  }

  /** init */
  function init() {
    document.addEventListener('click', onPotentialCommentEntryClick, true);
    watchListOpenClose();
    installNavHandlers();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 400);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(init, 400));
  }
})();
