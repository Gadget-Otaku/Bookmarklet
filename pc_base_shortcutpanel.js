javascript:(function() {
  'use strict';
  /* MULTIGEN_METADATA: [{"type":"toolpanel_button","fileName":"pctool.user","buttonName":"ショートカットパネル","position":{"yProp":"top","yVal":"10","xProp":"left","xVal":"10"},"autoExpandRules":[{"url":"https://x.com/","folderName":"X"},{"url":"https://www.youtube.com/","folderName":"Youtube"},{"url":"https://mail.google.com/","folderName":"メール"},{"url":"https://sites.google.com/view/toolpaneleditor/","folderName":"ツールパネル"},{"url":"https://gadget-otaku.github.io/Bookmarklet/HTML%E5%88%B6%E4%BD%9C/%E7%B5%B1%E5%90%88%E3%83%84%E3%83%BC%E3%83%AB%E3%83%91%E3%83%8D%E3%83%AB%E3%83%BB%E3%82%B8%E3%82%A7%E3%83%8D%E3%83%AC%E3%83%BC%E3%82%BF%E3%83%BC%203.0.html","folderName":"ツールパネル"},{"url":"https://sites.google.com/view/homepage-custom-shortcut/","folderName":"ShortcutPanel"},{"url":"https://sites.google.com/view/userscriptgenerator/","folderName":"UserScript"},{"url":"https://sites.google.com/view/custome-search2/","folderName":"カスタムショートカット"},{"url":"https://gadget-otaku.github.io/Bookmarklet/","folderName":"制作"},{"url":"https://chatgpt.com/","folderName":"制作"},{"url":"https://gemini.google.com/","folderName":"制作"},{"url":"https://x.com/i/","folderName":"制作"},{"url":"https://chat.deepseek.com/","folderName":"制作"}],"favoritesList":["UserScript編集・更新","メモ帳","ショートカットパネル","JavaScript実行","再生速度","Geminiに質問ツールパネル","ローマ字変換"],"githubLinkRules":[{"buttonName":"リスト付きX詳細検索","githubUrl":"https://github.com/Gadget-Otaku/Bookmarklet/blob/main/x-search-panel.js"},{"buttonName":"ショートカットパネル","githubUrl":"https://github.com/Gadget-Otaku/Bookmarklet/blob/main/pc_base_shortcutpanel.js"}],"name":"pctool.user","version":"1.1.26","downloadURL":"https://github.com/Gadget-Otaku/Bookmarklet/blob/main/pctool.user.js","updateURL":"https://github.com/Gadget-Otaku/Bookmarklet/blob/main/pctool.user.js","urls":[{"type":"match","url":"http*://*\/*"}],"mode":"button","button":{"displayMode":"transparent","display":{"top":"0","left":"0","bottom":"30","right":"30"},"cursor":{"top":"0","left":"0","bottom":"30","right":"30"},"contentType":"default"}},{"type":"google_homepage","fileName":"pc_google_shortcutpanel.user","name":"Googleカスタムショートカット","version":"1.1.24"},{"type":"javascript","fileName":"pc_base_shortcutpanel"},{"type":"userscript_button","fileName":"pc_botton_shortcutpanel.user","name":"pc_botton_shortcutpanel.user","version":"1.0.2","downloadURL":"https://github.com/Gadget-Otaku/Bookmarklet/blob/main/pc_botton_shortcutpanel.user.js","updateURL":"https://github.com/Gadget-Otaku/Bookmarklet/blob/main/pc_botton_shortcutpanel.user.js","urls":[{"type":"match","url":"http*://*\/*"}],"mode":"button","button":{"displayMode":"transparent","display":{"top":"0","left":"30","bottom":"30","right":"60"},"cursor":{"top":"30","left":"0","bottom":"60","right":"30"},"contentType":"default"}}] */
   const metadata = {
  "name": "Googleカスタムショートカット",
  "source": "",
  "downloadURL": "",
  "updateURL": ""
};

  const config = {
   scale: 80, gridCols: 5, gridRows: 4, topOffset: 20, leftOffset: -460
  };
  const items = [
       {
           "name": "YouTube",
           "url": "https://www.youtube.com",
           "icon": "https://images.icon-icons.com/1584/PNG/512/3721679-youtube_108064.png"
       },
       {
           "name": "X",
           "url": "https://x.com/home",
           "icon": "https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg"
       },
       {
           "name": "AI",
           "isFolder": true,
           "children": [
               {
                   "name": "ChatGPT",
                   "url": "https://chatgpt.com/?model=auto",
                   "icon": "https://i.pinimg.com/736x/a6/8e/fc/a68efcad5debfbe207f52e8c19b379e9.jpg"
               },
               {
                   "name": "Gemini",
                   "url": "https://gemini.google.com/app?hl=ja",
                   "icon": "https://asset.watch.impress.co.jp/img/ktw/docs/1583/273/icon_l.jpg"
               },
               {
                   "name": "DeepSeek",
                   "url": "https://chat.deepseek.com",
                   "icon": "https://play-lh.googleusercontent.com/d2zqBFBEymSZKaVg_dRo1gh3hBFn7_Kl9rO74xkDmnJeLgDW0MoJD3cUx0QzZN6jdsg"
               },
               {
                   "name": "Venice AI",
                   "url": "https://venice.ai/chat",
                   "icon": "https://www.google.com/s2/favicons?sz=64&domain_url=venice.ai"
               },
               {
                   "name": "Genspark",
                   "url": "https://www.genspark.ai/agents?type=moa_chat",
                   "icon": "https://www.google.com/s2/favicons?sz=64&domain_url=www.genspark.ai"
               }
           ]
       },
       {
           "name": "ガジェット",
           "isFolder": true,
           "children": [
               {
                   "name": "CPU性能比較",
                   "url": "https://pcfreebook.com/article/458775622.html",
                   "icon": "https://pcfreebook.com/wp-content/uploads/2020/02/cpu-speclist-desktop-top.png"
               },
               {
                   "name": "GPU性能比較",
                   "url": "https://pcfreebook.com/article/459993300.html",
                   "icon": "https://pcfreebook.com/wp-content/uploads/2020/02/cpu-speclist-desktop-top.png"
               },
               {
                   "name": "価格 ノートパソコン",
                   "url": "https://s.kakaku.com/pc/note-pc/itemlist.aspx#/popup=narrow",
                   "icon": "https://play-lh.googleusercontent.com/aTlc3ts5q7sz-b8WaKi6xjcTVgcp4toOWKBuJwaNK7xRy99WGH6WtUKAzyz8sJNt3y8"
               },
               {
                   "name": "価格 ミラーレス",
                   "url": "https://s.kakaku.com/camera/mirrorless-slr/itemlist.aspx#/popup=narrow",
                   "icon": "https://play-lh.googleusercontent.com/aTlc3ts5q7sz-b8WaKi6xjcTVgcp4toOWKBuJwaNK7xRy99WGH6WtUKAzyz8sJNt3y8"
               },
               {
                   "name": "価格 ズームレンズ",
                   "url": "https://s.kakaku.com/camera/zoom_lens/itemlist.aspx#/popup=narrow",
                   "icon": "https://play-lh.googleusercontent.com/aTlc3ts5q7sz-b8WaKi6xjcTVgcp4toOWKBuJwaNK7xRy99WGH6WtUKAzyz8sJNt3y8"
               },
               {
                   "name": "gsmarena phonefinder",
                   "url": "https://m.gsmarena.com/search.php3?",
                   "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVOOCuz-6hrhEDC_sy9eVqnq_Q_r843ul56w&s"
               },
               {
                   "name": "スマホ イメージセンサー",
                   "url": "https://spinformation.info/all/smartphone-image-sensor/",
                   "icon": "https://www.google.com/s2/favicons?sz=64&domain_url=spinformation.info"
               },
               {
                   "name": "visaギフト",
                   "url": "https://mygift.giftcardmall.com/",
                   "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Old_Visa_Logo.svg/250px-Old_Visa_Logo.svg.png"
               },
               {
                   "name": "腕時計 時刻合わせ",
                   "url": "https://support.casio.jp/wat/adjustment/ta5161_ja/",
                   "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKM2zBns6CTS8niY7RI-YTpb7OwgbChkvhBw&s"
               },
               {
                   "name": "Pixiv",
                   "url": "https://www.pixiv.net/bookmark_new_illust.php",
                   "icon": "https://www.google.com/s2/favicons?sz=64&domain_url=pixiv.net"
               },
               {
                   "name": "hanime",
                   "url": "https://hianime.to/recently-updated",
                   "icon": "https://www.google.com/s2/favicons?sz=64&domain_url=hianime.to"
               }
           ]
       },
       {
           "name": "翻訳",
           "url": "https://translate.google.co.jp/?hl=ja&tab=rT&sl=en&tl=ja&op=translate",
           "icon": "https://play-lh.googleusercontent.com/ZrNeuKthBirZN7rrXPN1JmUbaG8ICy3kZSHt-WgSnREsJzo2txzCzjIoChlevMIQEA=w240-h480-rw"
       },
       {
           "name": "Astate",
           "url": "https://www.astate.edu",
           "icon": "https://www.astate.edu/dotAsset/dab6dbb0-0dae-439c-b6d6-1e729565418a.png"
       },
       {
           "name": "Dashboard",
           "url": "https://pack.astate.edu/public/dashboard",
           "icon": "https://www.google.com/s2/favicons?sz=256&domain_url=pack.astate.edu"
       },
       {
           "name": "大学関連",
           "isFolder": true,
           "children": [
               {
                   "name": "mybill",
                   "url": "https://epay.astate.edu/C20019_tsa/web/login.jsp",
                   "icon": "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://epay.astate.edu/C20019_tsa/web/login.jsp&size=16"
               },
               {
                   "name": "Housing",
                   "url": "https://astate.starrezhousing.com/StarRezPortalX/FC6488C4/1/1/Home-Welcome_to_the_A_Sta?UrlToken=A0AC9875",
                   "icon": "https://iconbox.fun/wp/wp-content/uploads/192_b_24.png"
               },
               {
                   "name": "バス",
                   "url": "https://www.astate.edu/a/global-initiatives/international/forms/student-advising",
                   "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsKEzw38TGeOe-kK91Wsvg05lgWbxyQj57DQ&s"
               },
               {
                   "name": "ｽｹｼﾞｭ-ﾙ",
                   "url": "https://catalog.astate.edu/preview_program.php?catoid=8&poid=2347&returnto=244",
                   "icon": "https://img.icons8.com/color/512/google-logo.png"
               },
               {
                   "name": "英語 教材",
                   "url": "https://asuj.grlcontent.com/user/login?autologout_timeout=1",
                   "icon": "https://play-lh.googleusercontent.com/Z567KavO3EE8mxGFtzgGrCkEtdljuySFNqxlaWACW5lcrksBUXC4CA0kHLJ0gYgoy5Y=w240-h480-rw"
               },
               {
                   "name": "教材 bookstore",
                   "url": "https://astatebookstore.com/textbooks",
                   "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsE604CUZK43liZCcbSISUiHL9CoMB8AJxJg&s"
               },
               {
                   "name": "vitalsource",
                   "url": "https://bookshelf.vitalsource.com/home/dashboard?context=login",
                   "icon": "https://store-images.s-microsoft.com/image/apps.15180.14164704504445663.3fbcf2df-8bab-4f09-822a-094d3f6ef53e.b6ea252f-f946-4acc-96c0-e2dc7370daf8"
               },
               {
                   "name": "食事 時間",
                   "url": "https://astate.sodexomyway.com/en-us/locations/",
                   "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp0r7Ed3_kbqc9UumdzCIDUtuxts-qjAewBA&s"
               }
           ]
       },
       {
           "name": "Outlook",
           "url": "https://outlook.office365.com/mail/",
           "icon": "https://cdn.iconscout.com/icon/free/png-256/free-microsoft-outlook-1868952-1583116.png"
       },
       {
           "name": "Gmail",
           "url": "https://mail.google.com/mail/u/1/#inbox",
           "icon": "https://img.icons8.com/color/512/gmail-new.png"
       },
       {
           "name": "Github",
           "url": "https://github.com/Gadget-Otaku/Bookmarklet",
           "icon": "https://cdn-icons-png.freepik.com/256/733/733609.png"
       },
       {
           "name": "GreasyFork",
           "url": "https://greasyfork.org/ja/users/1433480-%E3%82%B9%E3%83%9E%E3%83%9B%E3%82%AA%E3%82%BF%E3%82%AF%E3%81%AB%E3%82%8F%E3%81%8B",
           "icon": "https://files.svgcdn.io/simple-icons/greasyfork.svg"
       },
       {
           "name": "メモ帳2.0",
           "url": "https://gadget-otaku.github.io/Bookmarklet/%E3%83%A1%E3%83%A2%E5%B8%B32.0",
           "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmsAZYI27WQaMCSK-W8M-1FoW4Tx-0BWk6dA&s"
       },
       {
           "name": "制作",
           "isFolder": true,
           "children": [
               {
                   "name": "ツールパネル",
                   "url": "https://gadget-otaku.github.io/Bookmarklet/HTML%E5%88%B6%E4%BD%9C/%E7%B5%B1%E5%90%88%E3%83%84%E3%83%BC%E3%83%AB%E3%83%91%E3%83%8D%E3%83%AB%E3%83%BB%E3%82%B8%E3%82%A7%E3%83%8D%E3%83%AC%E3%83%BC%E3%82%BF%E3%83%BC%203.0.html",
                   "icon": "https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/refs/heads/main/HTML%E5%88%B6%E4%BD%9C/favicon/%E7%B5%B1%E5%90%88%E3%83%84%E3%83%BC%E3%83%AB%E3%83%91%E3%83%8D%E3%83%AB%E3%83%BB%E3%82%B8%E3%82%A7%E3%83%8D%E3%83%AC%E3%83%BC%E3%82%BF%E3%83%BC%203.0%E7%94%A8favicon.ico"
               },
               {
                   "name": "ショートカットパネル",
                   "url": "https://gadget-otaku.github.io/Bookmarklet/HTML%E5%88%B6%E4%BD%9C/%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%82%AB%E3%83%83%E3%83%88%E3%83%91%E3%83%8D%E3%83%AB%E7%94%9F%E6%88%90%E3%83%BB%E7%B7%A8%E9%9B%86%E3%82%B5%E3%82%A4%E3%83%88.html",
                   "icon": "https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/main/HTML%E5%88%B6%E4%BD%9C/favicon/%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%82%AB%E3%83%83%E3%83%88%E3%83%91%E3%83%8D%E3%83%AB%E7%94%9F%E6%88%90%E3%83%BB%E7%B7%A8%E9%9B%86%E3%82%B5%E3%82%A4%E3%83%88%E7%94%A8favicon.ico"
               },
               {
                   "name": "UserScript",
                   "url": "https://gadget-otaku.github.io/Bookmarklet/HTML%E5%88%B6%E4%BD%9C/UserScript%20%E7%94%9F%E6%88%90%EF%BC%86%E7%B7%A8%E9%9B%86%E3%82%B5%E3%82%A4%E3%83%883.0.html",
                   "icon": "https://img.icons8.com/color/512/google-sites--v2.png"
               },
               {
                   "name": "X詳細検索",
                   "url": "https://sites.google.com/view/x-advanced-panel-generator/%E3%83%9B%E3%83%BC%E3%83%A0",
                   "icon": "https://img.icons8.com/color/512/google-sites--v2.png"
               },
               {
                   "name": "カスタム検索ブックマークレット生成・編集サイト2.0",
                   "url": "https://gadget-otaku.github.io/Bookmarklet/HTML%E5%88%B6%E4%BD%9C/%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0%E6%A4%9C%E7%B4%A2.html",
                   "icon": "https://img.icons8.com/color/512/google-sites--v2.png"
               },
               {
                   "name": "site:検索",
                   "url": "https://sites.google.com/view/site-search-multi-function/%E3%83%9B%E3%83%BC%E3%83%A0",
                   "icon": "https://img.icons8.com/color/512/google-sites--v2.png"
               },
               {
                   "name": "Googleサイト",
                   "url": "https://sites.google.com/new?hl=ja",
                   "icon": "https://img.icons8.com/color/512/google-sites--v2.png"
               }
           ]
       },
       {
           "name": "Notion",
           "url": "https://www.notion.so/2f61b782539d4036bef474f820fa42c2",
           "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1024px-Notion-logo.svg.png"
       },
       {
           "name": "365",
           "url": "https://m365.cloud.microsoft/?acctsw=1&auth=1",
           "icon": "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/Icon_Copilot_64x64?resMode=sharp2&op_usm=1.5,0.65,15,0&wid=32&hei=32&qlt=100&fit=constrain"
       },
       {
           "name": "アドオン",
           "isFolder": true,
           "children": [
               {
                   "name": "Chrome拡張機能",
                   "url": "https://chromewebstore.google.com/category/extensions?hl=ja",
                   "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Google_Chrome_Web_Store_icon_2022.svg/2356px-Google_Chrome_Web_Store_icon_2022.svg.png"
               },
               {
                   "name": "Firefoxアドオン",
                   "url": "https://addons.mozilla.org/ja/firefox/",
                   "icon": "https://play-lh.googleusercontent.com/zqsuwFUBwKRcGOSBinKQCL3JgfvOW49vJphq0ZF32aDgfqmuDyl-fEpx4Lxm4pRr7A=s256-rw"
               },
               {
                   "name": "Edgeアドオン",
                   "url": "https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home?hl=ja-jp",
                   "icon": "https://images.icon-icons.com/2429/PNG/512/microsoft_logo_icon_147261.png"
               }
           ]
       },
       {
           "name": "IBT・TOEIC・就活",
           "isFolder": true,
           "children": [
               {
                   "name": "IBT",
                   "url": "https://toeflibt.ets.org/home",
                   "icon": "https://titc.or.id/wp-content/uploads/2025/04/TOEFL-IBT-Home-Edition.png"
               },
               {
                   "name": "Ankilot",
                   "url": "https://ankilot.com/",
                   "icon": "https://www.google.com/s2/favicons?sz=256&domain_url=ankilot.com"
               }
           ]
       },
       {
           "name": "Google",
           "isFolder": true,
           "children": [
               {
                   "name": "Keep",
                   "url": "https://keep.google.com/u/0/",
                   "icon": "https://www.g-workspace.jp/wp-content/uploads/Keep_Product_Icon_512dp.png"
               },
               {
                   "name": "ドライブ",
                   "url": "https://drive.google.com/drive/u/0/home",
                   "icon": "https://cdn-icons-png.freepik.com/256/5968/5968523.png?semt=ais_white_label"
               },
               {
                   "name": "ドキュメント",
                   "url": "https://docs.google.com/document/u/0/",
                   "icon": "https://cdn-icons-png.freepik.com/512/5968/5968517.png"
               },
               {
                   "name": "スプレッドシート",
                   "url": "https://docs.google.com/spreadsheets/u/0/",
                   "icon": "https://cdn-icons-png.freepik.com/256/5968/5968557.png?semt=ais_white_label"
               },
               {
                   "name": "スライド",
                   "url": "https://docs.google.com/presentation/u/0/",
                   "icon": "https://cdn-icons-png.freepik.com/256/2504/2504779.png?semt=ais_white_label"
               },
               {
                   "name": "マップ",
                   "url": "https://www.google.com/maps?authuser=0",
                   "icon": "https://cdn-icons-png.freepik.com/256/2662/2662686.png?semt=ais_white_label"
               },
               {
                   "name": "Earth",
                   "url": "https://earth.google.com/web/",
                   "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Google_Earth_icon.svg/2048px-Google_Earth_icon.svg.png"
               },
               {
                   "name": "パスワードマネージャー",
                   "url": "https://passwords.google.com/?hl=ja",
                   "icon": "https://images.icon-icons.com/2631/PNG/512/google_search_new_logo_icon_159150.png"
               },
               {
                   "name": "Colab",
                   "url": "https://colab.research.google.com/",
                   "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Colaboratory_SVG_Logo.svg/2560px-Google_Colaboratory_SVG_Logo.svg.png"
               },
               {
                   "name": "Notebook LM",
                   "url": "https://notebooklm.google.com/?authuser=0&original_referer=https:%2F%2Fogs.google.com%23&pli=1",
                   "icon": "https://play-lh.googleusercontent.com/qWDLmYCI4Lqzq8J-LhtvWvp1HIPkJb2lqkHjduXM7tnCo7N1tmKxnYdaX7CS2_5pkDuW"
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
           "url": "https://gadget-otaku.github.io/Bookmarklet/",
           "color": "black"
       }
   ];
  const styleText = `
     :root { --item-size: 72px; --icon-size: 40px; --folder-size: 40px; --border-radius: 12px; --panel-padding: 20px; --item-gap: 15px; }
     .panel-style { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-radius: var(--border-radius); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2), inset 0 1px 1px rgba(255,255,255,0.4); padding: var(--panel-padding); position: fixed; }
     .custom-shortcuts-container { transform: scale(${config.scale / 100}); transform-origin: top left; display: grid; grid-template-columns: repeat(${config.gridCols}, var(--item-size)); grid-auto-rows: var(--item-size); gap: var(--item-gap); z-index: 2147483647; pointer-events: auto; cursor: move; max-height: calc(var(--item-size) * ${config.gridRows} + var(--item-gap) * (${config.gridRows} - 1) + var(--panel-padding) * 2); overflow-y: auto; padding-right: 5px; }
     .custom-shortcuts-container::-webkit-scrollbar { width: 8px; } .custom-shortcuts-container::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.4); border-radius: 4px; } .custom-shortcuts-container::-webkit-scrollbar-track { background-color: rgba(255,255,255,0.1); }
     .panel-controls { position: absolute; top: 8px; right: 8px; display: flex; gap: 8px; cursor: default; }
     .control-button { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 12px; line-height: 16px; cursor: pointer; transition: all 0.2s; user-select: none; background-color: rgba(0, 0, 0, 0.7); }
     .new-tab-btn.active { background-color: rgba(255, 255, 255, 0.6) !important; color: #1a73e8 !important; font-weight: bold; }
     .settings-button { width: 16px; height: 16px; cursor: pointer; background-image: url('https://kotonohaworks.com/free-icons/wp-content/uploads/kkrn_icon_haguruma_1.png'); background-size: contain; background-repeat: no-repeat; background-position: center; filter: invert(1); opacity: 0.7; transition: opacity 0.2s; }
     .settings-button:hover { opacity: 1; }
     .custom-shortcut { display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; width: var(--item-size); height: var(--item-size); transition: all 0.2s; border-radius: var(--border-radius); padding: 4px; box-sizing: border-box; cursor: pointer; }
     .custom-shortcut:hover { transform: translateY(-5px); background: rgba(255,255,255,0.3); }
     .custom-shortcut img, .custom-shortcut .folder-icon-preview { width: var(--icon-size); height: var(--icon-size); object-fit: contain; border-radius: calc(var(--border-radius) * 0.5); }
     .custom-shortcut span { font-size: 12px; margin-top: 6px; text-align: center; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 0.3s; }
     .light-text .custom-shortcut span, .light-text .control-button { color: white !important; } .dark-text .custom-shortcut span, .dark-text .control-button { color: black !important; }
     .custom-folder .folder-icon-preview { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 2px; padding: 2px; width: var(--folder-size); height: var(--folder-size); background: rgba(0,0,0,0.1); border-radius: var(--border-radius); }
     .folder-icon-preview .preview-icon { width: 95%; height: 95%; background-size: contain; background-repeat: no-repeat; background-position: center; border-radius: 4px; }
     .folder-contents-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; display: flex; align-items: center; justify-content: center; animation: blurFadeIn 0.3s ease-out forwards; }
     .folder-contents { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; max-width: 400px; transform: scale(0.8); opacity: 0; animation: scaleUp 0.15s ease-out 0.05s forwards; position: relative; }
     @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } } @keyframes blurFadeIn { to { background: rgba(0,0,0,0.2); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); } }
   `;
  let isDarkMode = false; let newTabMode = false;
  function applyTheme(isDark) { isDarkMode = isDark; container.classList.toggle('dark-text', isDarkMode); container.classList.toggle('light-text', !isDarkMode); container.querySelector('.toggle-mode-btn').textContent = isDarkMode ? '●' : '◯'; }
  function createShortcut(item) { const link = document.createElement('a'); link.href = item.url; link.className = "custom-shortcut"; link.addEventListener('click', (e) => { e.preventDefault(); if (newTabMode) { window.open(link.href, '_blank'); } else { window.location.href = link.href; } }); const img = document.createElement('img'); try { img.src = item.icon || `https://www.google.com/s2/favicons?sz=64&domain_url=${new URL(item.url).hostname}`; } catch(e) { img.src = ''; } img.alt = item.name; img.onerror = (e) => { e.target.style.display='none'; }; const span = document.createElement('span'); span.textContent = item.name; link.appendChild(img); link.appendChild(span); return link; }
  function createFolder(item) { const folder = document.createElement('div'); folder.className = "custom-shortcut custom-folder"; const preview = document.createElement('div'); preview.className = 'folder-icon-preview'; if(item.children) { item.children.slice(0, 9).forEach(child => { if (child.icon) { const iconDiv = document.createElement('div'); iconDiv.className = 'preview-icon'; iconDiv.style.backgroundImage = `url(${child.icon})`; preview.appendChild(iconDiv); }}); } const span = document.createElement('span'); span.textContent = item.name; folder.appendChild(preview); folder.appendChild(span); folder.addEventListener('click', (e) => { e.stopPropagation(); const overlay = document.createElement('div'); overlay.className = 'folder-contents-overlay'; const contents = document.createElement('div'); contents.className = 'folder-contents panel-style'; contents.classList.toggle('dark-text', isDarkMode); contents.classList.toggle('light-text', !isDarkMode); if(item.children) { item.children.forEach(child => { if (!child.isFolder) { contents.appendChild(createShortcut(child)); } }); } overlay.appendChild(contents); document.body.appendChild(overlay); overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); }); }); return folder; }
  function makeDraggableAndPosition(element) { setTimeout(() => { const scale = config.scale / 100; const rect = element.getBoundingClientRect(); const containerWidth = rect.width / scale; const initialLeft = (window.innerWidth / 2) + config.leftOffset - (containerWidth / 2); element.style.left = `${initialLeft}px`; element.style.top = `${config.topOffset}px`; }, 0); let startX, startY, startLeft, startTop; element.addEventListener('mousedown', (e) => { if (e.target.closest('.custom-shortcut, .panel-controls')) return; e.preventDefault(); const scale = config.scale / 100; startX = e.clientX; startY = e.clientY; startLeft = element.offsetLeft; startTop = element.offsetTop; function onMouseMove(e) { element.style.left = `${startLeft + ((e.clientX - startX) / scale)}px`; element.style.top = `${startTop + ((e.clientY - startY) / scale)}px`; } function onMouseUp() { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); }); }
  const existingPanel = document.querySelector('.custom-shortcuts-container'); if (existingPanel) existingPanel.remove();
  const container = document.createElement('div'); container.className = "custom-shortcuts-container panel-style";
  const controls = document.createElement('div'); controls.className = 'panel-controls'; const settingsBtn = document.createElement('div'); settingsBtn.className = 'settings-button'; settingsBtn.title = 'ヘルプページを開く'; const newTabBtn = document.createElement('div'); newTabBtn.className = 'control-button new-tab-btn'; newTabBtn.textContent = '+'; newTabBtn.title = '新しいタブで開く (トグル)'; const toggleModeBtn = document.createElement('div'); toggleModeBtn.className = 'control-button toggle-mode-btn'; const closeBtn = document.createElement('div'); closeBtn.className = 'control-button close-btn'; closeBtn.textContent = '✕';
  controls.appendChild(settingsBtn); controls.appendChild(newTabBtn); controls.appendChild(toggleModeBtn); controls.appendChild(closeBtn); container.appendChild(controls);
  settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); window.open(metadata.source || 'https://gadget-otaku.github.io/Bookmarklet/HTML%E5%88%B6%E4%BD%9C/%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%82%AB%E3%83%83%E3%83%88%E3%83%91%E3%83%8D%E3%83%AB%E7%94%9F%E6%88%90%E3%83%BB%E7%B7%A8%E9%9B%86%E3%82%B5%E3%82%A4%E3%83%88.html', '_blank'); });
  newTabBtn.addEventListener('click', (e) => { e.stopPropagation(); newTabMode = !newTabMode; newTabBtn.classList.toggle('active', newTabMode); });
  toggleModeBtn.addEventListener('click', (e) => { e.stopPropagation(); applyTheme(!isDarkMode); });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); container.remove(); });
  items.forEach(item => { container.appendChild(item.isFolder ? createFolder(item) : createShortcut(item)); });
  document.body.appendChild(container); makeDraggableAndPosition(container);
  let initialThemeIsDark = false; const currentUrl = window.location.href; let ruleApplied = false;
  if (urlRules && urlRules.length > 0) { for (const rule of urlRules) { if (currentUrl === rule.url) { initialThemeIsDark = (rule.color === 'black'); ruleApplied = true; break; } } }
  applyTheme(initialThemeIsDark);
  const styleTag = document.createElement('style'); styleTag.textContent = styleText; document.head.appendChild(styleTag);
})();