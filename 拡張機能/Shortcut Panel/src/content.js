(function() {
  'use strict';

  // ==========================================
  // 定数・初期設定
  // ==========================================
  const STORAGE_KEY = 'shortcut_panel_data_v19';
  const CACHE_KEY = 'shortcut_panel_icon_cache_v19';
  const ICON_MAX_SIZE = 64; 

  const DEFAULT_CONFIG = {
    settings: {
      scale: 75, gridCols: 5, gridRows: 4,
      folderScale: 100, folderGridCols: 4, folderGridRows: 4,
      position: { yProp: 'top', yVal: 10, xProp: 'left', xVal: 10 },
      baseTextColor: 'white',
      colorRules: [],
      animation: { main: 0.2, sub: 0.2 },
      closeOnOutsideClick: { site: false, button: false, keyboard: false }
    },
    items: [
      { name: "Google", url: "https://www.google.com", icon: "https://www.google.com/s2/favicons?sz=64&domain_url=google.com" },
      { name: "YouTube", url: "https://www.youtube.com", icon: "https://www.google.com/s2/favicons?sz=64&domain_url=youtube.com" }
    ],
    rules: {
      sites: [
        { isAll: false, includes: [{url: 'https://www.google.com/', ruleType: 'exact'}], isExcludeAll: false, excludes: [] }
      ],
      buttons: [],
      keyboards: []
    }
  };

  let config = null;
  let iconCache = {}; 
  let isDarkMode = false;
  let initialIsDarkMode = false; 
  let newTabMode = false;
  let panelContainer = null;
  let isAnimating = false;
  let keyHandler = null;
  let outsideClickHandler = null;

  // ==========================================
  // ユーティリティ
  // ==========================================
  async function loadConfig() {
    try {
      const res = await browser.storage.local.get([STORAGE_KEY, CACHE_KEY]);
      if (res && res[STORAGE_KEY]) {
        config = res[STORAGE_KEY];
        iconCache = res[CACHE_KEY] || {};
        
        if(!config.rules) config.rules = JSON.parse(JSON.stringify(DEFAULT_CONFIG.rules));
        if(!config.settings.animation) config.settings.animation = JSON.parse(JSON.stringify(DEFAULT_CONFIG.settings.animation));
        if(!config.settings.closeOnOutsideClick) config.settings.closeOnOutsideClick = JSON.parse(JSON.stringify(DEFAULT_CONFIG.settings.closeOnOutsideClick));
        
        const normalizeRule = (rule) => {
            if (rule.url && !rule.includes) {
                rule.includes = [{url: rule.url, ruleType: rule.ruleType || 'exact'}];
                delete rule.url; delete rule.ruleType;
            }
            if (typeof rule.isAll === 'undefined') rule.isAll = false;
            if (!rule.includes) rule.includes = [];
            if (typeof rule.isExcludeAll === 'undefined') rule.isExcludeAll = false;
            if (!rule.excludes) rule.excludes = [];
        };

        config.rules.sites.forEach(normalizeRule);
        config.rules.buttons.forEach(btn => {
            normalizeRule(btn);
            if (typeof btn.hideOnScroll === 'undefined') btn.hideOnScroll = false;
        });
        config.rules.keyboards.forEach(normalizeRule);

      } else {
        config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        iconCache = {};
      }
    } catch (e) {
      console.error("Config load error:", e);
      config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    return config;
  }

  async function saveConfig() {
    const data = {};
    data[STORAGE_KEY] = config;
    data[CACHE_KEY] = iconCache;
    await browser.storage.local.set(data);
  }

  async function saveColorRuleIfNeeded() {
      if (isDarkMode === initialIsDarkMode) return;

      const origin = window.location.origin; 
      const newColor = isDarkMode ? 'black' : 'white';
      
      let found = false;
      if (!config.settings.colorRules) config.settings.colorRules = [];
      
      for (const rule of config.settings.colorRules) {
          if (rule.url === origin) { 
              rule.color = newColor;
              found = true;
              break;
          }
      }
      if (!found) {
          config.settings.colorRules.push({ url: origin, color: newColor });
      }
      
      await saveConfig();
      initialIsDarkMode = isDarkMode; 
  }

  async function fetchAndResizeImage(url) {
    if (!url || !url.startsWith('http')) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width;
            let h = img.height;
            if (w > ICON_MAX_SIZE || h > ICON_MAX_SIZE) {
                if (w > h) {
                    h = Math.round(h * (ICON_MAX_SIZE / w));
                    w = ICON_MAX_SIZE;
                } else {
                    w = Math.round(w * (ICON_MAX_SIZE / h));
                    h = ICON_MAX_SIZE;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            try {
                const dataUrl = canvas.toDataURL('image/png');
                URL.revokeObjectURL(img.src);
                resolve(dataUrl);
            } catch (e) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    URL.revokeObjectURL(img.src);
                    resolve(reader.result);
                };
                reader.readAsDataURL(blob);
            }
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(img.src);
            reject(e);
        };
        img.src = URL.createObjectURL(blob);
      });
    } catch (e) {
      return null;
    }
  }

  function isMatch(ruleUrl, targetUrl, type) {
    if (!ruleUrl) return false;
    ruleUrl = ruleUrl.trim();
    if (!ruleUrl) return false;
    if (type === 'exact') return targetUrl === ruleUrl || targetUrl === ruleUrl + '/';
    if (type === 'prefix') return targetUrl.startsWith(ruleUrl);
    return false;
  }

  function isRuleActive(ruleObj) {
      const currentUrl = window.location.href;
      if (ruleObj.isExcludeAll) return false;
      if (ruleObj.excludes && ruleObj.excludes.some(ex => isMatch(ex.url, currentUrl, ex.ruleType))) return false;
      if (ruleObj.isAll) return true;
      if (ruleObj.includes && ruleObj.includes.some(inc => isMatch(inc.url, currentUrl, inc.ruleType))) return true;
      return false;
  }

  function checkDisplayRules() {
    let showPanel = false;
    let showButtons = [];
    let activeKeyboards = [];
    if (config.rules.sites.some(site => isRuleActive(site))) showPanel = true;
    config.rules.buttons.forEach(btn => { if (isRuleActive(btn)) showButtons.push(btn); });
    config.rules.keyboards.forEach(kb => { if (isRuleActive(kb)) activeKeyboards.push(kb); });
    return { showPanel, showButtons, activeKeyboards };
  }

  // ==========================================
  // 初期化・再描画
  // ==========================================
  loadConfig().then(() => {
    init();
  });

  function init() {
    document.querySelectorAll('.custom-shortcuts-container, .shortcut-panel-trigger-btn').forEach(e => e.remove());
    if(panelContainer) {
        panelContainer.remove();
        panelContainer = null;
    }
    if (outsideClickHandler) {
        document.removeEventListener('click', outsideClickHandler);
        outsideClickHandler = null;
    }
    
    const status = checkDisplayRules();
    applyGlobalStyles();

    if (status.showPanel) createPanel(false, 'site'); 
    status.showButtons.forEach(btnConfig => createTriggerButton(btnConfig));

    if (keyHandler) document.removeEventListener('keydown', keyHandler);

    if (status.activeKeyboards.length > 0) {
      keyHandler = (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
        
        let matched = false;
        status.activeKeyboards.forEach(kb => {
          if (e.key === kb.key) matched = true;
        });

        if (matched) {
             if (panelContainer) { 
                 saveColorRuleIfNeeded().then(() => {
                    closePanelWithAnimation(panelContainer, config.settings.animation.main, () => { panelContainer = null; });
                 });
             } else { 
                 createPanel(true, 'keyboard'); 
             }
        }
      };
      document.addEventListener('keydown', keyHandler);
    }
  }

  // ==========================================
  // UI生成
  // ==========================================
  function applyGlobalStyles() {
    const styleId = 'shortcut-panel-style';
    const existing = document.getElementById(styleId);
    if(existing) existing.remove(); 

    const styleText = `
     :root { --item-size: 72px; --icon-size: 40px; --folder-size: 40px; --border-radius: 12px; --panel-padding: 20px; --item-gap: 15px; }
     
     .panel-style { 
        box-sizing: border-box; 
        background: rgba(255, 255, 255, 0.2); 
        backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); 
        border-radius: var(--border-radius); 
        border: 1px solid rgba(255, 255, 255, 0.3); 
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2), inset 0 1px 1px rgba(255,255,255,0.4); 
        padding: var(--panel-padding); 
        position: fixed; 
        font-family: sans-serif; 
     }
     
     .panel-anim-enter { opacity: 0; }
     .panel-anim-active { opacity: 1; transition: opacity ease, transform ease; }
     .panel-anim-leave { opacity: 0; transition: opacity ease, transform ease; }
     
     .custom-shortcuts-container { 
        transform: scale(${config.settings.scale / 100}); 
        transform-origin: ${config.settings.position.yProp} ${config.settings.position.xProp}; 
        display: grid; 
        grid-template-columns: repeat(${config.settings.gridCols}, var(--item-size)); 
        grid-auto-rows: var(--item-size); 
        gap: var(--item-gap); 
        z-index: 2147483647; 
        pointer-events: auto; 
        cursor: move; 
        max-height: calc(var(--item-size) * ${config.settings.gridRows} + var(--item-gap) * (${config.settings.gridRows} - 1) + var(--panel-padding) * 2); 
        overflow-y: auto; 
        padding-right: 5px; 
     }
     
     .panel-controls { position: absolute; top: 8px; right: 8px; display: flex; gap: 8px; cursor: default; }
     .control-button { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 12px; line-height: 16px; cursor: pointer; transition: all 0.2s; user-select: none; background-color: rgba(0, 0, 0, 0.7); color: white; }
     .new-tab-btn.active { background-color: rgba(255, 255, 255, 0.6) !important; color: #1a73e8 !important; font-weight: bold; }
     .settings-button { width: 16px; height: 16px; cursor: pointer; background-image: url('https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_haguruma_1.png'); background-size: contain; background-repeat: no-repeat; background-position: center; filter: invert(1); opacity: 0.7; transition: opacity 0.2s; }
     .settings-button:hover { opacity: 1; }
     
     .custom-shortcut { display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; width: var(--item-size); height: var(--item-size); transition: all 0.2s; border-radius: var(--border-radius); padding: 4px; box-sizing: border-box; cursor: pointer; }
     .custom-shortcut:hover { transform: translateY(-5px); background: rgba(255,255,255,0.3); }
     .custom-shortcut img, .custom-shortcut .folder-icon-preview { width: var(--icon-size); height: var(--icon-size); object-fit: contain; border-radius: calc(var(--border-radius) * 0.5); }
     .custom-shortcut span { font-size: 12px; margin-top: 6px; text-align: center; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.3s; }
     .light-text .custom-shortcut span, .light-text .control-button { color: white !important; } .dark-text .custom-shortcut span, .dark-text .control-button { color: black !important; }
     
     .custom-folder .folder-icon-preview,
     .preview-shortcut.preview-folder .folder-icon-preview { 
        display: grid; 
        grid-template-columns: repeat(3, 1fr); 
        grid-template-rows: repeat(3, 1fr); 
        gap: 2px; 
        padding: 2px; 
        width: var(--folder-size); 
        height: var(--folder-size); 
        background: rgba(0,0,0,0.1); 
        border-radius: var(--border-radius); 
     }
     .folder-icon-preview .preview-icon { 
        width: 100%; 
        height: 100%; 
        background-size: contain; 
        background-repeat: no-repeat; 
        background-position: center; 
        border-radius: 4px; 
     }
     
     .folder-contents-overlay { 
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; 
        display: flex; align-items: center; justify-content: center; 
        background: rgba(0,0,0,0.2); 
        backdrop-filter: blur(2px); 
     }
     .folder-contents { display: block; position: relative; overflow: hidden; padding-bottom: 5px; max-height: 80vh; overflow-y: auto; }

     /* Editor Styles */
     .editor-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 800px; height: 85%; background: rgba(255,255,255,0.98); z-index: 2147483650; box-shadow: 0 0 20px rgba(0,0,0,0.5); border-radius: 8px; display: flex; flex-direction: column; color: #333; font-size: 14px; border: 1px solid #ccc; }
     .editor-wrapper { flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 20px; box-sizing: border-box; }
     .editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px; flex-shrink: 0; }
     .editor-back-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #1a73e8; font-weight: bold; }
     .editor-save-btn { background: #1a73e8; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; }
     .editor-menu-list { list-style: none; padding: 0; margin: 0; }
     .editor-menu-item { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; font-size: 16px; font-weight: 500; }
     .editor-menu-item:hover { background: #f0f0f0; }
     .editor-form-group { margin-bottom: 20px; }
     .editor-label { display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px; }
     .editor-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; margin-bottom: 5px; font-size: 14px; }
     .editor-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
     .editor-btn-small { padding: 6px 12px; font-size: 13px; cursor: pointer; background: #eee; border: 1px solid #ccc; border-radius: 3px; }
     .editor-section-title { font-size: 14px; color: #666; margin-top: 25px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; font-weight: bold; }
     .tree-item-row { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; background: #fff; padding: 8px; border: 1px solid #eee; border-radius: 4px; transition: background 0.3s; }
     .tree-item-row.highlight-flash { background: #fff3a0; transition: background 0.5s; }
     .tree-controls button { font-size: 11px; padding: 3px 6px; }
     .search-results { border: 1px solid #ccc; max-height: 150px; overflow-y: auto; display: none; margin-top: -5px; background: #fff; position: absolute; width: 95%; z-index: 100; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
     .search-item { padding: 8px; cursor: pointer; border-bottom: 1px solid #eee; }
     .search-item:hover { background: #e8f0fe; }
     .editor-sub-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 4px; background: #f9f9f9; }
     .editor-sub-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
     
     .preview-panel-container { 
        display: grid; 
        grid-template-columns: repeat(${config.settings.gridCols}, var(--item-size)); 
        gap: var(--item-gap); 
        padding: 10px;
        background: rgba(255,255,255,0.9);
        border: 1px solid #ccc;
        border-radius: 8px;
        margin-top: 10px;
        max-height: 300px;
        overflow-y: auto;
        color: black;
     }
     .preview-shortcut { 
        width: var(--item-size); height: var(--item-size); 
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border: 1px solid transparent; border-radius: 8px;
        cursor: pointer;
     }
     .preview-shortcut.selected { border: 2px solid #1a73e8; background: rgba(26,115,232,0.1); }
     .preview-shortcut img { width: var(--icon-size); height: var(--icon-size); object-fit: contain; }
     .preview-shortcut span { font-size: 12px; margin-top: 6px; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: black; }
     .preview-nav { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; font-weight: bold; }
     .tree-toggle-btn { cursor: pointer; width: 20px; text-align: center; font-size: 12px; user-select: none; }
   `;
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styleText;
    document.head.appendChild(styleTag);
  }

  function closePanelWithAnimation(element, duration, callback) {
      if (!element) return;
      isAnimating = true;
      element.classList.remove('panel-anim-active');
      element.classList.add('panel-anim-leave');
      element.style.transitionDuration = `${duration}s`;
      
      if (outsideClickHandler) {
          document.removeEventListener('click', outsideClickHandler);
          outsideClickHandler = null;
      }
      
      setTimeout(() => {
          element.remove();
          isAnimating = false;
          if (callback) callback();
      }, duration * 1000);
  }

  function createPanel(withAnimation = true, activationType = 'site') {
    if (document.querySelector('.custom-shortcuts-container') || isAnimating) return;
    panelContainer = document.createElement('div');
    panelContainer.className = "custom-shortcuts-container panel-style";
    
    if (withAnimation) {
        panelContainer.classList.add('panel-anim-enter');
        panelContainer.style.transitionDuration = `${config.settings.animation.main}s`;
    }

    // パネル外クリックで閉じる処理
    if (config.settings.closeOnOutsideClick && config.settings.closeOnOutsideClick[activationType]) {
        setTimeout(() => {
            outsideClickHandler = (e) => {
                if (panelContainer && !panelContainer.contains(e.target)) {
                    saveColorRuleIfNeeded().then(() => {
                        closePanelWithAnimation(panelContainer, config.settings.animation.main, () => { panelContainer = null; });
                    });
                }
            };
            document.addEventListener('click', outsideClickHandler);
        }, 100);
    }

    const controls = document.createElement('div');
    controls.className = 'panel-controls';
    
    const settingsBtn = document.createElement('div');
    settingsBtn.className = 'settings-button';
    settingsBtn.title = '設定';
    settingsBtn.onclick = (e) => { e.stopPropagation(); openEditor(); };
    
    const newTabBtn = document.createElement('div');
    newTabBtn.className = 'control-button new-tab-btn';
    newTabBtn.textContent = '+';
    newTabBtn.onclick = (e) => { e.stopPropagation(); newTabMode = !newTabMode; newTabBtn.classList.toggle('active', newTabMode); };
    
    const toggleModeBtn = document.createElement('div');
    toggleModeBtn.className = 'control-button toggle-mode-btn';
    toggleModeBtn.onclick = (e) => { e.stopPropagation(); isDarkMode = !isDarkMode; applyTheme(); };
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'control-button close-btn';
    closeBtn.textContent = '✕';
    closeBtn.onclick = (e) => { 
        e.stopPropagation(); 
        saveColorRuleIfNeeded().then(() => {
            closePanelWithAnimation(panelContainer, config.settings.animation.main, () => { panelContainer = null; });
        });
    };
    
    controls.append(settingsBtn, newTabBtn, toggleModeBtn, closeBtn);
    panelContainer.appendChild(controls);

    config.items.forEach(item => {
      panelContainer.appendChild(item.isFolder ? createFolder(item) : createShortcut(item));
    });

    document.body.appendChild(panelContainer);
    makeDraggableAndPosition(panelContainer);
    
    if (withAnimation) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panelContainer.classList.add('panel-anim-active');
                panelContainer.classList.remove('panel-anim-enter');
            });
        });
    }

    const currentUrl = window.location.href;
    let finalThemeIsDark = (config.settings.baseTextColor === 'black');
    if (config.settings.colorRules) {
      for (const rule of config.settings.colorRules) {
        if (currentUrl.startsWith(rule.url)) {
          finalThemeIsDark = (rule.color === 'black');
          break;
        }
      }
    }
    isDarkMode = finalThemeIsDark;
    initialIsDarkMode = isDarkMode; 
    applyTheme();
  }

  function applyTheme() {
    if(!panelContainer) return;
    const isDark = isDarkMode;
    panelContainer.classList.toggle('dark-text', isDark);
    panelContainer.classList.toggle('light-text', !isDark);
    const mainToggle = panelContainer.querySelector('.toggle-mode-btn');
    if (mainToggle) mainToggle.textContent = isDark ? '●' : '◯';
    document.querySelectorAll('.folder-contents').forEach(fc => {
      fc.classList.toggle('dark-text', isDark);
      fc.classList.toggle('light-text', !isDark);
      const localToggle = fc.querySelector('.toggle-mode-btn');
      if (localToggle) localToggle.textContent = isDark ? '●' : '◯';
    });
  }

  function getIconSrc(url) {
    if(!url) return '';
    if(iconCache[url]) return iconCache[url]; 
    return url; 
  }

  function createShortcut(item) {
    const link = document.createElement('a');
    link.href = item.url;
    link.className = "custom-shortcut";
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (newTabMode) {
          saveColorRuleIfNeeded(); 
          window.open(link.href, '_blank');
      } else {
          await saveColorRuleIfNeeded(); 
          window.location.href = link.href;
      }
    });
    const img = document.createElement('img');
    img.src = getIconSrc(item.icon);
    img.alt = item.name;
    img.onerror = (e) => { e.target.style.display = 'none'; };
    const span = document.createElement('span');
    span.textContent = item.name;
    link.append(img, span);
    return link;
  }

  function createFolder(item) {
    const folder = document.createElement('div');
    folder.className = "custom-shortcut custom-folder";
    const preview = document.createElement('div');
    preview.className = 'folder-icon-preview';
    if(item.children) {
      item.children.slice(0, 9).forEach(child => {
        if (child.icon) {
          const iconDiv = document.createElement('div');
          iconDiv.className = 'preview-icon';
          iconDiv.style.backgroundImage = `url(${getIconSrc(child.icon)})`;
          preview.appendChild(iconDiv);
        }
      });
    }
    const span = document.createElement('span');
    span.textContent = item.name;
    folder.append(preview, span);
    folder.addEventListener('click', (e) => {
      e.stopPropagation();
      openFolderOverlay(item);
    });
    return folder;
  }

  function openFolderOverlay(item) {
    const overlay = document.createElement('div');
    overlay.className = 'folder-contents-overlay panel-anim-enter'; 
    overlay.style.transitionDuration = `${config.settings.animation.sub}s`;
    
    const contents = document.createElement('div');
    contents.className = 'folder-contents panel-style';
    contents.classList.toggle('dark-text', isDarkMode);
    contents.classList.toggle('light-text', !isDarkMode);
    const itemPx = 72; const gapPx = 15;
    const width = (config.settings.folderGridCols * itemPx) + ((config.settings.folderGridCols-1)*gapPx) + 40;
    contents.style.width = width + 'px';

    const controls = document.createElement('div');
    controls.className = 'panel-controls';
    const newTabBtn = document.createElement('div');
    newTabBtn.className = 'control-button new-tab-btn';
    newTabBtn.textContent = '+';
    newTabBtn.classList.toggle('active', newTabMode);
    newTabBtn.onclick = (e) => { e.stopPropagation(); newTabMode = !newTabMode; newTabBtn.classList.toggle('active', newTabMode); };
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'control-button toggle-mode-btn';
    toggleBtn.textContent = isDarkMode ? '●' : '◯';
    toggleBtn.onclick = (e) => { e.stopPropagation(); isDarkMode = !isDarkMode; applyTheme(); };
    
    const doClose = () => {
        closePanelWithAnimation(overlay, config.settings.animation.sub, () => {});
    };

    const closeBtn = document.createElement('div');
    closeBtn.className = 'control-button close-btn';
    closeBtn.textContent = '✕';
    closeBtn.onclick = (e) => { e.stopPropagation(); doClose(); };
    controls.append(newTabBtn, toggleBtn, closeBtn);
    contents.appendChild(controls);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${config.settings.folderGridCols}, var(--item-size))`;
    grid.style.gap = 'var(--item-gap)';
    grid.style.marginTop = '25px';
    (item.children || []).forEach(child => {
         const link = createShortcut(child);
         grid.appendChild(link);
    });
    contents.appendChild(grid);
    overlay.appendChild(contents);
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('panel-anim-active');
            overlay.classList.remove('panel-anim-enter');
        });
    });

    overlay.addEventListener('click', (e) => { if(e.target === overlay) doClose(); });
  }

  function makeDraggableAndPosition(element) {
    const s = config.settings;
    element.style[s.position.yProp] = `${s.position.yVal}px`;
    element.style[s.position.xProp] = `${s.position.xVal}px`;

    let startX, startY;
    let startXVal, startYVal;
    
    element.addEventListener('mousedown', (e) => {
        if (e.target === element && (e.offsetX > element.clientWidth || e.offsetY > element.clientHeight)) return;
        if (e.target.closest('.custom-shortcut, .panel-controls, input, button, select, textarea')) return;
        
        e.preventDefault();
        
        element.style.transition = 'none';

        const scale = s.scale / 100;
        startX = e.clientX; 
        startY = e.clientY;
        startXVal = parseFloat(element.style[s.position.xProp]) || 0;
        startYVal = parseFloat(element.style[s.position.yProp]) || 0;
        
        function onMouseMove(e) {
            const deltaX = (e.clientX - startX) / scale;
            const deltaY = (e.clientY - startY) / scale;
            if (s.position.xProp === 'left') {
                element.style.left = (startXVal + deltaX) + 'px';
            } else { 
                element.style.right = (startXVal - deltaX) + 'px';
            }
            if (s.position.yProp === 'top') {
                element.style.top = (startYVal + deltaY) + 'px';
            } else {
                element.style.bottom = (startYVal - deltaY) + 'px';
            }
        }
        function onMouseUp() {
            element.style.transition = '';
            element.style.transitionDuration = `${config.settings.animation.main}s`;
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
  }
  
  function createTriggerButton(btnConfig) {
    const btn = document.createElement('div');
    btn.className = 'shortcut-panel-trigger-btn';
    let style = `position:fixed; z-index:2147483646; cursor:pointer; box-sizing:border-box;`;
    
    if(btnConfig.contentType === 'custom') {
        const c = btnConfig.custom;
        style += `background-color:${c.bgColor}; border-radius:${c.borderRadius}px; color:${c.textColor}; font-size:${c.fontSize}px; display:flex; align-items:center; justify-content:center;`;
        if (c.buttonText) btn.textContent = c.buttonText;
        style += `opacity:${c.opacity / 100};`;
    } else {
        style += `background-color:rgba(0,0,0,0.5); border-radius:5px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2px;`;
        btn.innerHTML = '<div style="width:60%;height:2px;background:white;margin:2px 0;"></div><div style="width:60%;height:2px;background:white;margin:2px 0;"></div><div style="width:60%;height:2px;background:white;margin:2px 0;"></div>';
    }
    
    const da = btnConfig.display;
    btn.style.top = da.top + 'px'; btn.style.left = da.left + 'px';
    btn.style.width = (da.right - da.left) + 'px'; btn.style.height = (da.bottom - da.top) + 'px';
    
    // 固定表示でのスクロール透明化
    if(btnConfig.displayMode === 'fixed' && btnConfig.hideOnScroll) {
        style += `transition: opacity 0.3s;`;
        
        let lastScrollY = window.scrollY;
        let isHidden = false;
        
        const scrollHandler = () => {
            const currentY = window.scrollY;
            // 下スクロール (少し遊びを持たせる)
            if (currentY > lastScrollY && currentY > 10) {
                if (!isHidden) {
                    btn.style.opacity = '0';
                    btn.style.pointerEvents = 'none'; // クリック透過
                    isHidden = true;
                }
            } else if (currentY < lastScrollY) {
                // 上スクロール
                if (isHidden) {
                    btn.style.opacity = (btnConfig.contentType === 'custom' ? (btnConfig.custom.opacity/100) : 1);
                    btn.style.pointerEvents = 'auto';
                    isHidden = false;
                }
            }
            lastScrollY = currentY;
        };
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // ホバー時は強制表示 (表示域と同じ座標で判定)
        // 既に透明(pointerEvents: none)になっているとmouseenterが発火しないため、
        // 既存の透明化モードと同じくmousemoveで座標監視する
        document.addEventListener('mousemove', (e) => {
            if (!isHidden) return; // 表示中は処理不要
            
            // 表示域座標
            const inArea = e.clientY >= da.top && e.clientY <= da.bottom && e.clientX >= da.left && e.clientX <= da.right;
            
            if (inArea) {
                // ホバー中：表示
                btn.style.opacity = (btnConfig.contentType === 'custom' ? (btnConfig.custom.opacity/100) : 1);
                btn.style.pointerEvents = 'auto'; 
            } else {
                // ホバー外かつスクロールで隠れている：非表示
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
            }
        });
    }
    
    if(btnConfig.displayMode === 'transparent') {
        style += `opacity:0; pointer-events:none;`; 
        const ca = btnConfig.cursor;
        document.addEventListener('mousemove', (e) => {
            const inArea = e.clientY >= ca.top && e.clientY <= ca.bottom && e.clientX >= ca.left && e.clientX <= ca.right;
            if (inArea) {
                 btn.style.pointerEvents = 'auto'; 
                 btn.style.opacity = (btnConfig.contentType === 'custom' ? (btnConfig.custom.opacity/100) : 1);
            } else {
                 btn.style.pointerEvents = 'none'; 
                 btn.style.opacity = 0;
            }
        });
    }

    btn.style.cssText += style;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(panelContainer) { 
            saveColorRuleIfNeeded().then(() => {
                closePanelWithAnimation(panelContainer, config.settings.animation.main, () => { panelContainer = null; });
            });
        } else { 
            createPanel(true, 'button');
        }
    });
    document.body.appendChild(btn);
  }

  // ==========================================
  // エディタ機能
  // ==========================================
  function openEditor() {
    if(document.querySelector('.editor-modal')) return;
    if(panelContainer) panelContainer.style.display = 'none';

    const modal = document.createElement('div');
    modal.className = 'editor-modal';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-wrapper';
    
    renderMenu(wrapper, modal);
    modal.appendChild(wrapper);
    document.body.appendChild(modal);
  }

  function createHeader(title, onBack, onSave) {
    const header = document.createElement('div');
    header.className = 'editor-header';
    const backBtn = document.createElement('button');
    backBtn.className = 'editor-back-btn';
    backBtn.textContent = '←戻る';
    backBtn.onclick = onBack;
    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    titleSpan.style.fontWeight = 'bold';
    header.append(backBtn, titleSpan);
    if (onSave) {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'editor-save-btn';
        saveBtn.textContent = '保存';
        saveBtn.onclick = onSave;
        header.appendChild(saveBtn);
    } else {
        const spacer = document.createElement('div');
        spacer.style.width = '40px';
        header.appendChild(spacer);
    }
    return header;
  }

  function renderMenu(wrapper, modal) {
    wrapper.innerHTML = '';
    const header = createHeader('編集', () => {
        modal.remove();
        init(); 
    }, false);
    wrapper.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'editor-menu-list';
    const items = [
        { label: '追加', action: () => renderAddView(wrapper, modal) },
        { label: 'ショートカット編集', action: () => renderShortcutEditView(wrapper, modal) },
        { label: 'パネル編集', action: () => renderPanelEditView(wrapper, modal) },
        { label: 'インポート', action: () => renderImportView(wrapper, modal) },
        { label: 'エクスポート', action: () => renderExportView(wrapper, modal) }
    ];
    items.forEach(i => {
        const li = document.createElement('li');
        li.className = 'editor-menu-item';
        li.textContent = i.label;
        li.onclick = i.action;
        list.appendChild(li);
    });
    wrapper.appendChild(list);
  }

  // --- 1. 追加画面 ---
  function renderAddView(wrapper, modal) {
    // (省略なし) 実装は前回と同様
    wrapper.innerHTML = '';
    const currentUrl = window.location.href;
    const currentDomain = new URL(currentUrl).hostname;
    const defaultIcon = `https://www.google.com/s2/favicons?sz=64&domain_url=${currentDomain}`;
    let urlVal = currentUrl;
    let iconVal = defaultIcon;
    let nameVal = document.title;
    
    let selectedTarget = { type: 'root', indices: [], label: 'ルート (最後尾)' };

    const workingItems = JSON.parse(JSON.stringify(config.items));

    const onSave = async () => {
        if (iconVal && iconVal.startsWith('http')) {
             const b64 = await fetchAndResizeImage(iconVal);
             if (b64) {
                 iconCache[iconVal] = b64;
             }
        }

        const newItem = { name: nameVal, url: urlVal, icon: iconVal };
        
        if(selectedTarget.type === 'root') {
            workingItems.push(newItem);
        } else if (selectedTarget.type === 'folder') {
            let target = workingItems;
            for(let i=0; i<selectedTarget.indices.length; i++) {
                target = target[selectedTarget.indices[i]];
                if(i < selectedTarget.indices.length - 1) target = target.children;
            }
            if(!target.children) target.children = [];
            target.children.push(newItem);
        } else if (selectedTarget.type === 'item') {
            const indices = selectedTarget.indices; 
            const selfIndex = indices[indices.length - 1]; 
            const parentIndices = indices.slice(0, -1); 
            let parentList = workingItems;
            if(parentIndices.length > 0) {
                let target = workingItems;
                for(let i=0; i<parentIndices.length; i++) {
                    target = target[parentIndices[i]];
                    if(target.children) target = target.children;
                }
                parentList = target;
            }
            parentList.splice(selfIndex + 1, 0, newItem);
        }

        config.items = workingItems;
        await saveConfig();
        renderMenu(wrapper, modal);
    };

    wrapper.appendChild(createHeader('追加', () => renderMenu(wrapper, modal), onSave));
    wrapper.appendChild(createInputRow('現在のURL', urlVal, v => urlVal = v));
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'editor-form-group';
    iconDiv.innerHTML = `<label class="editor-label">現在のアイコンURL</label>`;
    const iconRow = document.createElement('div'); iconRow.className = 'editor-row';
    const iconIn = document.createElement('input'); iconIn.className = 'editor-input'; iconIn.value = iconVal; iconIn.onchange = (e) => iconVal = e.target.value;
    const checkBtn = document.createElement('button'); checkBtn.textContent = '確認'; checkBtn.className = 'editor-btn-small';
    const imgPreview = document.createElement('img'); imgPreview.style.width='32px'; imgPreview.style.height='32px'; 
    imgPreview.src = iconVal;
    checkBtn.onclick = () => { iconVal = iconIn.value; imgPreview.src = iconVal; };
    iconRow.append(iconIn, checkBtn); iconDiv.append(iconRow, imgPreview);
    wrapper.appendChild(iconDiv);

    wrapper.appendChild(createInputRow('名前', nameVal, v => nameVal = v));

    const posDiv = document.createElement('div');
    posDiv.className = 'editor-form-group';
    posDiv.innerHTML = `<label class="editor-label">追加する位置 (クリックして選択)</label>`;
    const selectedDisplay = document.createElement('div'); 
    selectedDisplay.style.fontWeight = 'bold'; selectedDisplay.textContent = '選択中: ' + selectedTarget.label;
    
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-panel-container';

    function renderPreview(currentLevelItems, parentIndices) {
        previewContainer.innerHTML = '';
        
        if (parentIndices.length > 0) {
            const navRow = document.createElement('div');
            navRow.className = 'preview-nav';
            const backBtn = document.createElement('button');
            backBtn.className = 'editor-btn-small';
            backBtn.textContent = '上の階層へ';
            backBtn.onclick = () => {
                const grandParentIndices = parentIndices.slice(0, -1);
                let grandParentItems = workingItems;
                if(grandParentIndices.length > 0) {
                    let t = workingItems;
                    for(let i=0; i<grandParentIndices.length; i++) {
                        t = t[grandParentIndices[i]];
                        if(t.children) t = t.children;
                    }
                    grandParentItems = t;
                }
                renderPreview(grandParentItems, grandParentIndices);
            };
            navRow.appendChild(backBtn);
            previewContainer.appendChild(navRow);
        }

        currentLevelItems.forEach((item, idx) => {
            const currentIndices = [...parentIndices, idx];
            
            const div = document.createElement('div');
            div.className = 'preview-shortcut';
            if(selectedTarget.indices.length === currentIndices.length && selectedTarget.indices.every((v,i) => v === currentIndices[i])) {
                div.classList.add('selected');
            }

            if (item.isFolder) {
                div.classList.add('preview-folder');
                const p = document.createElement('div'); p.className = 'folder-icon-preview';
                if(item.children) {
                    item.children.slice(0,9).forEach(c => {
                        const i = document.createElement('div'); i.className='preview-icon'; 
                        i.style.backgroundImage = `url(${getIconSrc(c.icon)})`;
                        p.appendChild(i);
                    });
                }
                div.appendChild(p);
                
                div.onclick = () => {
                    renderPreview(item.children || [], currentIndices);
                    selectedTarget = { type: 'folder', indices: currentIndices, label: item.name + ' 内の末尾' };
                    selectedDisplay.textContent = '選択中: ' + selectedTarget.label;
                };

            } else {
                const img = document.createElement('img');
                img.src = getIconSrc(item.icon);
                div.appendChild(img);
                
                div.onclick = () => {
                    selectedTarget = { type: 'item', indices: currentIndices, label: item.name + ' の後ろ' };
                    selectedDisplay.textContent = '選択中: ' + selectedTarget.label;
                    renderPreview(currentLevelItems, parentIndices);
                };
            }
            
            const span = document.createElement('span');
            span.textContent = item.name;
            div.appendChild(span);
            previewContainer.appendChild(div);
        });
    }

    renderPreview(workingItems, []);
    
    posDiv.append(selectedDisplay, previewContainer);
    wrapper.appendChild(posDiv);
  }

  // --- 2. ショートカット編集 ---
  function renderShortcutEditView(wrapper, modal) {
    // (省略なし) 実装は前回と同様
    wrapper.innerHTML = '';
    
    let workingItems = JSON.parse(JSON.stringify(config.items));
    let workingSettings = JSON.parse(JSON.stringify(config.settings));
    let workingIconCache = JSON.parse(JSON.stringify(iconCache));

    const onSave = async () => { 
        config.items = workingItems;
        config.settings = workingSettings;
        iconCache = workingIconCache;
        await saveConfig(); 
        renderMenu(wrapper, modal); 
    };
    
    wrapper.appendChild(createHeader('ショートカット編集', () => renderMenu(wrapper, modal), onSave));

    const colorDiv = document.createElement('div');
    function renderColors() {
        colorDiv.innerHTML = '<div class="editor-section-title">文字色指定</div>';
        const list = document.createElement('div');
        workingSettings.colorRules.forEach((rule, idx) => {
            const row = document.createElement('div'); row.className = 'editor-row';
            row.innerHTML = `<input class="editor-input" style="flex:1" value="${rule.url}"><label><input type="radio" name="cr-${idx}" value="white" ${rule.color==='white'?'checked':''}>白</label><label><input type="radio" name="cr-${idx}" value="black" ${rule.color==='black'?'checked':''}>黒</label><button class="editor-btn-small">削除</button>`;
            const inputs = row.querySelectorAll('input');
            inputs[0].onchange = (e) => rule.url = e.target.value;
            inputs[1].onchange = () => rule.color = 'white'; inputs[2].onchange = () => rule.color = 'black';
            row.querySelector('button').onclick = () => { workingSettings.colorRules.splice(idx,1); renderColors(); };
            list.appendChild(row);
        });
        const addBtn = document.createElement('button'); addBtn.className = 'editor-btn-small'; addBtn.textContent = '追加';
        addBtn.onclick = () => { workingSettings.colorRules.push({url:'', color:'white'}); renderColors(); };
        colorDiv.append(list, addBtn);
    }
    renderColors();
    
    const iconCheckDiv = document.createElement('div');
    iconCheckDiv.innerHTML = '<div class="editor-section-title">アイコンURL確認</div>';
    const checkRow1 = document.createElement('div'); checkRow1.className = 'editor-row';
    const domainInput = document.createElement('input'); domainInput.className = 'editor-input'; domainInput.placeholder = 'ドメイン (例: https://www.google.com)'; domainInput.style.flex = '1';
    const createBtn = document.createElement('button'); createBtn.className = 'editor-btn-small'; createBtn.textContent = 'アイコンURL作成';
    checkRow1.append(domainInput, createBtn);
    const checkRow2 = document.createElement('div'); checkRow2.className = 'editor-row';
    const resultInput = document.createElement('input'); resultInput.className = 'editor-input'; resultInput.placeholder = '生成されたアイコンURL'; resultInput.style.flex = '1';
    const confirmBtn = document.createElement('button'); confirmBtn.className = 'editor-btn-small'; confirmBtn.textContent = '確認';
    checkRow2.append(resultInput, confirmBtn);
    const checkPreview = document.createElement('img'); checkPreview.style.width = '32px'; checkPreview.style.height = '32px'; checkPreview.style.marginTop = '5px'; checkPreview.style.display = 'none';
    createBtn.onclick = () => {
        let val = domainInput.value.trim(); if(!val) return;
        try { if(!val.startsWith('http')) val = 'https://' + val; const urlObj = new URL(val); resultInput.value = `https://www.google.com/s2/favicons?sz=64&domain_url=${urlObj.origin}`; } catch(e) { alert('URL形式が正しくありません'); }
    };
    confirmBtn.onclick = () => { if(resultInput.value) { checkPreview.src = resultInput.value; checkPreview.style.display = 'block'; } };
    iconCheckDiv.append(checkRow1, checkRow2, checkPreview);

    const treeContainer = document.createElement('div');
    
    const treeHeader = document.createElement('div');
    treeHeader.className = "editor-section-title";
    treeHeader.style.cssText = `
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        position: sticky; 
        top: 0; 
        background: #fff; 
        z-index: 100; 
        padding: 10px 5px; 
        margin: 0; 
        border-bottom: 2px solid #ddd;
    `;
    
    const leftSide = document.createElement('div');
    leftSide.style.display = 'flex';
    leftSide.style.alignItems = 'center';
    leftSide.style.gap = '10px';

    const titleLabel = document.createElement('span');
    titleLabel.textContent = 'ショートカット設定';
    
    const toggleAllBtn = document.createElement('button');
    toggleAllBtn.className = 'editor-btn-small';
    toggleAllBtn.textContent = '全て折り畳む';
    let isAllCollapsed = false;

    toggleAllBtn.onclick = () => {
        isAllCollapsed = !isAllCollapsed;
        toggleAllBtn.textContent = isAllCollapsed ? '全て展開' : '全て折り畳む';
        
        function updateCollapseState(list) {
            list.forEach(item => {
                if (item.isFolder) {
                    item._isCollapsed = isAllCollapsed;
                    if (item.children) updateCollapseState(item.children);
                }
            });
        }
        updateCollapseState(workingItems);
        renderTreeWrapper();
    };

    leftSide.append(titleLabel, toggleAllBtn);
    
    const searchWrapper = document.createElement('div'); 
    searchWrapper.style.position='relative'; searchWrapper.style.display='inline-block';
    const searchInput = document.createElement('input');
    searchInput.placeholder = '検索...';
    searchInput.className = 'editor-input';
    searchInput.style.fontSize = '12px'; searchInput.style.padding = '4px'; searchInput.style.width = '150px'; searchInput.style.marginBottom='0';
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    
    searchInput.oninput = () => {
        const term = searchInput.value.toLowerCase();
        searchResults.innerHTML = '';
        if(!term) { searchResults.style.display = 'none'; return; }
        
        let results = [];
        function searchRecursive(items, path) {
            items.forEach((item, idx) => {
                const currentPath = [...path, idx];
                if (item.name.toLowerCase().includes(term)) {
                    results.push({ item, path: currentPath });
                }
                if (item.isFolder && item.children) {
                    searchRecursive(item.children, currentPath);
                }
            });
        }
        searchRecursive(workingItems, []);
        
        if(results.length === 0) { searchResults.style.display = 'none'; return; }
        
        results.forEach(res => {
            const div = document.createElement('div'); 
            div.className = 'search-item'; 
            div.textContent = (res.item.isFolder ? '📁 ' : '📄 ') + res.item.name;
            div.onclick = () => {
                scrollToItem(res.path);
                searchInput.value = '';
                searchResults.style.display = 'none';
            };
            searchResults.appendChild(div);
        });
        searchResults.style.display = 'block';
    };
    
    document.addEventListener('click', (e) => { if(!searchWrapper.contains(e.target)) searchResults.style.display = 'none'; });
    searchWrapper.append(searchInput, searchResults);
    treeHeader.append(leftSide, searchWrapper);

    function scrollToItem(pathIndices) {
        let current = workingItems;
        for (let i = 0; i < pathIndices.length - 1; i++) {
            current = current[pathIndices[i]];
            current._isCollapsed = false; 
            if (current.children) current = current.children;
        }
        
        renderTreeWrapper();
        
        setTimeout(() => {
            const targetId = `tree-item-${pathIndices.join('-')}`;
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-flash');
                setTimeout(() => el.classList.remove('highlight-flash'), 2000);
            }
        }, 100);
    }

    function renderTree(items, parentContainer, depth=0, parentPath=[]) {
        items.forEach((item, idx) => {
            const currentPath = [...parentPath, idx];
            const uniqueId = `tree-item-${currentPath.join('-')}`;
            
            const row = document.createElement('div'); 
            row.className = 'tree-item-row'; 
            row.id = uniqueId; 
            row.style.marginLeft = (depth * 15) + 'px'; 
            row.style.flexWrap = 'wrap';
            
            if (item.isFolder) {
                const toggle = document.createElement('span');
                toggle.className = 'tree-toggle-btn';
                toggle.textContent = item._isCollapsed ? '▷' : '▽'; 
                toggle.onclick = () => {
                    item._isCollapsed = !item._isCollapsed;
                    renderTreeWrapper();
                };
                row.appendChild(toggle);
            } else {
                const spacer = document.createElement('span');
                spacer.style.width = '20px'; spacer.style.display = 'inline-block';
                row.appendChild(spacer);
            }

            const imgEl = document.createElement('img');
            imgEl.style.width = '24px'; imgEl.style.height = '24px'; imgEl.style.marginRight = '8px'; imgEl.style.borderRadius = '4px';
            const cacheSrc = workingIconCache[item.icon];
            imgEl.src = cacheSrc ? cacheSrc : (item.icon || '');
            imgEl.onerror = () => { imgEl.style.display='none'; };
            row.appendChild(imgEl);

            const nameIn = document.createElement('input'); nameIn.className='editor-input'; nameIn.style.width='100px'; nameIn.value=item.name; nameIn.placeholder='名前';
            nameIn.onchange = (e) => item.name = e.target.value;
            row.appendChild(nameIn);

            if (!item.isFolder) {
               const urlIn = document.createElement('input'); urlIn.className='editor-input'; urlIn.style.width='120px'; urlIn.value=item.url||''; urlIn.placeholder='URL';
               urlIn.onchange = (e) => item.url = e.target.value;
               row.appendChild(urlIn);
            }

            const iconIn = document.createElement('input'); iconIn.className='editor-input'; iconIn.style.width='120px'; iconIn.value=item.icon||''; iconIn.placeholder='アイコンURL';
            iconIn.onchange = (e) => item.icon = e.target.value;
            row.appendChild(iconIn);

            const updateBtn = document.createElement('button');
            updateBtn.className = 'editor-btn-small';
            updateBtn.textContent = '更新';
            updateBtn.style.marginRight = '5px';
            updateBtn.onclick = async () => {
                const url = iconIn.value;
                if (!url || !url.startsWith('http')) return;
                const b64 = await fetchAndResizeImage(url);
                if (b64) {
                    workingIconCache[url] = b64;
                    imgEl.src = b64;
                    imgEl.style.display = 'inline';
                    alert('画像を更新予約しました（保存するまで反映されません）');
                } else {
                    alert('画像の取得に失敗しました');
                }
            };
            row.appendChild(updateBtn);

            const ctrls = document.createElement('div'); ctrls.className = 'tree-controls';
            const btnUp = document.createElement('button'); btnUp.textContent='↑'; btnUp.onclick = () => { if(idx>0) { items.splice(idx-1, 0, items.splice(idx, 1)[0]); renderTreeWrapper(); }};
            const btnDown = document.createElement('button'); btnDown.textContent='↓'; btnDown.onclick = () => { if(idx<items.length-1) { items.splice(idx+1, 0, items.splice(idx, 1)[0]); renderTreeWrapper(); }};
            const btnSame = document.createElement('button'); btnSame.textContent='同'; btnSame.onclick = () => { items.splice(idx+1, 0, {name:'新規', url:'', icon:''}); renderTreeWrapper(); };
            const btnChild = document.createElement('button'); btnChild.textContent='下'; btnChild.onclick = () => { item.isFolder = true; if(!item.children) item.children = []; item.children.push({name:'新規', url:'', icon:''}); renderTreeWrapper(); };
            const btnDel = document.createElement('button'); btnDel.textContent='削'; btnDel.onclick = () => { items.splice(idx, 1); renderTreeWrapper(); };
            ctrls.append(btnUp, btnDown, btnSame, btnChild, btnDel);
            row.appendChild(ctrls);
            parentContainer.appendChild(row);
            
            if(item.isFolder && item.children && !item._isCollapsed) { 
                renderTree(item.children, parentContainer, depth+1, currentPath); 
            }
        });
    }
    
    const renderTreeWrapper = () => { 
        treeContainer.innerHTML = ''; 
        treeContainer.appendChild(treeHeader);
        renderTree(workingItems, treeContainer); 
    };
    renderTreeWrapper();
    
    wrapper.append(colorDiv, iconCheckDiv, treeContainer);
  }

  // --- 3. パネル編集 ---
  function renderPanelEditView(wrapper, modal) {
    wrapper.innerHTML = '';
    
    let workingRules = JSON.parse(JSON.stringify(config.rules));
    let workingSettings = JSON.parse(JSON.stringify(config.settings));

    const onSave = async () => { 
        config.rules = workingRules;
        config.settings = workingSettings;
        await saveConfig(); 
        renderMenu(wrapper, modal); 
    };

    wrapper.appendChild(createHeader('パネル編集', () => renderMenu(wrapper, modal), onSave));

    const ruleSec = document.createElement('div');
    ruleSec.innerHTML = '<div class="editor-section-title">複数生成 (表示ルール)</div>';
    
    function renderRuleConfigSection(container, ruleObj, refreshCallback) {
        // (省略なし) 前回同様
        const displayDiv = document.createElement('div');
        displayDiv.style.marginBottom = '15px';
        displayDiv.innerHTML = '<div class="editor-sub-title">表示サイト</div>';
        const dModeRow = document.createElement('div'); dModeRow.className = 'editor-row';
        const dKey = Math.random();
        dModeRow.innerHTML = `<label><input type="radio" name="dm-${dKey}" value="all" ${ruleObj.isAll?'checked':''}>全て</label><label><input type="radio" name="dm-${dKey}" value="ind" ${!ruleObj.isAll?'checked':''}>個別追加</label>`;
        const dRadios = dModeRow.querySelectorAll('input');
        dRadios[0].onchange = () => { ruleObj.isAll = true; refreshCallback(); };
        dRadios[1].onchange = () => { ruleObj.isAll = false; refreshCallback(); };
        displayDiv.appendChild(dModeRow);
        if(!ruleObj.isAll) {
            if(!ruleObj.includes) ruleObj.includes = [];
            ruleObj.includes.forEach((inc, k) => {
                const r = document.createElement('div'); r.className='editor-row';
                r.innerHTML = `<input class="editor-input" value="${inc.url}" placeholder="URL" style="flex:2"><select class="editor-input" style="flex:1"><option value="prefix" ${inc.ruleType==='prefix'?'selected':''}>前半</option><option value="exact" ${inc.ruleType==='exact'?'selected':''}>完全</option></select>`;
                const inps = r.querySelectorAll('.editor-input');
                inps[0].onchange = (e) => inc.url = e.target.value;
                inps[1].onchange = (e) => inc.ruleType = e.target.value;
                displayDiv.appendChild(r);
            });
            const btnRow = document.createElement('div'); btnRow.className='editor-row';
            const addBtn = document.createElement('button'); addBtn.className='editor-btn-small'; addBtn.textContent='追加';
            const delBtn = document.createElement('button'); delBtn.className='editor-btn-small'; delBtn.textContent='削除';
            addBtn.onclick = () => { ruleObj.includes.push({url: '', ruleType: 'prefix'}); refreshCallback(); };
            delBtn.onclick = () => { if(ruleObj.includes.length > 0) { ruleObj.includes.pop(); refreshCallback(); } };
            btnRow.append(addBtn, delBtn);
            displayDiv.appendChild(btnRow);
        }
        container.appendChild(displayDiv);

        const excDiv = document.createElement('div');
        excDiv.style.marginBottom = '15px';
        excDiv.innerHTML = '<div class="editor-sub-title">除外指定</div>';
        const eModeRow = document.createElement('div'); eModeRow.className = 'editor-row';
        const eKey = Math.random();
        eModeRow.innerHTML = `<label><input type="radio" name="em-${eKey}" value="all" ${ruleObj.isExcludeAll?'checked':''}>全て</label><label><input type="radio" name="em-${eKey}" value="ind" ${!ruleObj.isExcludeAll?'checked':''}>個別追加</label>`;
        const eRadios = eModeRow.querySelectorAll('input');
        eRadios[0].onchange = () => { ruleObj.isExcludeAll = true; refreshCallback(); };
        eRadios[1].onchange = () => { ruleObj.isExcludeAll = false; refreshCallback(); };
        excDiv.appendChild(eModeRow);
        if(!ruleObj.isExcludeAll) {
            if(!ruleObj.excludes) ruleObj.excludes = [];
            ruleObj.excludes.forEach((exc, k) => {
                const r = document.createElement('div'); r.className='editor-row';
                r.innerHTML = `<input class="editor-input" value="${exc.url}" placeholder="URL" style="flex:2"><select class="editor-input" style="flex:1"><option value="prefix" ${exc.ruleType==='prefix'?'selected':''}>前半</option><option value="exact" ${exc.ruleType==='exact'?'selected':''}>完全</option></select>`;
                const inps = r.querySelectorAll('.editor-input');
                inps[0].onchange = (e) => exc.url = e.target.value;
                inps[1].onchange = (e) => exc.ruleType = e.target.value;
                excDiv.appendChild(r);
            });
            const btnRow = document.createElement('div'); btnRow.className='editor-row';
            const addBtn = document.createElement('button'); addBtn.className='editor-btn-small'; addBtn.textContent='追加';
            const delBtn = document.createElement('button'); delBtn.className='editor-btn-small'; delBtn.textContent='削除';
            addBtn.onclick = () => { ruleObj.excludes.push({url: '', ruleType: 'prefix'}); refreshCallback(); };
            delBtn.onclick = () => { if(ruleObj.excludes.length > 0) { ruleObj.excludes.pop(); refreshCallback(); } };
            btnRow.append(addBtn, delBtn);
            excDiv.appendChild(btnRow);
        }
        container.appendChild(excDiv);
    }

    const siteDiv = document.createElement('div');
    siteDiv.innerHTML = '<strong>サイト設定</strong>';
    function renderSiteSection() {
        const c = document.createElement('div');
        workingRules.sites.forEach((site, idx) => {
            const box = document.createElement('div'); box.className='editor-sub-box';
            const header = document.createElement('div'); header.className = 'editor-row';
            const title = document.createElement('div'); title.className = 'editor-sub-title'; title.textContent = `サイト設定 ${idx+1}`;
            const delBtn = document.createElement('button'); delBtn.className = 'editor-btn-small'; delBtn.style.marginLeft = 'auto'; delBtn.textContent = '削除';
            delBtn.onclick = () => { workingRules.sites.splice(idx, 1); refresh(); };
            header.append(title, delBtn);
            box.appendChild(header);
            renderRuleConfigSection(box, site, refresh);
            c.appendChild(box);
        });
        return c;
    }

    const btnDiv = document.createElement('div');
    btnDiv.style.marginTop = '20px';
    btnDiv.innerHTML = '<strong>ボタン設定</strong>';
    function renderBtnSection() {
        const c = document.createElement('div');
        workingRules.buttons.forEach((btn, idx) => {
            if (!btn.contentType) btn.contentType = 'default';
            if (typeof btn.hideOnScroll === 'undefined') btn.hideOnScroll = false; // 初期化

            const box = document.createElement('div'); box.className='editor-sub-box'; box.style.border = '2px solid #ccc';
            const header = document.createElement('div'); header.className = 'editor-row';
            const title = document.createElement('div'); title.className = 'editor-sub-title'; title.textContent = `ボタン ${idx+1}`;
            const delBtn = document.createElement('button'); delBtn.className = 'editor-btn-small'; delBtn.style.marginLeft = 'auto'; delBtn.textContent = '削除';
            delBtn.onclick = () => { workingRules.buttons.splice(idx, 1); refresh(); };
            header.append(title, delBtn);
            box.appendChild(header);
            renderRuleConfigSection(box, btn, refresh);

            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = '<div class="editor-sub-title" style="margin-top:15px">ボタン情報</div>';
            const dMode = document.createElement('div'); dMode.className='editor-row';
            const dmKey = Math.random();
            dMode.innerHTML = `<label><input type="radio" name="dm-${dmKey}" value="fixed" ${btn.displayMode==='fixed'?'checked':''}>固定表示</label><label><input type="radio" name="dm-${dmKey}" value="transparent" ${btn.displayMode==='transparent'?'checked':''}>透明化</label>`;
            const dRad = dMode.querySelectorAll('input');
            dRad[0].onchange = () => { btn.displayMode='fixed'; refresh(); };
            dRad[1].onchange = () => { btn.displayMode='transparent'; refresh(); };
            infoDiv.appendChild(dMode);

            // 固定表示時の「下スクロール透明化」設定
            if (btn.displayMode === 'fixed') {
                const scrollDiv = document.createElement('div');
                scrollDiv.className = 'editor-row';
                scrollDiv.style.marginBottom = '5px';
                const scrollLabel = document.createElement('label');
                const scrollCheck = document.createElement('input');
                scrollCheck.type = 'checkbox';
                scrollCheck.checked = btn.hideOnScroll;
                scrollCheck.onchange = (e) => btn.hideOnScroll = e.target.checked;
                scrollLabel.append(scrollCheck, " 下スクロール時ボタンを透明化");
                scrollDiv.appendChild(scrollLabel);
                infoDiv.appendChild(scrollDiv);
            }

            if(btn.displayMode === 'transparent') {
                const curDiv = document.createElement('div');
                curDiv.innerHTML = '<div>カーソル域</div>';
                const cur = btn.cursor;
                curDiv.innerHTML += `<div class="editor-row">左上: 上<input class="editor-input" style="width:50px" type="number" value="${cur.top}" id="ct-${idx}"> 左<input class="editor-input" style="width:50px" type="number" value="${cur.left}" id="cl-${idx}"></div>`;
                curDiv.innerHTML += `<div class="editor-row">右下: 上<input class="editor-input" style="width:50px" type="number" value="${cur.bottom}" id="cb-${idx}"> 左<input class="editor-input" style="width:50px" type="number" value="${cur.right}" id="cr-${idx}"></div>`;
                infoDiv.appendChild(curDiv);
            }
            const disDiv = document.createElement('div');
            disDiv.innerHTML = '<div>表示域</div>';
            const dis = btn.display;
            disDiv.innerHTML += `<div class="editor-row">左上: 上<input class="editor-input" style="width:50px" type="number" value="${dis.top}" id="dt-${idx}"> 左<input class="editor-input" style="width:50px" type="number" value="${dis.left}" id="dl-${idx}"></div>`;
            disDiv.innerHTML += `<div class="editor-row">右下: 上<input class="editor-input" style="width:50px" type="number" value="${dis.bottom}" id="db-${idx}"> 左<input class="editor-input" style="width:50px" type="number" value="${dis.right}" id="dr-${idx}"></div>`;
            infoDiv.appendChild(disDiv);
            box.appendChild(infoDiv);

            setTimeout(() => {
                const setVal = (id, obj, key) => { const el = box.querySelector('#'+id); if(el) el.onchange = (e) => obj[key] = parseInt(e.target.value); };
                if(btn.displayMode==='transparent') {
                    setVal(`ct-${idx}`, btn.cursor, 'top'); setVal(`cl-${idx}`, btn.cursor, 'left');
                    setVal(`cb-${idx}`, btn.cursor, 'bottom'); setVal(`cr-${idx}`, btn.cursor, 'right');
                }
                setVal(`dt-${idx}`, btn.display, 'top'); setVal(`dl-${idx}`, btn.display, 'left');
                setVal(`db-${idx}`, btn.display, 'bottom'); setVal(`dr-${idx}`, btn.display, 'right');
            }, 0);

            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = '<div class="editor-sub-title" style="margin-top:15px">表示内容</div>';
            const cMode = document.createElement('div'); cMode.className='editor-row';
            const cmKey = Math.random();
            cMode.innerHTML = `<label><input type="radio" name="cm-${cmKey}" value="default">デフォルト</label><label><input type="radio" name="cm-${cmKey}" value="custom">カスタム</label>`;
            const cRad = cMode.querySelectorAll('input');
            if(btn.contentType === 'default') cRad[0].checked = true; else cRad[1].checked = true;
            cRad[0].onclick = () => { btn.contentType='default'; refresh(); };
            cRad[1].onclick = () => { btn.contentType='custom'; refresh(); };
            contentDiv.appendChild(cMode);

            if(btn.contentType === 'custom') {
                if(!btn.custom) btn.custom = { bgColor:'blue', borderRadius:5, buttonText:'P', textColor:'white', fontSize:14, opacity:100 };
                const c = btn.custom;
                const customFields = document.createElement('div');
                customFields.className = "editor-form-group";
                customFields.innerHTML = `
                  <label>背景色</label><input class="editor-input" value="${c.bgColor}" id="c-bg-${idx}">
                  <label>四隅半径(px)</label><input class="editor-input" type="number" value="${c.borderRadius}" id="c-rad-${idx}">
                  <label>文字表示</label><input class="editor-input" value="${c.buttonText}" id="c-txt-${idx}">
                  <label>文字色</label><input class="editor-input" value="${c.textColor}" id="c-col-${idx}">
                  <label>文字大きさ(px)</label><input class="editor-input" type="number" value="${c.fontSize}" id="c-sz-${idx}">
                  <label>透明度(0-100)</label><input class="editor-input" type="number" value="${c.opacity}" id="c-op-${idx}">
                `;
                contentDiv.appendChild(customFields);
                setTimeout(() => {
                    box.querySelector(`#c-bg-${idx}`).onchange=(e)=>c.bgColor=e.target.value;
                    box.querySelector(`#c-rad-${idx}`).onchange=(e)=>c.borderRadius=parseInt(e.target.value);
                    box.querySelector(`#c-txt-${idx}`).onchange=(e)=>c.buttonText=e.target.value;
                    box.querySelector(`#c-col-${idx}`).onchange=(e)=>c.textColor=e.target.value;
                    box.querySelector(`#c-sz-${idx}`).onchange=(e)=>c.fontSize=parseInt(e.target.value);
                    box.querySelector(`#c-op-${idx}`).onchange=(e)=>c.opacity=parseInt(e.target.value);
                }, 0);
            }
            box.appendChild(contentDiv);
            c.appendChild(box);
        });
        return c;
    }

    const keyDiv = document.createElement('div');
    keyDiv.style.marginTop = '20px';
    keyDiv.innerHTML = '<strong>キーボード設定</strong>';
    function renderKeySection() {
        const c = document.createElement('div');
        workingRules.keyboards.forEach((kb, idx) => {
             const box = document.createElement('div'); box.className='editor-sub-box'; box.style.border = '2px solid #ccc';
             const header = document.createElement('div'); header.className = 'editor-row';
             const title = document.createElement('div'); title.className = 'editor-sub-title'; title.textContent = `キーボード ${idx+1}`;
             const delBtn = document.createElement('button'); delBtn.className = 'editor-btn-small'; delBtn.style.marginLeft = 'auto'; delBtn.textContent = '削除';
             delBtn.onclick = () => { workingRules.keyboards.splice(idx, 1); refresh(); };
             header.append(title, delBtn);
             box.appendChild(header);
             renderRuleConfigSection(box, kb, refresh);
             const infoDiv = document.createElement('div');
             infoDiv.innerHTML = `<div class="editor-sub-title" style="margin-top:15px">キーボード情報</div><div class="editor-row"><label>ショートカットキー</label><input class="editor-input" style="width:50px" value="${kb.key}" id="key-${idx}"></div>`;
             const input = infoDiv.querySelector('input');
             input.onchange = (e) => kb.key = e.target.value;
             box.appendChild(infoDiv);
             c.appendChild(box);
        });
        return c;
    }

    function refresh() {
        siteDiv.innerHTML = '<strong>サイト設定</strong>'; siteDiv.appendChild(renderSiteSection());
        btnDiv.innerHTML = '<strong>ボタン設定</strong>';  btnDiv.appendChild(renderBtnSection());
        keyDiv.innerHTML = '<strong>キーボード設定</strong>'; keyDiv.appendChild(renderKeySection());
    }
    refresh();

    ruleSec.append(siteDiv, btnDiv, keyDiv);
    
    // 追加用のセレクトボックス UI
    const addActionDiv = document.createElement('div');
    addActionDiv.style.marginTop = '20px';
    addActionDiv.style.borderTop = '1px solid #ccc';
    addActionDiv.style.paddingTop = '10px';
    
    const addRow = document.createElement('div');
    addRow.className = 'editor-row';
    const typeSelect = document.createElement('select');
    typeSelect.className = 'editor-input';
    typeSelect.style.width = 'auto';
    typeSelect.innerHTML = `<option value="site">サイト</option><option value="button">ボタン</option><option value="keyboard">キーボード</option>`;
    
    const doAddBtn = document.createElement('button');
    doAddBtn.className = 'editor-btn-small';
    doAddBtn.textContent = '追加';
    
    doAddBtn.onclick = () => {
        const type = typeSelect.value;
        if (type === 'site') {
            workingRules.sites.push({ isAll:false, includes:[{url:'', ruleType:'exact'}], isExcludeAll:false, excludes:[] });
        } else if (type === 'button') {
            workingRules.buttons.push({
                displayMode: 'fixed', hideOnScroll: false, display: {top:0,left:30,bottom:30,right:60}, cursor: {top:0,left:30,bottom:30,right:60}, 
                contentType: 'default', isAll: true, includes:[], isExcludeAll:false, excludes:[],
                custom: { bgColor:'blue', borderRadius:5, buttonText:'P', textColor:'white', fontSize:14, opacity:100 }
            });
        } else if (type === 'keyboard') {
            workingRules.keyboards.push({ key: 'k', isAll:true, includes:[], isExcludeAll:false, excludes:[] });
        }
        refresh();
    };
    
    addRow.append(typeSelect, doAddBtn);
    addActionDiv.appendChild(addRow);
    ruleSec.appendChild(addActionDiv);

    wrapper.appendChild(ruleSec);

    const basic = document.createElement('div');
    basic.innerHTML = '<div class="editor-section-title">基本設定</div>';
    const settings = [{l:'サイズスケール', k:'scale'}, {l:'グリッド列', k:'gridCols'}, {l:'グリッド行', k:'gridRows'}, {l:'フォルダスケール', k:'folderScale'}, {l:'フォルダ列', k:'folderGridCols'}, {l:'フォルダ行', k:'folderGridRows'}];
    settings.forEach(s => { basic.appendChild(createInputRow(s.l, workingSettings[s.k], v => workingSettings[s.k]=parseInt(v))); });

    const posDiv = document.createElement('div');
    posDiv.className = 'editor-form-group';
    posDiv.innerHTML = `<label class="editor-label">パネル位置</label>`;
    const posRow1 = document.createElement('div'); posRow1.className='editor-row';
    const posRow2 = document.createElement('div'); posRow2.className='editor-row';
    posRow1.innerHTML = `<select id="yp"><option value="top">上</option><option value="bottom">下</option></select> <input id="yv" class="editor-input" style="width:60px" type="number">px`;
    posRow2.innerHTML = `<select id="xp"><option value="left">左</option><option value="right">右</option></select> <input id="xv" class="editor-input" style="width:60px" type="number">px`;
    posDiv.append(posRow1, posRow2);
    basic.appendChild(posDiv);
    
    setTimeout(()=>{
        const s = workingSettings.position;
        const e = (id)=>posDiv.querySelector('#'+id);
        e('yp').value = s.yProp; e('yp').onchange=(v)=>s.yProp=v.target.value;
        e('yv').value = s.yVal;  e('yv').onchange=(v)=>s.yVal=parseInt(v.target.value);
        e('xp').value = s.xProp; e('xp').onchange=(v)=>s.xProp=v.target.value;
        e('xv').value = s.xVal;  e('xv').onchange=(v)=>s.xVal=parseInt(v.target.value);
    }, 0);

    const baseColorDiv = document.createElement('div');
    baseColorDiv.className = 'editor-form-group';
    baseColorDiv.innerHTML = `<label class="editor-label">基本の文字色</label><label><input type="radio" name="bc" value="white" ${workingSettings.baseTextColor==='white'?'checked':''}>白</label><label><input type="radio" name="bc" value="black" ${workingSettings.baseTextColor==='black'?'checked':''}>黒</label>`;
    baseColorDiv.querySelectorAll('input').forEach(i => i.onchange=()=>workingSettings.baseTextColor=i.value);
    basic.appendChild(baseColorDiv);

    const animDiv = document.createElement('div');
    animDiv.innerHTML = '<div class="editor-section-title">アニメーション</div>';
    animDiv.appendChild(createInputRow('メインパネル開閉時間 (秒)', workingSettings.animation.main, v => workingSettings.animation.main = parseFloat(v)));
    animDiv.appendChild(createInputRow('サブパネル開閉時間 (秒)', workingSettings.animation.sub, v => workingSettings.animation.sub = parseFloat(v)));
    
    const outsideDiv = document.createElement('div');
    outsideDiv.innerHTML = '<div class="editor-sub-title" style="margin-top:10px;">パネル外クリックで閉じる</div>';
    const outsideRow = document.createElement('div'); outsideRow.className = 'editor-row';
    const oc = workingSettings.closeOnOutsideClick;
    const createCheck = (label, key) => {
        const l = document.createElement('label'); l.style.marginRight='15px';
        const cb = document.createElement('input'); cb.type = 'checkbox';
        cb.checked = oc[key];
        cb.onchange = (e) => oc[key] = e.target.checked;
        l.append(cb, " " + label);
        return l;
    };
    outsideRow.append(createCheck('サイト', 'site'), createCheck('ボタン', 'button'), createCheck('キーボード', 'keyboard'));
    outsideDiv.appendChild(outsideRow);
    animDiv.appendChild(outsideDiv);

    basic.appendChild(animDiv);

    wrapper.appendChild(basic);
  }

  // --- 4. インポート ---
  function renderImportView(wrapper, modal) {
    wrapper.innerHTML = ''; wrapper.appendChild(createHeader('インポート', () => renderMenu(wrapper, modal)));
    const ta = document.createElement('textarea'); ta.className = 'editor-input'; ta.style.height = '200px'; ta.placeholder = 'JSONデータ または 生成したJavaScript(ブックマークレット)を貼り付け';
    const btn = document.createElement('button'); btn.className = 'editor-save-btn'; btn.textContent = '読み込み'; btn.style.marginTop = '10px';
    
    btn.onclick = async () => {
        const text = ta.value.trim(); if (!text) return;
        
        let loadedConfig = null;
        try { 
            const data = JSON.parse(text); 
            if(data.settings && data.items) loadedConfig = data; 
            else if(data.items) { config.items = data.items; loadedConfig = config; }
        } catch(e) {}
        
        if (!loadedConfig) {
             try { 
                const extracted = parseBookmarkletJS(text); 
                if (extracted) { 
                    config.settings = extracted.settings; 
                    config.items = extracted.items; 
                    if (extracted.colorRules) config.settings.colorRules = extracted.colorRules; 
                    loadedConfig = config;
                }
            } catch(e) { console.error(e); }
        }

        if (loadedConfig) {
            config = loadedConfig;
            if(!config.settings.animation) config.settings.animation = { main: 0.2, sub: 0.2 };
            if(!config.settings.closeOnOutsideClick) config.settings.closeOnOutsideClick = { site: false, button: false, keyboard: false };
            
            btn.textContent = '画像データを取得して内部保存中...';
            btn.disabled = true;

            const urlsToFetch = new Set();
            function extractUrls(items) {
                items.forEach(item => {
                    if (item.icon && item.icon.startsWith('http')) urlsToFetch.add(item.icon);
                    if (item.children) extractUrls(item.children);
                });
            }
            extractUrls(config.items);

            for (const url of urlsToFetch) {
                if (!iconCache[url]) {
                    const b64 = await fetchAndResizeImage(url);
                    if (b64) iconCache[url] = b64;
                }
            }
            
            await saveConfig(); 
            alert('インポートと画像の内部保存が完了しました'); 
            renderMenu(wrapper, modal); 
        } else {
            alert('データ形式を認識できませんでした。'); 
        }
    };
    wrapper.append(ta, btn);
  }
  function parseBookmarkletJS(code) {
      const getNum = (key) => { const m = code.match(new RegExp(`${key}:\\s*(-?\\d+)`)); return m ? parseInt(m[1]) : null; };
      const getStr = (key) => { const m = code.match(new RegExp(`${key}:\\s*'([^']*)'`)); return m ? m[1] : null; };
      let items = []; const itemsMatch = code.match(/const items = (\[[\s\S]*?\]);/); if (itemsMatch) { try { items = JSON.parse(itemsMatch[1]); } catch(e) { return null; } } else { return null; }
      const settings = { scale: getNum('scale') || 75, gridCols: getNum('gridCols') || 5, gridRows: getNum('gridRows') || 4, folderScale: getNum('folderScale') || 100, folderGridCols: getNum('folderGridCols') || 4, folderGridRows: getNum('folderGridRows') || 4, position: { yProp: getStr('yProp') || 'bottom', yVal: getNum('yVal') || 10, xProp: getStr('xProp') || 'right', xVal: getNum('xVal') || 15 }, baseTextColor: (code.match(/const baseTextColor = '([^']+)';/) || [])[1] || 'white', colorRules: [] };
      const urlRulesMatch = code.match(/const urlRules = (\[[\s\S]*?\]);/); let colorRules = []; if (urlRulesMatch) { try { colorRules = JSON.parse(urlRulesMatch[1]); } catch(e) {} }
      return { items, settings, colorRules };
  }
  // --- 5. エクスポート ---
  function renderExportView(wrapper, modal) {
    wrapper.innerHTML = ''; wrapper.appendChild(createHeader('エクスポート', () => renderMenu(wrapper, modal)));
    const ta = document.createElement('textarea'); ta.className = 'editor-input'; ta.style.height = '200px'; ta.value = JSON.stringify(config, null, 2); wrapper.appendChild(ta);
  }
  function createInputRow(label, val, setter) {
    const div = document.createElement('div'); div.className = 'editor-form-group'; div.innerHTML = `<label class="editor-label">${label}</label>`;
    const inp = document.createElement('input'); inp.className = 'editor-input'; inp.value = val; inp.onchange = (e) => setter(e.target.value); div.appendChild(inp); return div;
  }
})();