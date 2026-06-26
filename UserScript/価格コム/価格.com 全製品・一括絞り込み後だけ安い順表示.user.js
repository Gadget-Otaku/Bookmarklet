// ==UserScript==
// @name         価格.com 全製品・一括絞り込み後だけ安い順表示
// @namespace    https://github.com/Gadget-Otaku/Bookmarklet
// @version      1.0.0
// @description  価格.comのノートPCで、全製品リンクと一括絞り込みの検索結果だけを初期表示で価格の安い順にします。
// @author       Gadget-Otaku
// @match        https://kakaku.com/pc/note-pc/
// @match        https://kakaku.com/pc/note-pc/itemlist.aspx*
// @downloadURL  https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/refs/heads/main/UserScript/%E4%BE%A1%E6%A0%BC%E3%82%B3%E3%83%A0/%E4%BE%A1%E6%A0%BC.com%20%E5%85%A8%E8%A3%BD%E5%93%81%E3%83%BB%E4%B8%80%E6%8B%AC%E7%B5%9E%E3%82%8A%E8%BE%BC%E3%81%BF%E5%BE%8C%E3%81%A0%E3%81%91%E5%AE%89%E3%81%84%E9%A0%86%E8%A1%A8%E7%A4%BA.user.js
// @updateURL    https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/refs/heads/main/UserScript/%E4%BE%A1%E6%A0%BC%E3%82%B3%E3%83%A0/%E4%BE%A1%E6%A0%BC.com%20%E5%85%A8%E8%A3%BD%E5%93%81%E3%83%BB%E4%B8%80%E6%8B%AC%E7%B5%9E%E3%82%8A%E8%BE%BC%E3%81%BF%E5%BE%8C%E3%81%A0%E3%81%91%E5%AE%89%E3%81%84%E9%A0%86%E8%A1%A8%E7%A4%BA.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ITEMLIST_PATH = '/pc/note-pc/itemlist.aspx';
  const CHEAP_SORT = 'p1';
  const DEFAULT_SORTS = new Set(['', 's1']);
  const touchedSortSelects = new WeakSet();
  const autoChangingSortSelects = new WeakSet();

  const toUrl = (value) => {
    try {
      return new URL(value, location.href);
    } catch (_) {
      return null;
    }
  };

  const isNotePcItemList = (url) => {
    return url && url.origin === location.origin && url.pathname === ITEMLIST_PATH;
  };

  const withCheapSort = (value) => {
    const url = toUrl(value);
    if (!isNotePcItemList(url)) {
      return value;
    }

    url.searchParams.set('pdf_so', CHEAP_SORT);
    return url.pathname + url.search + url.hash;
  };

  const elementText = (element) => {
    return [
      element.textContent,
      element.getAttribute('aria-label'),
      element.getAttribute('title'),
      element.querySelector('img[alt]')?.getAttribute('alt')
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  };

  const isAllProductsLink = (anchor) => {
    if (!anchor || location.pathname !== '/pc/note-pc/') {
      return false;
    }

    const url = toUrl(anchor.getAttribute('href'));
    if (!isNotePcItemList(url)) {
      return false;
    }

    return !url.search && /全製品/.test(elementText(anchor));
  };

  const patchAllProductsLinks = (root = document) => {
    if (location.pathname !== '/pc/note-pc/' || !root.querySelectorAll) {
      return;
    }

    const anchors = root.matches?.('a[href]')
      ? [root, ...root.querySelectorAll('a[href]')]
      : [...root.querySelectorAll('a[href]')];

    for (const anchor of anchors) {
      if (isAllProductsLink(anchor)) {
        anchor.href = withCheapSort(anchor.getAttribute('href'));
      }
    }
  };

  const markTouchedSortSelect = (event) => {
    const select = event.target;
    if (select instanceof HTMLSelectElement && select.matches('#searchBySpecBox select[name="so"], #specBoxForm select[name="so"]')) {
      if (!autoChangingSortSelects.has(select) && event.isTrusted) {
        touchedSortSelects.add(select);
      }
    }
  };

  const shouldDefaultToCheapSort = (select) => {
    if (!select || touchedSortSelects.has(select)) {
      return false;
    }

    const currentSort = new URLSearchParams(location.search).get('pdf_so') || '';
    return DEFAULT_SORTS.has(select.value || '') || DEFAULT_SORTS.has(currentSort);
  };

  const setModalSortToCheap = () => {
    const select = document.querySelector('#searchBySpecBox select[name="so"], #specBoxForm select[name="so"]');
    if (shouldDefaultToCheapSort(select)) {
      autoChangingSortSelects.add(select);
      select.value = CHEAP_SORT;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      autoChangingSortSelects.delete(select);
    }
  };

  const isSeeResultClick = (event) => {
    return event.target instanceof Element && !!event.target.closest('#searchBySpecBox a.seeResult, #specBoxForm a.seeResult');
  };

  const handleClickCapture = (event) => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (isAllProductsLink(anchor)) {
      anchor.href = withCheapSort(anchor.getAttribute('href'));
      return;
    }

    if (isSeeResultClick(event)) {
      setModalSortToCheap();
    }
  };

  const observeDom = () => {
    patchAllProductsLinks();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          patchAllProductsLinks(mutation.target.parentElement || document);
        }

        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            patchAllProductsLinks(node);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });
  };

  document.addEventListener('click', handleClickCapture, true);
  document.addEventListener('change', markTouchedSortSelect, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeDom, { once: true });
  } else {
    observeDom();
  }
})();
