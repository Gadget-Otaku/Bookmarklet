javascript:

(function() {
    'use strict';
    const config = {
        scale: 80,
        gridCols: 5,
        gridRows: 4,
        topOffset: 80,
        leftOffset: -460
    };

    const items = [
        {
            name: "YouTube",
            url: "https://www.youtube.com",
            icon: "https://images.icon-icons.com/1584/PNG/512/3721679-youtube_108064.png"
        },
        {
            name: "X",
            url: "https://x.com/home",
            icon: "https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg"
        },
        {
            name: "ChatGPT",
            url: "https://chatgpt.com/?model=auto",
            icon: "https://i.pinimg.com/736x/a6/8e/fc/a68efcad5debfbe207f52e8c19b379e9.jpg"
        },
        {
            name: "DeepSeek",
            url: "https://chat.deepseek.com",
            icon: "https://play-lh.googleusercontent.com/d2zqBFBEymSZKaVg_dRo1gh3hBFn7_Kl9rO74xkDmnJeLgDW0MoJD3cUx0QzZN6jdsg"
        },
        {
            name: "Gemini",
            url: "https://gemini.google.com/app?hl=ja",
            icon: "https://asset.watch.impress.co.jp/img/ktw/docs/1583/273/icon_l.jpg"
        },
        {
            name: "Astate",
            url: "https://www.astate.edu",
            icon: "https://www.astate.edu/dotAsset/dab6dbb0-0dae-439c-b6d6-1e729565418a.png"
        },
        {
            name: "Dashboard",
            url: "https://pack.astate.edu/public/dashboard",
            icon: "https://www.google.com/s2/favicons?sz=64&domain_url=pack.astate.edu"
        },
        {
            name: "大学関連",
            isFolder: true,
            children: [
            {
                name: "mybill",
                url: "https://epay.astate.edu/C20019_tsa/web/login.jsp",
                icon: "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://epay.astate.edu/C20019_tsa/web/login.jsp&size=16"
            },
            {
                name: "Housing",
                url: "https://astate.starrezhousing.com/StarRezPortalX/FC6488C4/1/1/Home-Welcome_to_the_A_Sta?UrlToken=A0AC9875",
                icon: "https://iconbox.fun/wp/wp-content/uploads/192_b_24.png"
            },
            {
                name: "バス",
                url: "https://www.astate.edu/a/global-initiatives/international/forms/student-advising",
                icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsKEzw38TGeOe-kK91Wsvg05lgWbxyQj57DQ&s"
            },
            {
                name: "ｽｹｼﾞｭ-ﾙ",
                url: "https://catalog.astate.edu/preview_program.php?catoid=8&poid=2347&returnto=244",
                icon: "https://img.icons8.com/color/512/google-logo.png"
            },
            {
                name: "英語 教材",
                url: "https://asuj.grlcontent.com/user/login?autologout_timeout=1",
                icon: "https://play-lh.googleusercontent.com/Z567KavO3EE8mxGFtzgGrCkEtdljuySFNqxlaWACW5lcrksBUXC4CA0kHLJ0gYgoy5Y=w240-h480-rw"
            },
            {
                name: "教材 bookstore",
                url: "https://astatebookstore.com/textbooks",
                icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsE604CUZK43liZCcbSISUiHL9CoMB8AJxJg&s"
            },
            {
                name: "vitalsource",
                url: "https://bookshelf.vitalsource.com/home/dashboard?context=login",
                icon: "https://store-images.s-microsoft.com/image/apps.15180.14164704504445663.3fbcf2df-8bab-4f09-822a-094d3f6ef53e.b6ea252f-f946-4acc-96c0-e2dc7370daf8"
            },
            {
                name: "食事 時間",
                url: "https://astate.sodexomyway.com/en-us/locations/",
                icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp0r7Ed3_kbqc9UumdzCIDUtuxts-qjAewBA&s"
            }
        ]
        },
        {
            name: "Outlook",
            url: "https://outlook.office365.com/mail/",
            icon: "https://cdn.iconscout.com/icon/free/png-256/free-microsoft-outlook-1868952-1583116.png"
        },
        {
            name: "Gmail",
            url: "https://mail.google.com/mail/u/1/#inbox",
            icon: "https://img.icons8.com/color/512/gmail-new.png"
        },
        {
            name: "Github",
            url: "https://github.com",
            icon: "https://cdn-icons-png.freepik.com/256/733/733609.png"
        },
        {
            name: "GreasyFork",
            url: "https://greasyfork.org/ja/users/1433480-%E3%82%B9%E3%83%9E%E3%83%9B%E3%82%AA%E3%82%BF%E3%82%AF%E3%81%AB%E3%82%8F%E3%81%8B",
            icon: "https://files.svgcdn.io/simple-icons/greasyfork.svg"
        },
        {
            name: "メモ帳2.0",
            url: "https://gadget-otaku.github.io/Bookmarklet/%E3%83%A1%E3%83%A2%E5%B8%B32.0",
            icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmsAZYI27WQaMCSK-W8M-1FoW4Tx-0BWk6dA&s"
        },
        {
            name: "制作",
            isFolder: true,
            children: [
            {
                name: "(beta)Googleショートカット",
                url: "https://gadget-otaku.github.io/Bookmarklet/(beta)Google%E3%83%9B%E3%83%BC%E3%83%A0%E3%83%9A%E3%83%BC%E3%82%B8%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%82%AB%E3%83%83%E3%83%88%E3%82%AD%E3%83%BC%E9%85%8D%E7%BD%AEUserScript%E7%94%9F%E6%88%90%E3%83%BB%E7%B7%A8%E9%9B%86%E3%83%84%E3%83%BC%E3%83%AB%20JavaScript%E3%83%BB%E8%A6%AA%E9%9A%8E%E5%B1%A4%E7%A7%BB%E5%8B%95%E5%AF%BE%E5%BF%9C",
                icon: "https://img.icons8.com/color/512/google-sites--v2.png"
            },
            {
                name: "ツールパネル",
                url: "https://sites.google.com/view/toolpaneleditor/%E3%83%9B%E3%83%BC%E3%83%A0",
                icon: "https://img.icons8.com/color/512/google-sites--v2.png"
            },
            {
                name: "site:検索",
                url: "https://sites.google.com/view/site-search-multi-function/%E3%83%9B%E3%83%BC%E3%83%A0",
                icon: "https://img.icons8.com/color/512/google-sites--v2.png"
            },
            {
                name: "サイト",
                url: "https://sites.google.com/new?hl=ja",
                icon: "https://img.icons8.com/color/512/google-sites--v2.png"
            },
            {
                name: "UserScript",
                url: "https://sites.google.com/view/userscriptgenerator/%E3%83%9B%E3%83%BC%E3%83%A0",
                icon: "https://img.icons8.com/color/512/google-sites--v2.png"
            }
        ]
        },
        {
            name: "Notion",
            url: "https://www.notion.so/2f61b782539d4036bef474f820fa42c2",
            icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1024px-Notion-logo.svg.png"
        },
        {
            name: "365",
            url: "https://m365.cloud.microsoft/?acctsw=1&auth=1",
            icon: "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/Icon_Copilot_64x64?resMode=sharp2&op_usm=1.5,0.65,15,0&wid=32&hei=32&qlt=100&fit=constrain"
        },
        {
            name: "翻訳",
            url: "https://translate.google.co.jp/?hl=ja&tab=rT&sl=en&tl=ja&op=translate",
            icon: "https://play-lh.googleusercontent.com/ZrNeuKthBirZN7rrXPN1JmUbaG8ICy3kZSHt-WgSnREsJzo2txzCzjIoChlevMIQEA=w240-h480-rw"
        },
        {
            name: "アドオン",
            isFolder: true,
            children: [
            {
                name: "Chrome拡張機能",
                url: "https://chromewebstore.google.com/category/extensions?hl=ja",
                icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Google_Chrome_Web_Store_icon_2022.svg/2356px-Google_Chrome_Web_Store_icon_2022.svg.png"
            },
            {
                name: "Firefoxアドオン",
                url: "https://addons.mozilla.org/ja/firefox/",
                icon: "https://play-lh.googleusercontent.com/zqsuwFUBwKRcGOSBinKQCL3JgfvOW49vJphq0ZF32aDgfqmuDyl-fEpx4Lxm4pRr7A=s256-rw"
            },
            {
                name: "Edgeアドオン",
                url: "https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=ja-jp",
                icon: "https://images.icon-icons.com/2429/PNG/512/microsoft_logo_icon_147261.png"
            }
        ]
        },
        {
            name: "IBT・TOEIC・就活",
            isFolder: true,
            children: [
            {
                name: "IBT",
                url: "https://toeflibt.ets.org/home",
                icon: "https://titc.or.id/wp-content/uploads/2025/04/TOEFL-IBT-Home-Edition.png"
            }
        ]
        }
    ];
    
    const urlRules = [
    {
        "url": "https://www.google.com/",
        "color": "black"
    },
    {
        "url": "https://gadget-otaku.github.io/Bookmarklet/%E3%83%A1%E3%83%A2%E5%B8%B32.0",
        "color": "black"
    }
];

    const styleText = `
      :root {
        --item-size: 72px;
        --icon-size: 40px;
        --folder-size: 40px;
        --border-radius: 12px;
      }
      .panel-style {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
        border-radius: var(--border-radius);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2), inset 0 1px 1px rgba(255,255,255,0.4);
        padding: 20px; position: fixed;
      }
      .custom-shortcuts-container {
        transform: scale(${config.scale / 100});
        transform-origin: top left; display: grid;
        grid-template-columns: repeat(${config.gridCols}, var(--item-size));
        grid-template-rows: repeat(${config.gridRows}, var(--item-size));
        gap: 15px; z-index: 9999; pointer-events: auto; cursor: move;
      }
      .panel-controls {
        position: absolute; top: 8px; right: 8px; display: flex; gap: 8px; cursor: default;
      }
      .control-button {
        width: 16px; height: 16px; border-radius: 50%; display: flex;
        align-items: center; justify-content: center; font-family: sans-serif;
        font-size: 12px; line-height: 16px; cursor: pointer; transition: color 0.2s;
        user-select: none; background-color: rgba(0, 0, 0, 0.7);
      }
      .settings-button {
        width: 16px; height: 16px;
        cursor: pointer;
        background-image: url('https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_haguruma_1.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        filter: invert(1);
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      .settings-button:hover {
        opacity: 1;
      }
      .custom-shortcut {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-decoration: none; width: var(--item-size); height: var(--item-size);
        transition: all 0.2s; border-radius: var(--border-radius);
        padding: 4px; box-sizing: border-box; cursor: pointer;
      }
      .custom-shortcut:hover {
        transform: translateY(-5px); background: rgba(255,255,255,0.3);
      }
      .custom-shortcut img, .custom-shortcut .folder-icon-preview {
        width: var(--icon-size); height: var(--icon-size);
        object-fit: contain; border-radius: calc(var(--border-radius) * 0.5);
      }
      .custom-shortcut span {
        font-size: 12px; margin-top: 6px; text-align: center;
        width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        transition: color 0.3s;
      }
      .light-text .custom-shortcut span, .light-text .control-button { color: white !important; }
      .dark-text .custom-shortcut span, .dark-text .control-button { color: black !important; }
      .custom-folder .folder-icon-preview {
        display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
        gap: 2px; padding: 2px; width: var(--folder-size); height: var(--folder-size);
        background: rgba(0,0,0,0.1); border-radius: var(--border-radius);
      }
      .folder-icon-preview .preview-icon {
        width: 95%; height: 95%; background-size: contain;
        background-repeat: no-repeat; background-position: center; border-radius: 4px;
      }
      .folder-contents-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px);
        z-index: 10000; display: flex; align-items: center; justify-content: center;
        animation: blurFadeIn 0.3s ease-out forwards;
      }
      .folder-contents {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; max-width: 400px;
        transform: scale(0.8); opacity: 0; animation: scaleUp 0.15s ease-out 0.05s forwards;
        position: relative;
      }
      @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      @keyframes blurFadeIn { to { background: rgba(0,0,0,0); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); } }
      @keyframes blurFadeOut { from { background: rgba(0,0,0,0); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); } to { background: rgba(0,0,0,0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); } }
      @keyframes scaleDown { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }
      .folder-contents-overlay.closing { animation: blurFadeOut 0.3s ease-out forwards; }
      .folder-contents.closing { animation: scaleDown 0.3s ease-in forwards; }
    `;

    let isDarkMode = false;
    const container = document.createElement('div');
    const controls = document.createElement('div');
    const settingsBtn = document.createElement('div');
    const toggleModeBtn = document.createElement('div');

    function applyTheme(isDark) {
        isDarkMode = isDark;
        container.classList.toggle('dark-text', isDarkMode);
        container.classList.toggle('light-text', !isDarkMode);
        toggleModeBtn.textContent = isDarkMode ? '●' : '◯';
    }

    function createShortcut(item) {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = "custom-shortcut";
        const img = document.createElement('img');
        try {
            img.src = item.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${new URL(item.url).hostname}`;
        } catch(e) { img.src = ''; }
        img.alt = item.name;
        img.onerror = (e) => { e.target.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; };
        const span = document.createElement('span');
        span.textContent = item.name;
        link.appendChild(img);
        link.appendChild(span);
        return link;
    }

    function createFolder(item) {
        const folder = document.createElement('div');
        folder.className = "custom-shortcut custom-folder";
        const preview = document.createElement('div');
        preview.className = 'folder-icon-preview';
        item.children.slice(0, 9).forEach(child => {
            if (child.icon) {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'preview-icon';
                iconDiv.style.backgroundImage = `url(${child.icon})`;
                preview.appendChild(iconDiv);
            }
        });
        const span = document.createElement('span');
        span.textContent = item.name;
        folder.appendChild(preview);
        folder.appendChild(span);
        folder.addEventListener('click', (e) => {
            e.stopPropagation();
            const overlay = document.createElement('div');
            overlay.className = 'folder-contents-overlay';
            const contents = document.createElement('div');
            contents.className = 'folder-contents panel-style';
            contents.classList.toggle('dark-text', isDarkMode);
            contents.classList.toggle('light-text', !isDarkMode);
            item.children.forEach(child => {
                if (!child.isFolder) { contents.appendChild(createShortcut(child)); }
            });
            overlay.appendChild(contents);
            document.body.appendChild(overlay);
            overlay.addEventListener('click', (ev) => {
                if (ev.target === overlay) {
                    overlay.classList.add('closing');
                    contents.classList.add('closing');
                    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
                }
            });
        });
        return folder;
    }

    container.className = "custom-shortcuts-container panel-style";
    controls.className = 'panel-controls';
    settingsBtn.className = 'settings-button';
    toggleModeBtn.className = 'control-button toggle-mode-btn';
    const closeBtn = document.createElement('div');
    closeBtn.className = 'control-button close-btn';
    closeBtn.textContent = '✕';
    controls.appendChild(settingsBtn);
    controls.appendChild(toggleModeBtn);
    controls.appendChild(closeBtn);
    container.appendChild(controls);

    toggleModeBtn.addEventListener('click', (e) => { e.stopPropagation(); applyTheme(!isDarkMode); });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); container.style.display = 'none'; });

    // 設定ボタンのクリックイベント
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // JSON.stringifyの結果からキーのダブルクオートを削除
        const configString = JSON.stringify(config, null, 4).replace(/"([^"]+)":/g, '$1:');

        // 設定データを文字列として生成
        const textToCopy =
`const config = ${configString};

const items = ${JSON.stringify(items, null, 4)};

const urlRules = ${JSON.stringify(urlRules, null, 4)};`;

        // クリップボードへのコピー処理
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        let copySuccess = false;
        try {
            copySuccess = document.execCommand('copy');
        } catch (err) {
            console.error('設定のコピーに失敗しました。', err);
            copySuccess = false;
        } finally {
            document.body.removeChild(textarea);
        }

        // 結果を通知し、ページを開くか確認
        if (copySuccess) {
            if (confirm('設定をクリップボードにコピーしました。\n\nOKを押すと、設定方法を説明したページを新しいタブで開きます。')) {
                window.open('https://sites.google.com/view/homepage-custom-shortcut/%E3%83%9B%E3%83%BC%E3%83%A0', '_blank');
            }
        } else {
            if (confirm('設定のコピーに失敗しました。\nお使いのブラウザや拡張機能の設定により、コピー機能がブロックされた可能性があります。\n\nOKを押すと、設定方法を説明したページを新しいタブで開きます。手動で設定をコピー＆ペーストしてください。')) {
                window.open('https://sites.google.com/view/homepage-custom-shortcut/%E3%83%9B%E3%83%BC%E3%83%A0', '_blank');
            }
        }
    });

    items.slice(0, config.gridCols * config.gridRows).forEach(item => {
        container.appendChild(item.isFolder ? createFolder(item) : createShortcut(item));
    });
    
    function makeDraggableAndPosition(element) {
        setTimeout(() => {
            const scale = config.scale / 100;
            const rect = element.getBoundingClientRect();
            const containerWidth = rect.width / scale;
            const initialLeft = (window.innerWidth / 2) + config.leftOffset - (containerWidth / 2);
            element.style.left = `${initialLeft}px`;
            element.style.top = `${config.topOffset}px`;
        }, 0);
        let startX, startY, startLeft, startTop;
        element.addEventListener('mousedown', (e) => {
            if (e.target.closest('.custom-shortcut, .panel-controls')) { return; }
            e.preventDefault();
            const scale = config.scale / 100;
            startX = e.clientX; startY = e.clientY;
            startLeft = element.offsetLeft; startTop = element.offsetTop;
            function onMouseMove(e) {
                element.style.left = `${startLeft + ((e.clientX - startX) / scale)}px`;
                element.style.top = `${startTop + ((e.clientY - startY) / scale)}px`;
            }
            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // --- Initialization ---
    // 既存のパネルがあれば削除
    const existingPanel = document.querySelector('.custom-shortcuts-container');
    if (existingPanel) {
        existingPanel.remove();
    }
    document.body.appendChild(container);
    makeDraggableAndPosition(container);

    let initialThemeIsDark = false;
    const currentUrl = window.location.href;
    let ruleApplied = false;

    if (urlRules && urlRules.length > 0) {
        for (const rule of urlRules) {
            if (currentUrl === rule.url) {
                initialThemeIsDark = (rule.color === 'black');
                ruleApplied = true;
                break;
            }
        }
    }

    if (!ruleApplied) {
        if (currentUrl.endsWith('/1')) { initialThemeIsDark = true; } 
        else if (currentUrl.endsWith('/0')) { initialThemeIsDark = false; }
    }
    
    applyTheme(initialThemeIsDark);

    const styleTag = document.createElement('style');
    styleTag.textContent = styleText;
    document.head.appendChild(styleTag);
})();