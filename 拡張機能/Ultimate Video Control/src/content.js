(function () {
    'use strict';

    console.log("Ultimate Video Control v7.1: Loaded (Mobile Split Config Added)");

    // ==========================================
    // 定数・初期設定
    // ==========================================
    const PANEL_ID = 'uvc-global-panel-v7';
    const STYLE_ID = 'uvc-styles-v7';
    
    // アイコン定義
    const ICONS = {
        gear: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7.07 7.07 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 14.4 2h-3.84a.5.5 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.19 8.87a.5.5 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.47.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" fill="currentColor"/></svg>`,
        download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="ダウンロード"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/></svg>`,
        subtitle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="字幕をコピー"><path d="M20 2H8c-1.1 0-2 .9-2 2v2h12c1.1 0 2 .9 2 2v10h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" opacity="0.7"/><path d="M16 8H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-2 9H6v-2h8v2zm2-4H6v-2h10v2z" fill="currentColor"/></svg>`,
        youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="YouTube"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg>`
    };

    const QUALITY_MAP = { '480P': 'large', '720P': 'hd720', '1080P': 'hd1080', '4k': 'highres' };

    // 設定のデフォルト
    // mobile_posをvideo用とshorts用に分離
    let settings = {
        domains: {},
        save_mode: "soul",
        save_dir: "/sdcard/Download/",
        mobile_pos: { 
            video: { top: 250, left: 0, size: 25 }, 
            shorts: { top: 0, left: 0, size: 25 } 
        },
        apiKey: "",       // YouTube Data API Key
        transUrl: ""      // GAS Web App URL
    };

    // グローバル変数
    let mainPanel = null;
    let mobileHamburger = null;
    let lastAppliedUrl = ""; 
    
    // 現在のサイト情報
    const hostname = location.hostname;
    const isMobileYouTube = hostname === 'm.youtube.com';
    const isYouTube = hostname.includes('youtube.com');

    // ==========================================
    // CSSスタイル注入
    // ==========================================
    function applyGlobalStyles() {
        const existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();

        const styleText = `
            .uvc-controller-container {
                position: absolute !important;
                top: 15px !important;
                left: 15px !important;
                z-index: 2147483647 !important;
                font-family: Roboto, Arial, sans-serif;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                background: transparent;
            }
            .uvc-gear-btn {
                width: 44px; height: 44px;
                cursor: pointer;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.4);
                display: flex; align-items: center; justify-content: center;
                pointer-events: auto;
                transition: transform 0.2s ease, opacity 0.3s, background 0.2s;
                box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                opacity: 0;
                backdrop-filter: blur(2px);
            }
            .uvc-controller-container:hover .uvc-gear-btn,
            .uvc-gear-btn.visible { opacity: 1 !important; }
            .uvc-gear-btn:hover { transform: scale(1.05); background: rgba(0, 0, 0, 0.6); }
            .uvc-gear-btn svg { fill: white; width: 24px; height: 24px; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5)); display: block; }

            #${PANEL_ID} {
                all: initial;
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 2147483647 !important;
                font-family: Roboto, Arial, sans-serif !important;
                font-size: 13px !important;
                color: #333 !important;
                line-height: 1.5 !important;
                
                width: 360px; /* パネル幅を少し拡張 */
                max-width: 95vw;
                max-height: 80vh;
                overflow-y: auto;
                
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(10px);
                border-radius: 8px;
                border: 1px solid #ccc;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                
                display: flex;
                flex-direction: column;
                padding: 10px;
                box-sizing: border-box;

                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
                pointer-events: none;
            }
            #${PANEL_ID}.show {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0) !important;
                pointer-events: auto !important;
            }
            
            #${PANEL_ID} * { box-sizing: border-box; }
            
            .uvc-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px; gap: 5px; }
            .uvc-panel-header-btn { background: none; border: none; cursor: pointer; font-size: 18px; color: #555; padding: 0 4px; font-family: inherit; }
            
            .uvc-ryd-stats { font-size: 11px; color: #444; display: flex; gap: 4px; align-items: center; white-space: nowrap; }
            .uvc-cmt-btn { 
                background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; 
                font-size: 11px; padding: 2px 6px; cursor: pointer; color: #333;
                white-space: nowrap;
            }
            .uvc-cmt-btn:hover { background: #e0e0e0; }

            .uvc-block { margin-bottom: 10px; width: 100%; }
            .uvc-label { display: block; font-weight: bold; margin-bottom: 4px; color: #333; }
            .uvc-row { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; width: 100%; }
            
            .uvc-input {
                padding: 5px; border: 1px solid #ccc; border-radius: 4px;
                text-align: center; font-size: 13px; background: #fff; color: #333; font-family: inherit;
            }
            .uvc-btn {
                padding: 6px 4px; border: 1px solid #ddd; background: #f7f7f7;
                border-radius: 4px; cursor: pointer; font-size: 12px; color: #333;
                flex: 1; text-align: center; min-width: 30px; font-family: inherit;
                display: flex; align-items: center; justify-content: center;
            }
            .uvc-btn:hover { background: #eee; }
            .uvc-btn.active { background: #333; color: #fff; border-color: #333; }

            .uvc-icon-row { display: flex; justify-content: space-around; margin-top: 5px; padding-top: 10px; border-top: 1px solid #eee; }
            .uvc-icon-btn { 
                background: none; border: none; cursor: pointer; padding: 8px; color: #555; 
                flex: none; width: 44px; height: 44px;
            }
            .uvc-icon-btn:hover { color: #000; transform: scale(1.1); }
            .uvc-icon-btn svg { width: 24px; height: 24px; display: block; margin: 0 auto; }

            .uvc-sub-view { display: flex; flex-direction: column; gap: 8px; width: 100%; }
            .uvc-sub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .uvc-list-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f0f0f0; width: 100%; }
            .uvc-checkbox-label { display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 4px 0; font-size: 13px; color: #333;}
            
            .uvc-mobile-hamburger {
                position: fixed !important;
                z-index: 2147483647 !important;
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid rgba(0, 0, 0, 0.8);
                border-radius: 4px;
                cursor: pointer;
                display: flex; flex-direction: column; justify-content: space-around;
                box-sizing: border-box;
                box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                pointer-events: auto;
            }
            .uvc-mobile-hamburger span { 
                display: block; width: 100%; height: 15%; 
                background: transparent; 
                border-radius: 2px; 
            }
            .uvc-hidden { display: none !important; }
            
            /* --- Comment Section Styles --- */
            .uvc-comment-list {
                max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-top: 8px;
            }
            .uvc-comment-item {
                background: #f9f9f9; padding: 10px; border-radius: 4px; border: 1px solid #eee; font-size: 12px;
                display: flex; flex-direction: column; gap: 4px;
            }
            .uvc-comment-header { display: flex; align-items: center; }
            .uvc-comment-avatar { 
                width: 24px; height: 24px; border-radius: 50%; margin-right: 8px; object-fit: cover; border: 1px solid #ccc;
                flex-shrink: 0;
            }
            .uvc-comment-author { font-weight: bold; color: #555; font-size: 11px; }
            .uvc-comment-text { color: #333; word-break: break-all; white-space: pre-wrap; line-height: 1.4; }
            
            /* 返信エリア */
            .uvc-reply-container { margin-top: 5px; border-left: 2px solid #ddd; padding-left: 10px; margin-left: 5px; }
            .uvc-reply-btn {
                background: none; border: none; color: #065fd4; cursor: pointer; font-size: 11px; font-weight: bold; padding: 4px 0;
            }
            .uvc-reply-btn:hover { text-decoration: underline; }
            .uvc-reply-list { display: flex; flex-direction: column; gap: 8px; margin-top: 5px; }
            
            /* 翻訳結果 */
            .uvc-trans-result {
                margin-top: 4px; padding: 4px 6px; background: #fffbe6; border: 1px solid #ffe58f;
                border-radius: 4px; color: #555; font-size: 11px; line-height: 1.3;
            }

            .ytp-bezel-text-wrapper, .ytp-bezel { display: none !important; }
        `;

        const styleTag = document.createElement('style');
        styleTag.id = STYLE_ID;
        styleTag.textContent = styleText;
        (document.head || document.documentElement).appendChild(styleTag);
    }

    // ==========================================
    // 初期化・設定読み込み
    // ==========================================
    chrome.storage.local.get(['uvc_settings'], (result) => {
        if (result.uvc_settings) {
            settings = { ...settings, ...result.uvc_settings };
            
            // 旧設定からの移行・補完 (video/shorts構造がない場合)
            if (!settings.mobile_pos.video) {
                // 旧設定の値があればそれをvideoに、shortsはデフォルトに
                const oldTop = settings.mobile_pos.top || 250;
                const oldLeft = settings.mobile_pos.left || 0;
                const oldSize = settings.mobile_pos.size || 25;
                settings.mobile_pos = {
                    video: { top: oldTop, left: oldLeft, size: oldSize },
                    shorts: { top: 0, left: 0, size: 25 }
                };
            }
        }
        init();
    });

    function saveSettings() {
        chrome.storage.local.set({ 'uvc_settings': settings });
    }

    function init() {
        applyGlobalStyles();
        
        const oldPanel = document.getElementById(PANEL_ID);
        if(oldPanel) oldPanel.remove();
        
        if (isMobileYouTube) {
            startMobileObserver();
        } else {
            startUniversalObserver();
        }

        setInterval(checkAndApplySettings, 1000);
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    }

    // ==========================================
    // パネル生成・監視ロジック (省略なし)
    // ==========================================
    function getMountTarget() {
        if (document.fullscreenElement) return document.fullscreenElement;
        if (document.webkitFullscreenElement) return document.webkitFullscreenElement;
        return document.documentElement || document.body;
    }

    function createGlobalPanel() {
        if (document.getElementById(PANEL_ID)) return document.getElementById(PANEL_ID);

        mainPanel = document.createElement('div');
        mainPanel.id = PANEL_ID;
        
        const target = getMountTarget();
        target.appendChild(mainPanel);

        document.addEventListener('click', (e) => {
            if (!mainPanel.classList.contains('show')) return;
            const isInside = mainPanel.contains(e.target);
            const isGear = e.target.closest('.uvc-gear-btn');
            const isHam = e.target.closest('.uvc-mobile-hamburger');
            if (!isInside && !isGear && !isHam) {
                mainPanel.classList.remove('show');
            }
        });
        
        return mainPanel;
    }

    function handleFullscreenChange() {
        if (mainPanel) {
            const target = getMountTarget();
            if (mainPanel.parentElement !== target) {
                target.appendChild(mainPanel);
            }
        }
    }

    function toggleGlobalPanel(video) {
        if (!mainPanel || !document.contains(mainPanel)) {
            mainPanel = createGlobalPanel();
        }

        if (mainPanel.classList.contains('show')) {
            mainPanel.classList.remove('show');
        } else {
            renderMainPanel(video);
            mainPanel.classList.add('show');
        }
    }

    function startMobileObserver() {
        setInterval(checkMobileHamburger, 500);
    }

    function checkMobileHamburger() {
        // 通常動画またはショート動画以外では非表示
        if (!location.href.includes('/watch?v=') && !location.href.includes('/shorts/')) {
            if (mobileHamburger) mobileHamburger.classList.add('uvc-hidden');
            return;
        }

        // コメント欄等が開いている場合は非表示判定（既存ロジック）
        const panels = document.querySelectorAll('ytm-engagement-panel');
        let isCommentOpen = false;
        panels.forEach(p => {
            if (p.style.display !== 'none' && !p.hidden && p.offsetHeight > 0) isCommentOpen = true;
        });
        if (isCommentOpen) {
            if (mobileHamburger) mobileHamburger.classList.add('uvc-hidden');
            return;
        }

        // ハンバーガーボタン作成
        if (!mobileHamburger) {
            mobileHamburger = document.createElement('div');
            mobileHamburger.className = 'uvc-mobile-hamburger';
            mobileHamburger.innerHTML = '<span></span><span></span><span></span>';
            mobileHamburger.onclick = (e) => {
                e.stopPropagation();
                const v = document.querySelector('video');
                if(v) toggleGlobalPanel(v);
            };
            (document.documentElement || document.body).appendChild(mobileHamburger);
        }
        mobileHamburger.classList.remove('uvc-hidden');

        // 位置の適用：ショート動画か通常動画かで切り替え
        let pos = settings.mobile_pos.video; // デフォルトは動画
        if (location.href.includes('/shorts/')) {
            pos = settings.mobile_pos.shorts;
        }

        // 設定値が未定義の場合のフォールバック
        if (!pos) pos = { top: 250, left: 0, size: 25 };

        mobileHamburger.style.top = pos.top + 'px';
        mobileHamburger.style.left = pos.left + 'px';
        mobileHamburger.style.width = pos.size + 'px';
        mobileHamburger.style.height = pos.size + 'px';
        mobileHamburger.style.padding = (pos.size * 0.2) + 'px';
    }

    function startUniversalObserver() {
        const observer = new MutationObserver(() => {
            document.querySelectorAll('video').forEach(video => {
                if (!video.getAttribute('data-uvc-attached')) {
                    attachGearToVideo(video);
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        document.querySelectorAll('video').forEach(v => {
            if(!v.getAttribute('data-uvc-attached')) attachGearToVideo(v);
        });
    }

    function attachGearToVideo(video) {
        video.setAttribute('data-uvc-attached', 'true');
        let container = video.parentElement;
        if (isYouTube) {
            const ytContainer = video.closest('.html5-video-player');
            if (ytContainer) container = ytContainer;
        }
        const existing = container.querySelector('.uvc-controller-container');
        if (existing) existing.remove();
        const style = window.getComputedStyle(container);
        if (style.position === 'static') container.style.position = 'relative';

        const wrapper = document.createElement('div');
        wrapper.className = 'uvc-controller-container';
        const gearBtn = document.createElement('div');
        gearBtn.className = 'uvc-gear-btn';
        gearBtn.innerHTML = ICONS.gear;

        let hideTimer = null;
        const show = () => {
            gearBtn.classList.add('visible');
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                if (!gearBtn.matches(':hover')) gearBtn.classList.remove('visible');
            }, 2500);
        };
        container.addEventListener('mousemove', show);
        container.addEventListener('mouseenter', show);
        container.addEventListener('touchstart', show, {passive: true});

        gearBtn.onclick = (e) => {
            e.stopPropagation(); e.preventDefault(); toggleGlobalPanel(video);
        };
        wrapper.appendChild(gearBtn);
        container.appendChild(wrapper);
    }

    // ==========================================
    // パネル描画 (メインロジック)
    // ==========================================
    function renderMainPanel(video) {
        if(!mainPanel) return;
        mainPanel.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.className = 'uvc-panel-header';
        
        const settingsBtn = document.createElement('button');
        settingsBtn.innerHTML = '⚙️'; 
        settingsBtn.className = 'uvc-panel-header-btn';
        settingsBtn.onclick = (e) => { e.stopPropagation(); renderSettingsMenu(video); };
        header.appendChild(settingsBtn);

        const currentVideoId = getYouTubeVideoId();
        if (isYouTube && currentVideoId && (location.href.includes('/watch?v=') || location.href.includes('/shorts/'))) {
            const rydSpan = document.createElement('span');
            rydSpan.className = 'uvc-ryd-stats';
            rydSpan.innerText = '読込中...';
            header.appendChild(rydSpan);

            const cmtBtn = document.createElement('button');
            cmtBtn.innerText = 'コメント検索';
            cmtBtn.className = 'uvc-cmt-btn';
            cmtBtn.onclick = (e) => { e.stopPropagation(); renderCommentSearchPanel(video, currentVideoId); };
            header.appendChild(cmtBtn);

            fetchRYDStats(currentVideoId).then(data => {
                if(data && !data.error) {
                    const total = data.likes + data.dislikes;
                    const lPer = total > 0 ? ((data.likes / total) * 100).toFixed(1) : 0;
                    const dPer = total > 0 ? ((data.dislikes / total) * 100).toFixed(1) : 0;
                    rydSpan.innerText = `👍${data.likes} (${lPer}%) 👎${data.dislikes} (${dPer}%)`;
                } else {
                    rydSpan.innerText = 'RYD不可';
                }
            });
        }

        const closeBtn = document.createElement('button');
        closeBtn.innerText = '☒';
        closeBtn.className = 'uvc-panel-header-btn';
        closeBtn.style.marginLeft = 'auto';
        closeBtn.onclick = (e) => { e.stopPropagation(); mainPanel.classList.remove('show'); };
        header.appendChild(closeBtn);
        mainPanel.appendChild(header);

        // Standard Settings
        const stdRow = document.createElement('div');
        stdRow.className = 'uvc-block';
        const label = document.createElement('label');
        label.className = 'uvc-checkbox-label';
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = !!settings.domains[hostname];
        check.onclick = (e) => e.stopPropagation();
        check.onchange = () => {
            if (check.checked) {
                settings.domains[hostname] = { speed: video.playbackRate, quality: '1080P' };
            } else {
                delete settings.domains[hostname];
            }
            saveSettings();
        };
        label.append(check, document.createTextNode(' 標準設定'));
        stdRow.appendChild(label);
        mainPanel.appendChild(stdRow);

        // Speed
        const speedBlock = document.createElement('div');
        speedBlock.className = 'uvc-block';
        speedBlock.innerHTML = `<span class="uvc-label">カスタム速度</span>`;
        const spdRow = document.createElement('div'); spdRow.className = 'uvc-row';
        const spdIn = document.createElement('input'); spdIn.type='number'; spdIn.className='uvc-input'; spdIn.style.width='60px';
        spdIn.value = video.playbackRate; spdIn.onclick=(e)=>e.stopPropagation();
        const spdApp = document.createElement('button'); spdApp.innerText='適用'; spdApp.className='uvc-btn';
        spdApp.onclick = (e) => { e.stopPropagation(); changeSpeed(video, parseFloat(spdIn.value)); };
        spdRow.append(spdIn, spdApp);
        speedBlock.appendChild(spdRow);
        const spdPre = document.createElement('div'); spdPre.className='uvc-row'; spdPre.style.marginTop='6px';
        [0.25, 1, 2, 3, 4].forEach(r => {
            const b = document.createElement('button'); b.innerText=r; b.className='uvc-btn';
            if(video.playbackRate === r) b.classList.add('active');
            b.onclick = (e) => {
                e.stopPropagation(); changeSpeed(video, r); spdIn.value=r;
                Array.from(spdPre.children).forEach(btn=>btn.classList.remove('active'));
                b.classList.add('active');
            };
            spdPre.appendChild(b);
        });
        speedBlock.appendChild(spdPre);
        mainPanel.appendChild(speedBlock);

        // Time
        const seekBlock = document.createElement('div');
        seekBlock.className = 'uvc-block';
        seekBlock.innerHTML = `<span class="uvc-label">再生時間</span>`;
        const timeRow = document.createElement('div'); timeRow.className='uvc-row';
        const createT = (ph) => {
            const i = document.createElement('input'); i.type='number'; i.placeholder=ph; i.className='uvc-input'; i.style.width='35px';
            i.onclick=(e)=>e.stopPropagation(); return i;
        };
        const hIn=createT('時'), mIn=createT('分'), sIn=createT('秒');
        const cur = video.currentTime;
        hIn.value=Math.floor(cur/3600); mIn.value=Math.floor((cur%3600)/60); sIn.value=Math.floor(cur%60);
        const tApp = document.createElement('button'); tApp.innerText='適用'; tApp.className='uvc-btn';
        tApp.onclick = (e) => {
            e.stopPropagation();
            video.currentTime = (parseInt(hIn.value)||0)*3600 + (parseInt(mIn.value)||0)*60 + (parseInt(sIn.value)||0);
        };
        timeRow.append(hIn, document.createTextNode(':'), mIn, document.createTextNode(':'), sIn, tApp);
        seekBlock.appendChild(timeRow);
        const seekBtns = document.createElement('div'); seekBtns.className='uvc-row'; seekBtns.style.marginTop='6px';
        [-30, -10, -5, 5, 10, 30].forEach(s => {
            const b = document.createElement('button'); b.innerText=(s>0?'+':'')+s; b.className='uvc-btn';
            b.onclick = (e) => {
                e.stopPropagation(); video.currentTime+=s;
                const nc = video.currentTime;
                hIn.value=Math.floor(nc/3600); mIn.value=Math.floor((nc%3600)/60); sIn.value=Math.floor(nc%60);
            };
            seekBtns.appendChild(b);
        });
        seekBlock.appendChild(seekBtns);
        mainPanel.appendChild(seekBlock);

        // Quality
        const qBlock = document.createElement('div'); qBlock.className='uvc-block';
        qBlock.innerHTML = `<span class="uvc-label">画質</span>`;
        const qRow = document.createElement('div'); qRow.className='uvc-row';
        ['480P', '720P', '1080P', '4k'].forEach(q => {
            const b = document.createElement('button'); b.innerText=q; b.className='uvc-btn';
            b.onclick=(e)=>{ e.stopPropagation(); changeQuality(q); };
            qRow.appendChild(b);
        });
        qBlock.appendChild(qRow);
        mainPanel.appendChild(qBlock);

        // Footer
        const icons = document.createElement('div'); icons.className='uvc-icon-row';
        const dl = document.createElement('button'); dl.className='uvc-icon-btn'; dl.innerHTML=ICONS.download;
        dl.onclick=(e)=>{ e.stopPropagation(); handleDownload(video); };
        const sub = document.createElement('button'); sub.className='uvc-icon-btn'; sub.innerHTML=ICONS.subtitle;
        sub.onclick = (e) => { e.stopPropagation(); startAutomation(); };
        const yt = document.createElement('button'); yt.className='uvc-icon-btn'; yt.innerHTML=ICONS.youtube;
        yt.onclick=(e)=>{ e.stopPropagation(); openInRVX(); };
        icons.append(dl, sub, yt);
        mainPanel.appendChild(icons);
    }

    // ==========================================
    // RYD Stats
    // ==========================================
    async function fetchRYDStats(videoId) {
        try {
            const res = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`);
            if (!res.ok) return { error: true };
            return await res.json();
        } catch (e) { return { error: true }; }
    }

    // ==========================================
    // コメント検索・返信・翻訳
    // ==========================================
    function renderCommentSearchPanel(video, videoId) {
        if(!mainPanel) return;
        mainPanel.innerHTML = '';

        // Header
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.style.flex = 'none'; back.style.width = '60px';
        back.onclick=(e)=>{ e.stopPropagation(); renderMainPanel(video); };
        header.appendChild(back);
        mainPanel.appendChild(header);

        // Controls
        const ctrlRow = document.createElement('div'); ctrlRow.className = 'uvc-row';
        const sInput = document.createElement('input'); sInput.className = 'uvc-input'; 
        sInput.placeholder = '検索'; sInput.style.flex = 1; sInput.onclick=(e)=>e.stopPropagation();
        const sBtn = document.createElement('button'); sBtn.className = 'uvc-btn'; sBtn.innerText = '🔍';
        sBtn.style.flex = 'none'; sBtn.style.width = '30px';
        ctrlRow.append(sInput, sBtn);
        mainPanel.appendChild(ctrlRow);

        const sortRow = document.createElement('div'); sortRow.className = 'uvc-row'; sortRow.style.marginTop = '6px';
        const btnPop = document.createElement('button'); btnPop.className='uvc-btn'; btnPop.innerText='人気順';
        const btnNew = document.createElement('button'); btnNew.className='uvc-btn'; btnNew.innerText='新しい順';
        const langSel = document.createElement('select'); 
        langSel.className='uvc-input'; langSel.style.flex=1; langSel.onclick=(e)=>e.stopPropagation();
        ['全言語', '日本語', '英語', '中国語', '韓国語', 'ロシア語'].forEach(l => {
            const opt = document.createElement('option'); opt.value = l; opt.innerText = l;
            langSel.appendChild(opt);
        });
        sortRow.append(btnPop, btnNew, langSel);
        mainPanel.appendChild(sortRow);

        // Results
        const resultsDiv = document.createElement('div'); resultsDiv.className = 'uvc-comment-list';
        mainPanel.appendChild(resultsDiv);

        const doSearch = (mode, query = "") => {
            resultsDiv.innerHTML = '<div style="text-align:center;padding:10px;">読込中...</div>';
            fetchComments(videoId, mode, query, langSel.value).then(comments => {
                resultsDiv.innerHTML = '';
                if (!comments || comments.length === 0) {
                    resultsDiv.innerHTML = '<div style="text-align:center;padding:10px;">コメントが見つかりませんでした</div>';
                    return;
                }
                
                // コメント描画ループ
                comments.forEach(c => {
                    // 親要素
                    const item = document.createElement('div'); item.className='uvc-comment-item';
                    
                    // ヘッダー（アイコン＋名前）
                    const head = document.createElement('div'); head.className='uvc-comment-header';
                    const avatar = document.createElement('img'); avatar.className='uvc-comment-avatar'; 
                    avatar.src = c.authorImg; 
                    const auth = document.createElement('div'); auth.className='uvc-comment-author'; auth.innerText = c.author;
                    head.append(avatar, auth);

                    // 本文
                    const txt = document.createElement('div'); txt.className='uvc-comment-text'; txt.innerText = c.text;
                    item.append(head, txt);

                    // 翻訳自動実行（英語/中国語/韓国語/ロシア語の場合）
                    detectAndTranslate(c.text, item);

                    // 返信機能
                    if (c.replyCount > 0) {
                        const replyContainer = document.createElement('div');
                        replyContainer.className = 'uvc-reply-container';
                        
                        // 返信表示ボタン
                        const showRepBtn = document.createElement('button');
                        showRepBtn.className = 'uvc-reply-btn';
                        showRepBtn.innerText = `▼ ${c.replyCount}件の返信を表示`;
                        
                        const repList = document.createElement('div');
                        repList.className = 'uvc-reply-list';
                        repList.style.display = 'none';

                        // 既に取得済みの返信を描画
                        if (c.replies && c.replies.length > 0) {
                            c.replies.forEach(r => {
                                const rItem = document.createElement('div');
                                rItem.style.borderTop = "1px solid #eee";
                                rItem.style.paddingTop = "4px";

                                const rHead = document.createElement('div'); rHead.className='uvc-comment-header';
                                const rAv = document.createElement('img'); rAv.className='uvc-comment-avatar'; rAv.style.width='20px'; rAv.style.height='20px';
                                rAv.src = r.snippet.authorProfileImageUrl;
                                const rAu = document.createElement('div'); rAu.className='uvc-comment-author'; rAu.innerText = r.snippet.authorDisplayName;
                                rHead.append(rAv, rAu);

                                const rTxt = document.createElement('div'); rTxt.className='uvc-comment-text'; rTxt.innerText = r.snippet.textDisplay;
                                rItem.append(rHead, rTxt);
                                
                                // 返信の翻訳
                                detectAndTranslate(r.snippet.textDisplay, rItem);

                                repList.appendChild(rItem);
                            });
                        }

                        showRepBtn.onclick = (e) => {
                            e.stopPropagation();
                            if (repList.style.display === 'none') {
                                repList.style.display = 'flex';
                                showRepBtn.innerText = '▲ 返信を隠す';
                            } else {
                                repList.style.display = 'none';
                                showRepBtn.innerText = `▼ ${c.replyCount}件の返信を表示`;
                            }
                        };
                        replyContainer.append(showRepBtn, repList);
                        item.appendChild(replyContainer);
                    }

                    resultsDiv.appendChild(item);
                });
            });
        };

        sBtn.onclick = (e) => { e.stopPropagation(); doSearch('search', sInput.value); };
        btnPop.onclick = (e) => { e.stopPropagation(); doSearch('relevance'); };
        btnNew.onclick = (e) => { e.stopPropagation(); doSearch('time'); };
        langSel.onchange = (e) => { e.stopPropagation(); doSearch('lang_filter'); };
    }

    async function fetchComments(videoId, mode, query = "", lang = "全言語") {
        if (!settings.apiKey) {
            alert('設定画面でYoutube Data APIキーを設定してください。');
            return [];
        }

        let order = 'relevance';
        let searchTerms = '';
        if (mode === 'search') { searchTerms = query; order = 'relevance'; }
        else if (mode === 'time') order = 'time';
        else if (mode === 'relevance' || mode === 'lang_filter') order = 'relevance';
        
        // partにrepliesを追加して返信も取得
        let url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&textFormat=plainText&maxResults=100&videoId=${videoId}&key=${settings.apiKey}`;
        
        if (searchTerms) url += `&searchTerms=${encodeURIComponent(searchTerms)}`;
        else url += `&order=${order}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) {
                console.error(data.error);
                return [];
            }
            const rawItems = data.items || [];
            
            // データ整形（返信含む）
            let items = rawItems.map(item => {
                const snip = item.snippet.topLevelComment.snippet;
                return {
                    author: snip.authorDisplayName,
                    authorImg: snip.authorProfileImageUrl,
                    text: snip.textDisplay,
                    replyCount: item.snippet.totalReplyCount,
                    // 返信データ（存在する場合）
                    replies: (item.replies && item.replies.comments) ? item.replies.comments : []
                };
            });

            if (mode === 'lang_filter' && lang !== '全言語') {
                items = items.filter(c => checkLanguage(c.text, lang));
            }
            return items;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    // ==========================================
    // 翻訳ロジック
    // ==========================================
    function checkLanguage(text, lang) {
        if (lang === '日本語') return /[\u3040-\u309f]/.test(text);
        if (lang === '韓国語') return /[\uac00-\ud7a3]/.test(text);
        if (lang === 'ロシア語') return /[\u0400-\u04ff]/.test(text);
        if (lang === '英語') return /^[\x00-\x7F]+$/.test(text);
        if (lang === '中国語') {
            const hasKanji = /[\u4E00-\u9FFF]/.test(text);
            const hasKana = /[\u3040-\u30FF]/.test(text);
            const hasHangul = /[\uAC00-\uD7A3]/.test(text);
            const hasCyrillic = /[\u0400-\u04FF]/.test(text);
            const hasLatin = /[a-zA-Z]/.test(text);
            return hasKanji && !hasKana && !hasHangul && !hasCyrillic && !hasLatin;
        }
        return true;
    }

    // 翻訳が必要か判断して実行
    function detectAndTranslate(text, container) {
        // 設定URLがなければ何もしない
        if (!settings.transUrl) return;

        // 日本語が含まれていたら翻訳しない（とみなす）
        if (checkLanguage(text, '日本語')) return;

        // 対象言語（英語/中国語/韓国語/ロシア語）かチェック
        const isTarget = checkLanguage(text, '英語') || checkLanguage(text, '中国語') || 
                         checkLanguage(text, '韓国語') || checkLanguage(text, 'ロシア語');
        
        if (isTarget) {
            const transBox = document.createElement('div');
            transBox.className = 'uvc-trans-result';
            transBox.innerText = '翻訳中...';
            container.appendChild(transBox);

            // GAS Web Appへリクエスト
            fetch(`${settings.transUrl}?text=${encodeURIComponent(text)}`)
                .then(r => r.json())
                .then(d => {
                    if(d.translation) transBox.innerText = `翻訳: ${d.translation}`;
                    else transBox.innerText = '翻訳エラー';
                })
                .catch(e => {
                    transBox.innerText = '通信エラー';
                });
        }
    }

    // ==========================================
    // 設定メニュー
    // ==========================================
    function renderSettingsMenu(video) {
        if(!mainPanel) return;
        mainPanel.innerHTML = '';
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.onclick=(e)=>{ e.stopPropagation(); renderMainPanel(video); };
        header.appendChild(back);
        mainPanel.appendChild(header);

        const list = document.createElement('div'); list.className='uvc-sub-view';
        const mkBtn = (txt, fn) => {
            const b = document.createElement('button'); b.className='uvc-btn'; b.innerText=txt; 
            b.style.padding='10px'; b.style.textAlign='left';
            b.onclick=(e)=>{ e.stopPropagation(); fn(); };
            return b;
        };
        list.append(
            mkBtn('標準設定', () => renderStandardSettings(video)),
            mkBtn('保存設定', () => renderSaveSettings(video)),
            mkBtn('モバイル版Youtube、ボタン表示位置', () => renderMobileSettings(video)),
            mkBtn('Youtube Data API', () => renderApiKeySettings(video)),
            mkBtn('翻訳設定 (GAS URL)', () => renderTransSettings(video)) // 新規追加
        );
        mainPanel.appendChild(list);
    }

    function renderApiKeySettings(video) {
        mainPanel.innerHTML = '';
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.onclick=(e)=>{ e.stopPropagation(); renderSettingsMenu(video); };
        const save = document.createElement('button'); save.innerText='保存'; save.className='uvc-btn';
        save.onclick=(e)=>{
            e.stopPropagation();
            const key = document.getElementById('uvc-api-key').value;
            settings.apiKey = key.trim();
            saveSettings();
            alert('API Keyを保存しました');
            renderSettingsMenu(video);
        };
        header.append(back, save);
        mainPanel.appendChild(header);

        const box = document.createElement('div'); box.className='uvc-sub-view';
        const block = document.createElement('div'); block.className='uvc-block';
        block.innerHTML = '<span class="uvc-label">API Keyを入力</span>';
        const inp = document.createElement('input'); 
        inp.id = 'uvc-api-key'; inp.className='uvc-input'; inp.style.width='100%';
        inp.value = settings.apiKey || ''; inp.onclick=(e)=>e.stopPropagation();
        block.appendChild(inp);
        box.appendChild(block);
        mainPanel.appendChild(box);
    }

    // 翻訳設定画面
    function renderTransSettings(video) {
        mainPanel.innerHTML = '';
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.onclick=(e)=>{ e.stopPropagation(); renderSettingsMenu(video); };
        const save = document.createElement('button'); save.innerText='保存'; save.className='uvc-btn';
        save.onclick=(e)=>{
            e.stopPropagation();
            const url = document.getElementById('uvc-trans-url').value;
            settings.transUrl = url.trim();
            saveSettings();
            alert('翻訳URLを保存しました');
            renderSettingsMenu(video);
        };
        header.append(back, save);
        mainPanel.appendChild(header);

        const box = document.createElement('div'); box.className='uvc-sub-view';
        const block = document.createElement('div'); block.className='uvc-block';
        block.innerHTML = '<span class="uvc-label">GAS Web App URLを入力</span><small style="font-size:10px;color:#666;">※LanguageAppを使用するGASをデプロイし、URLを入力してください</small>';
        const inp = document.createElement('input'); 
        inp.id = 'uvc-trans-url'; inp.className='uvc-input'; inp.style.width='100%';
        inp.placeholder = 'https://script.google.com/macros/s/...'
        inp.value = settings.transUrl || ''; inp.onclick=(e)=>e.stopPropagation();
        block.appendChild(inp);
        box.appendChild(block);
        mainPanel.appendChild(box);
    }

    function renderStandardSettings(video) {
        mainPanel.innerHTML = '';
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.onclick=(e)=>{ e.stopPropagation(); renderSettingsMenu(video); };
        const save = document.createElement('button'); save.innerText='保存'; save.className='uvc-btn';
        save.onclick=(e)=>{ e.stopPropagation(); saveSettings(); renderSettingsMenu(video); };
        header.append(back, save);
        mainPanel.appendChild(header);

        const addRow = document.createElement('div'); addRow.className='uvc-row';
        const dIn = document.createElement('input'); dIn.className='uvc-input'; dIn.placeholder='ドメイン'; dIn.style.flex=1; dIn.onclick=(e)=>e.stopPropagation();
        const sIn = document.createElement('input'); sIn.className='uvc-input'; sIn.placeholder='速度'; sIn.style.width='40px'; sIn.onclick=(e)=>e.stopPropagation();
        const qIn = document.createElement('input'); qIn.className='uvc-input'; qIn.placeholder='画質'; qIn.style.width='50px'; qIn.onclick=(e)=>e.stopPropagation();
        
        const addB = document.createElement('button'); addB.className='uvc-btn'; addB.innerText='追加';
        addB.onclick = (e) => {
            e.stopPropagation();
            if(dIn.value) {
                settings.domains[dIn.value] = { speed: parseFloat(sIn.value)||1, quality: qIn.value||'1080P' };
                renderStandardSettings(video);
            }
        };
        addRow.append(dIn, sIn, qIn, addB);
        mainPanel.appendChild(addRow);

        const listDiv = document.createElement('div'); listDiv.style.maxHeight='250px'; listDiv.style.overflowY='auto'; listDiv.style.marginTop='10px';
        Object.keys(settings.domains).forEach(dom => {
            const item = document.createElement('div'); item.className='uvc-list-item';
            const dat = settings.domains[dom];
            item.innerHTML = `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${dom}</span><span style="margin:0 5px;">${dat.speed}x</span><span>${dat.quality}</span>`;
            const del = document.createElement('button'); del.className='uvc-btn'; del.innerText='削除'; del.style.marginLeft='5px'; del.style.flex='none';
            del.onclick = (e) => { e.stopPropagation(); delete settings.domains[dom]; renderStandardSettings(video); };
            item.appendChild(del);
            listDiv.appendChild(item);
        });
        mainPanel.appendChild(listDiv);
    }

    function renderSaveSettings(video) {
        mainPanel.innerHTML = '';
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.onclick=(e)=>{ e.stopPropagation(); renderSettingsMenu(video); };
        const save = document.createElement('button'); save.innerText='保存'; save.className='uvc-btn';
        save.onclick=(e)=>{
            e.stopPropagation();
            const soul = document.getElementById('uvc-rb-soul');
            settings.save_mode = soul.checked ? 'soul' : 'ytdlp';
            const dir = document.getElementById('uvc-dir-in');
            if(dir) settings.save_dir = dir.value;
            saveSettings(); renderSettingsMenu(video);
        };
        header.append(back, save);
        mainPanel.appendChild(header);
        const box = document.createElement('div'); box.className='uvc-sub-view';
        const lb1 = document.createElement('label'); lb1.className='uvc-checkbox-label';
        const rb1 = document.createElement('input'); rb1.type='radio'; rb1.name='smode'; rb1.id='uvc-rb-soul';
        rb1.checked = settings.save_mode === 'soul'; rb1.onclick=(e)=>e.stopPropagation();
        lb1.append(rb1, document.createTextNode(' Soul Browserに飛ぶ'));
        const lb2 = document.createElement('label'); lb2.className='uvc-checkbox-label';
        const rb2 = document.createElement('input'); rb2.type='radio'; rb2.name='smode';
        rb2.checked = settings.save_mode === 'ytdlp'; rb2.onclick=(e)=>e.stopPropagation();
        lb2.append(rb2, document.createTextNode(' yt-dlp用のコードをコピー'));
        const dBox = document.createElement('div'); dBox.className='uvc-block';
        dBox.innerHTML = '<span class="uvc-label">保存ディレクトリ</span>';
        const dIn = document.createElement('input'); dIn.id='uvc-dir-in'; dIn.className='uvc-input'; dIn.style.width='90%';
        dIn.value = settings.save_dir; dIn.onclick=(e)=>e.stopPropagation();
        dBox.appendChild(dIn);
        const toggle = () => { dBox.style.display = rb2.checked ? 'block' : 'none'; };
        rb1.onchange=toggle; rb2.onchange=toggle;
        box.append(lb1, lb2, dBox);
        mainPanel.appendChild(box);
        toggle();
    }

    function renderMobileSettings(video) {
        mainPanel.innerHTML = '';
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.onclick=(e)=>{ e.stopPropagation(); renderSettingsMenu(video); };
        const save = document.createElement('button'); save.innerText='保存'; save.className='uvc-btn';
        save.onclick=(e)=>{
            e.stopPropagation();
            // 動画の設定取得
            const vt = parseInt(document.getElementById('mv-top').value)||250;
            const vl = parseInt(document.getElementById('mv-left').value)||0;
            const vs = parseInt(document.getElementById('mv-size').value)||25;
            // ショートの設定取得
            const st = parseInt(document.getElementById('ms-top').value)||0;
            const sl = parseInt(document.getElementById('ms-left').value)||0;
            const ss = parseInt(document.getElementById('ms-size').value)||25;

            settings.mobile_pos = {
                video: { top:vt, left:vl, size:vs },
                shorts: { top:st, left:sl, size:ss }
            };
            saveSettings();
            if(isMobileYouTube) checkMobileHamburger();
            renderSettingsMenu(video);
        };
        header.append(back, save);
        mainPanel.appendChild(header);

        const box = document.createElement('div'); box.className='uvc-sub-view';

        // ヘルパー関数
        const mkSection = (title, prefix, vals) => {
            const sec = document.createElement('div');
            sec.className = 'uvc-block';
            sec.style.marginBottom = '15px';
            sec.innerHTML = `<span class="uvc-label">${title}</span>`;
            
            const mkRow = (lbl, id, val) => {
                const r = document.createElement('div'); r.className='uvc-row';
                r.innerHTML = `<span style="width:50px;">${lbl}</span>`;
                const i = document.createElement('input'); i.id=id; i.type='number'; 
                i.className='uvc-input'; i.value=val; i.onclick=(e)=>e.stopPropagation();
                r.append(i, document.createTextNode('px')); return r;
            };

            sec.append(
                mkRow('上から', prefix + '-top', vals.top),
                mkRow('左から', prefix + '-left', vals.left),
                mkRow('大きさ', prefix + '-size', vals.size)
            );
            return sec;
        };

        // 動画セクション
        const vPos = settings.mobile_pos.video || { top: 250, left: 0, size: 25 };
        box.appendChild(mkSection('動画', 'mv', vPos));

        // ショートセクション
        const sPos = settings.mobile_pos.shorts || { top: 0, left: 0, size: 25 };
        box.appendChild(mkSection('ショート', 'ms', sPos));

        mainPanel.appendChild(box);
    }

    function renderYtdlpSelector(video) {
        mainPanel.innerHTML = '';
        const header = document.createElement('div'); header.className='uvc-sub-header';
        const back = document.createElement('button'); back.innerText='←戻る'; back.className='uvc-btn';
        back.onclick=(e)=>{ e.stopPropagation(); renderMainPanel(video); };
        header.appendChild(back);
        mainPanel.appendChild(header);

        const box = document.createElement('div'); box.className='uvc-sub-view';
        const aud = document.createElement('button'); aud.className='uvc-btn'; aud.innerText='音声のみ'; aud.style.marginBottom='10px';
        aud.onclick=(e)=>{ e.stopPropagation(); copyYtdlp('audio'); };
        box.appendChild(aud);
        const row = document.createElement('div'); row.className='uvc-row';
        ['480', '720', '1080', '2160'].forEach(q => {
            const b = document.createElement('button'); b.className='uvc-btn'; b.innerText=q;
            b.onclick=(e)=>{ e.stopPropagation(); copyYtdlp(q); };
            row.appendChild(b);
        });
        box.appendChild(row);
        mainPanel.appendChild(box);
    }

    // ==========================================
    // 共通アクション
    // ==========================================
    function changeSpeed(video, rate) {
        if (!video) return;
        video.playbackRate = rate;
        if (settings.domains[hostname]) {
            settings.domains[hostname].speed = rate;
            saveSettings();
        }
    }

    function changeQuality(label) {
        if (!isYouTube) return;
        const apiQ = QUALITY_MAP[label] || 'hd1080';
        const s = document.createElement('script');
        s.textContent = `
            (function(){
                try{
                    var p=document.getElementById('movie_player')||document.querySelector('.html5-video-player');
                    if(p&&p.setPlaybackQualityRange) p.setPlaybackQualityRange('${apiQ}','${apiQ}');
                    var sh=document.querySelector('[is-active]');
                    if(sh&&sh.player) sh.player.setPlaybackQualityRange('${apiQ}','${apiQ}');
                }catch(e){}
            })();
        `;
        (document.head || document.documentElement).appendChild(s);
        s.remove();
        if (settings.domains[hostname]) {
            settings.domains[hostname].quality = label;
            saveSettings();
        }
    }

    function checkAndApplySettings() {
        const d = settings.domains[hostname];
        if (!d) return;
        let currentId = location.href;
        if (isYouTube) {
            const vid = getYouTubeVideoId();
            if (vid) currentId = vid;
        }
        if (currentId !== lastAppliedUrl) {
            const v = document.querySelector('video');
            if (v && !v.paused) { 
                v.playbackRate = d.speed;
                if(isYouTube) changeQuality(d.quality);
                console.log(`UVC: Standard settings applied for ${currentId}`);
                lastAppliedUrl = currentId; 
            }
        }
    }

    function getYouTubeVideoId() {
        if (location.pathname.startsWith('/shorts/')) return location.pathname.split('/shorts/')[1].split('?')[0];
        if (location.href.includes('youtu.be')) return location.pathname.slice(1);
        return new URLSearchParams(location.search).get('v');
    }

    function handleDownload(video) {
        if (isMobileYouTube) {
            const id = getYouTubeVideoId();
            if (id) location.href = `intent://youtube.com/watch?v=${id}#Intent;package=org.schabi.newpipe;scheme=http;launchFlags=0x10000000;end;`;
        } else {
            if (settings.save_mode === 'soul') {
                const u = location.href.replace(/^https?:\/\//, '');
                const p = location.protocol.replace(':', '');
                location.href = `intent://${u}#Intent;scheme=${p};package=com.mycompany.app.soulbrowser;end`;
            } else {
                renderYtdlpSelector(video);
            }
        }
    }

    function copyYtdlp(mode) {
        const url = location.href;
        let d = settings.save_dir;
        if (!d.endsWith('/')) d += '/';
        let cmd = '';
        if (mode === 'audio') {
            cmd = `yt-dlp -x --audio-format m4a -o "${d}%(title)s.%(ext)s" "${url}"`;
        } else {
            cmd = `yt-dlp -f "bestvideo[height=${mode}]+bestaudio/best[height=${mode}]" -o "${d}%(title)s.%(ext)s" "${url}"`;
        }
        
        navigator.clipboard.writeText(cmd).then(() => {
            alert('クリップボードにコピーしました:\n' + cmd);
            mainPanel.classList.remove('show');
        }).catch(e => {
            prompt('コピーに失敗しました。', cmd);
        });
    }

    function openInRVX() {
        try {
            const id = getYouTubeVideoId();
            if (!id) return alert('動画ID取得不可');
            location.href = `intent://www.youtube.com/watch?v=${id}#Intent;package=app.rvx.android.youtube;scheme=https;end`;
        } catch(e) { alert(e); }
    }

    async function startAutomation() {
      const isMobile = window.location.hostname === "m.youtube.com";
      if (isMobile) {
        const subtitleUrl = "https://subtitle.to/" + location.href;
        window.open(subtitleUrl, '_blank');
      } else {
        showToast("PC版: 字幕取得を開始...");
        await handleDesktop();
        showToast("字幕コピー完了！");
      }
    }

    async function handleDesktop() {
      try {
        const expandBtn = document.querySelector('#expand');
        if (expandBtn && !expandBtn.hidden) expandBtn.click();
        await wait(500);
        const buttons = Array.from(document.querySelectorAll('button, tp-yt-paper-button'));
        const transcriptBtn = buttons.find(b => b.innerText.includes("文字起こしを表示"));
        if (!transcriptBtn) throw new Error("文字起こしボタンが見つかりません");
        transcriptBtn.click();
        const transcriptContainer = await waitForElement('ytd-transcript-segment-renderer', 5000);
        if (!transcriptContainer) throw new Error("字幕パネルが開きませんでした");
        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        const texts = Array.from(segments)
          .map(seg => seg.querySelector('.segment-text')?.innerText.replace(/\n/g, " ") || "")
          .filter(t => t.length > 0)
          .join("\n");
        await copyToClipboard(texts);
      } catch (err) {
        console.error(err);
        showToast("エラー: " + err.message);
      }
    }

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    function waitForElement(selector, timeout = 3000) {
      return new Promise(resolve => {
        if (document.querySelector(selector)) return resolve(document.querySelector(selector));
        const observer = new MutationObserver(() => {
          if (document.querySelector(selector)) {
            resolve(document.querySelector(selector));
            observer.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
      });
    }

    async function copyToClipboard(text) {
        if (!text) return;
        try { await navigator.clipboard.writeText(text); }
        catch { 
            const ta = document.createElement("textarea"); ta.value = text;
            document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        }
    }

    function showToast(message) {
        const old = document.getElementById("yt-copy-toast"); if (old) old.remove();
        const toast = document.createElement("div"); toast.id="yt-copy-toast"; toast.innerText=message;
        toast.style=`position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
            z-index:99999; background:rgba(0,0,0,.8); color:#fff; padding:12px 20px;
            border-radius:8px; font-size:14px; font-weight:bold; pointer-events:none;`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),4000);
    }

})();