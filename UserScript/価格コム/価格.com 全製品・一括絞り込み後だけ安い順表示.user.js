// ==UserScript==
// @name         価格.com 全製品・一括絞り込み後だけ安い順表示
// @namespace    https://github.com/Gadget-Otaku/Bookmarklet
// @version      1.0.1
// @description  価格.comのノートPCで、裸のitemlist.aspxだけを価格の安い順へ送り、売れ筋ボタンだけは通常順を許可します。
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
  const CHEAP_SORT_URL = ITEMLIST_PATH + '?pdf_so=p1';
  const POPULAR_BYPASS_KEY = 'kakaku-note-pc-popular-sort-bypass-once';
  const BYPASS_TTL_MS = 30 * 1000;

  const isBareItemList = () => {
    return location.pathname === ITEMLIST_PATH && location.search === '' && location.hash === '';
  };

  const readPopularBypass = () => {
    const raw = sessionStorage.getItem(POPULAR_BYPASS_KEY);
    sessionStorage.removeItem(POPULAR_BYPASS_KEY);

    const createdAt = Number(raw);
    return Number.isFinite(createdAt) && Date.now() - createdAt < BYPASS_TTL_MS;
  };

  const redirectBareItemListToCheapSort = () => {
    if (isBareItemList() && !readPopularBypass()) {
      location.replace(CHEAP_SORT_URL);
    } else if (!isBareItemList()) {
      sessionStorage.removeItem(POPULAR_BYPASS_KEY);
    }
  };

  const elementLabel = (element) => {
    return [
      element.textContent,
      element.getAttribute('title'),
      element.getAttribute('aria-label'),
      element.querySelector('img[alt]')?.getAttribute('alt')
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  };

  const callsDefaultSort = (element) => {
    const handler = (element.getAttribute('onclick') || '').replace(/\s+/g, '');
    return /changeLocation\((['"])\1\)/.test(handler);
  };

  const isPopularSortControl = (element) => {
    if (!element) {
      return false;
    }

    const label = elementLabel(element);
    return callsDefaultSort(element) && /売れ筋|人気売れ筋ランキング/.test(label);
  };

  const findPopularSortControl = (target) => {
    if (!(target instanceof Element)) {
      return null;
    }

    const closestTypeClick = target.closest('.typeClk');
    if (isPopularSortControl(closestTypeClick)) {
      return closestTypeClick;
    }

    const closestPopularCell = target.closest('.swrank2');
    if (closestPopularCell) {
      const control = closestPopularCell.querySelector('.typeClk');
      if (isPopularSortControl(control)) {
        return control;
      }
    }

    return null;
  };

  const allowNextBareItemListForPopularSort = (event) => {
    if (findPopularSortControl(event.target)) {
      sessionStorage.setItem(POPULAR_BYPASS_KEY, String(Date.now()));
    }
  };

  redirectBareItemListToCheapSort();
  document.addEventListener('click', allowNextBareItemListForPopularSort, true);
})();
