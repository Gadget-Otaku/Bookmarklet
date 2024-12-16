javascript:(function() {
          const panel = document.createElement('div');
          panel.style = 'position:fixed;top:10%;left:50%;transform:translateX(-50%);background:white;border:1px solid black;padding:10px;z-index:9999;';
          document.body.appendChild(panel);

          const closeButton = document.createElement('button');
          closeButton.textContent = '☒';
          closeButton.onclick = () => document.body.removeChild(panel);
          closeButton.style = 'float:right;';
          panel.appendChild(closeButton);

          
            const btn0 = document.createElement('button');
            btn0.textContent = "site:検索";
            btn0.style = 'display:block;margin:5px 0;';
            btn0.onclick = function() { javascript:(function() {        const popup = document.createElement('div');        popup.style.position = 'fixed';        popup.style.top = '50%';        popup.style.left = '50%';        popup.style.transform = 'translate(-50%, -50%)';        popup.style.width = '200px';        popup.style.padding = '20px';        popup.style.background = '#fff';        popup.style.border = '2px solid #888';        popup.style.borderRadius = '10px';        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';        popup.style.fontFamily = 'Arial, sans-serif';        popup.style.zIndex = '10000';        const closeButton = document.createElement('span');        closeButton.textContent = '☒';        closeButton.style.position = 'absolute';        closeButton.style.top = '10px';        closeButton.style.right = '10px';        closeButton.style.cursor = 'pointer';        closeButton.onclick = () => document.body.removeChild(popup);        popup.appendChild(closeButton);const sites = [  { name: "モモンガ", url: "site:momon-ga.com" },  { name: "ヒトミラ", url: "site:hitomi.la" },  { name: "ケモノ", url: "site:kemono.su" },  { name: "ダンボール", url: "site:danbooru.donmai.us" },  { name: "ZOZOアニメ", url: "site:zozovideo.com" },  { name: "MissAV", url: "site:missav.com" },  { name: "gsmarena", url: "site:gsmarena.com" },  { name: "the比較", url: "site:thehikaku.net" },  { name: "モバイルドットコム", url: "site:mobile-com.ne.jp" },  { name: "はやぽん", url: "site:hayaponlog.site" },  { name: "すまほん", url: "site:smhn.info" },  { name: "カジェログ", url: "site:kajetblog.com" }];        const checkboxes = sites.map(site => {                const label = document.createElement('label');                const checkbox = document.createElement('input');                checkbox.type = 'checkbox';                checkbox.value = site.url;                label.appendChild(checkbox);                label.appendChild(document.createTextNode(site.name));                popup.appendChild(label);                popup.appendChild(document.createElement('br'));                return checkbox;        });        const searchBox = document.createElement('input');        searchBox.type = 'text';        searchBox.placeholder = '検索キーワード';        searchBox.style.width = '100%';        searchBox.style.marginTop = '10px';        searchBox.style.padding = '5px';        popup.appendChild(searchBox);        const searchButton = document.createElement('button');        searchButton.textContent = '検索';        searchButton.style.position = 'absolute';        searchButton.style.right = '10px';        searchButton.style.bottom = '10px';        searchButton.style.padding = '5px';        searchButton.style.cursor = 'pointer';        searchButton.onclick = function() {                const selectedSites = checkboxes                        .filter(checkbox => checkbox.checked)                        .map(checkbox => checkbox.value);                if (selectedSites.length > 0 && searchBox.value) {                        const query = selectedSites.join(' OR ') + ' ' + searchBox.value;                        window.open('https://www.google.com/search?q=' + encodeURIComponent(query));                } else {                        alert('少なくとも1つのサイトを選択し、検索キーワードを入力してください。');                }        };        popup.appendChild(searchButton);        document.body.appendChild(popup);})(); };
            panel.appendChild(btn0);
          
            const btn1 = document.createElement('button');
            btn1.textContent = "URLパラメータ";
            btn1.style = 'display:block;margin:5px 0;';
            btn1.onclick = function() { javascript:(function() {  const data = [{"description":"原神交換コード","urlStart":"https://genshin.hoyoverse.com/ja/gift?code=","urlEnd":""},{"description":"Github検索","urlStart":"https://gadget-otaku.github.io/Bookmarklet/","urlEnd":".js"},{"description":"DuckDuckGO","urlStart":"https://duckduckgo.com/?t=h_&q=","urlEnd":""},{"description":"weblio","urlStart":"https://ejje.weblio.jp/content/","urlEnd":""},{"description":"X引用リツイート","urlStart":"","urlEnd":"/quotes"},{"description":"Xに投稿","urlStart":"https://x.com/intent/post?url=","urlEnd":""},{"description":"字幕","urlStart":"https://downsub.com/?url=","urlEnd":""}];  const container=document.createElement('div');    container.style='position:fixed;top:10%;left:50%;transform:translateX(-50%);background:white;border:1px solid black;padding:20px;z-index:9999;';    document.body.appendChild(container);    const closeButton=document.createElement('button');    closeButton.textContent='☒';    closeButton.onclick=()=>document.body.removeChild(container);    container.appendChild(closeButton);    const searchInput=document.createElement('input');    searchInput.placeholder='検索キーワード';    container.appendChild(searchInput);    const list=document.createElement('ul');    data.forEach((item,index)=>{      const li=document.createElement('li');      const radio=document.createElement('input');      radio.type='radio';      radio.name='site';      radio.value=index;      li.appendChild(radio);      li.appendChild(document.createTextNode(item.description));      list.appendChild(li);    });    container.appendChild(list);    const searchButton=document.createElement('button');    searchButton.textContent='検索';    searchButton.onclick=function(){      const selected=container.querySelector('input[name="site"]:checked');      if(!selected){alert('サイトを選択してください');return;}      const item=data[selected.value];      const keyword=searchInput.value.trim();      const currentUrl=window.location.href;      let url;      if (keyword) {        if (item.urlStart && item.urlEnd) {          url = item.urlStart + keyword + item.urlEnd;        } else if (item.urlStart) {          url = item.urlStart + keyword;        } else if (item.urlEnd) {          url = keyword + item.urlEnd;        }      } else {        if (item.urlStart && item.urlEnd) {          url = item.urlStart + currentUrl + item.urlEnd;        } else if (item.urlStart) {          url = item.urlStart + currentUrl;        } else if (item.urlEnd) {          url = currentUrl + item.urlEnd;        }      }      window.open(url);    };    container.appendChild(searchButton);})(); };
            panel.appendChild(btn1);
          
            const btn2 = document.createElement('button');
            btn2.textContent = "X詳細検索";
            btn2.style = 'display:block;margin:5px 0;';
            btn2.onclick = function() { javascript:(function() {
    function createInput(labelText, placeholderText, required) {
        var wrapper = document.createElement('div');
        var label = document.createElement('label');
        label.textContent = labelText;
        label.style.color = 'black';
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholderText;
        input.style.color = 'black';
        input.style.backgroundColor = 'lightgrey';
        if (required) input.required = true;
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        return wrapper;
    }

    function createDateInput(labelText) {
        var wrapper = document.createElement('div');
        var label = document.createElement('label');
        label.textContent = labelText;
        label.style.color = 'black';

        var yearInput = createInput('年', 'YYYY', false);
        var monthInput = createInput('月', 'MM', false);
        var dayInput = createInput('日', 'DD', false);

        wrapper.appendChild(label);
        wrapper.appendChild(yearInput);
        wrapper.appendChild(monthInput);
        wrapper.appendChild(dayInput);
        return wrapper;
    }

    function createSelect(labelText, options) {
        var wrapper = document.createElement('div');
        var label = document.createElement('label');
        label.textContent = labelText;
        label.style.color = 'black';

        var select = document.createElement('select');
        select.style.color = 'black';
        select.style.backgroundColor = 'lightgrey';
        options.forEach(function(optionText) {
            var option = document.createElement('option');
            option.value = optionText.value;
            option.text = optionText.text;
            select.add(option);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        return wrapper;
    }

    function createCheckbox(labelText) {
        var wrapper = document.createElement('div');
        var label = document.createElement('label');
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.color = 'black';
        checkbox.style.backgroundColor = 'lightgrey';
        label.textContent = labelText;
        label.style.color = 'black';
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        return wrapper;
    }

    var form = document.createElement('form');
    form.style.position = 'fixed';
    form.style.top = '10px';
    form.style.left = '10px';
    form.style.backgroundColor = 'white';
    form.style.padding = '10px';
    form.style.border = '1px solid black';
    form.style.zIndex = '9999';
    form.style.fontSize = '10px';

    var closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.backgroundColor = 'lightgrey';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';

    closeButton.onclick = function() {
        form.remove();
    };

    form.appendChild(closeButton);

    var userNameInput = createInput('ユーザー名', '例: username', false); // ユーザー名の入力欄
    form.appendChild(userNameInput);

    var fromInput = createInput('from:', '例: fromUser', false); // from:の入力欄
    form.appendChild(fromInput);

    var toInput = createInput('to:', '例: toUser', false); // to:の入力欄
    form.appendChild(toInput);

    var searchMethodLabel = createSelect('検索方法', [
        { value: '', text: '選択しない' },
        { value: 'AND', text: 'AND検索' },
        { value: 'OR', text: 'OR検索' }
    ]);
    var keyword1 = createInput('キーワード1', 'キーワード1', false);
    var keyword2 = createInput('キーワード2', 'キーワード2', false);
    var keyword3 = createInput('キーワード3', 'キーワード3', false);
    var sinceLabel = createDateInput('いつから ※任意');
    var untilLabel = createDateInput('いつまで ※任意');
    var postLabel = createSelect('ユーザーが投稿/ユーザーへのリプライ ※任意', [
        { value: '', text: '選択しない' },
        { value: 'from', text: 'ユーザーが投稿' },
        { value: 'to', text: 'ユーザーへのリプライ' }
    ]);
    var followerOnly = createCheckbox('フォロワーのみ');
    var imagesOnly = createCheckbox('画像のみ');
    var videosOnly = createCheckbox('動画のみ');
    var minFaves = createInput('いいねの数', '以上', false);
    var minReplies = createInput('リプライの数', '以上', false);
    var exactPhrase = createInput('完全に一致するワード', '', false);
    var excludeWords1 = createInput('除外ワード1', '除外ワード1', false);
    var excludeWords2 = createInput('除外ワード2', '除外ワード2', false);
    var excludeWords3 = createInput('除外ワード3', '除外ワード3', false);
    var langLabel = createSelect('言語', [
        { value: '', text: '選択しない' },
        { value: 'ja', text: '日本語' },
        { value: 'en', text: '英語' },
        { value: 'zh', text: '中国語 (簡体字)' },
        { value: 'zh-TW', text: '中国語 (繁体字)' },
        { value: 'ko', text: '韓国語' },
        { value: 'es', text: 'スペイン語' },
        { value: 'fr', text: 'フランス語' },
        { value: 'de', text: 'ドイツ語' },
        { value: 'it', text: 'イタリア語' },
        { value: 'pt', text: 'ポルトガル語' },
        { value: 'ru', text: 'ロシア語' }
    ]);
    var excludeLang = createCheckbox('除外指定');

    var submit = document.createElement('button');
    submit.textContent = '検索';
    submit.type = 'submit';
    submit.style.color = 'black';
    submit.style.backgroundColor = 'lightgrey';

    form.appendChild(searchMethodLabel);
    form.appendChild(keyword1);
    form.appendChild(keyword2);
    form.appendChild(keyword3);
    form.appendChild(sinceLabel);
    form.appendChild(untilLabel);
    form.appendChild(postLabel);
    form.appendChild(followerOnly);
    form.appendChild(imagesOnly);
    form.appendChild(videosOnly);
    form.appendChild(minFaves);
    form.appendChild(minReplies);
    form.appendChild(exactPhrase);
    form.appendChild(excludeWords1);
    form.appendChild(excludeWords2);
    form.appendChild(excludeWords3);
    form.appendChild(langLabel);
    form.appendChild(excludeLang);
    form.appendChild(submit);

    document.body.appendChild(form);

    form.onsubmit = function(e) {
        e.preventDefault();

        var baseUrl = 'https://twitter.com/search?q=';
        var query = '';
        var user = userNameInput.querySelector('input').value;
        var fromUser = fromInput.querySelector('input').value;
        var toUser = toInput.querySelector('input').value;


        if (user && (fromUser || toUser)) {
            alert("一番上のユーザー名を入力した場合、from: to:検索はできません");
            return;
        }


        if (user) {
            query += encodeURIComponent(user);
        }


        if (fromUser) {
            query += 'from%3A' + encodeURIComponent(fromUser);
        }
        if (toUser) {
            if (fromUser) {
                query += '%20';
            }
            query += 'to%3A' + encodeURIComponent(toUser);
        }

        var keywordList = [
            keyword1.querySelector('input').value,
            keyword2.querySelector('input').value,
            keyword3.querySelector('input').value
        ].filter(Boolean);
        var searchMethod = searchMethodLabel.querySelector('select').value;
        var sinceYear = sinceLabel.querySelectorAll('input')[0].value;
        var sinceMonth = sinceLabel.querySelectorAll('input')[1].value;
        var sinceDay = sinceLabel.querySelectorAll('input')[2].value;
        var untilYear = untilLabel.querySelectorAll('input')[0].value;
        var untilMonth = untilLabel.querySelectorAll('input')[1].value;
        var untilDay = untilLabel.querySelectorAll('input')[2].value;
        var post = postLabel.querySelector('select').value;
        var filters = [];
        if (followerOnly.querySelector('input').checked) filters.push('filter%3Afollower');
        if (imagesOnly.querySelector('input').checked) filters.push('filter%3Aimages');
        if (videosOnly.querySelector('input').checked) filters.push('filter%3Avideos');
        var minFavesVal = minFaves.querySelector('input').value;
        var minRepliesVal = minReplies.querySelector('input').value;
        var exactPhraseVal = exactPhrase.querySelector('input').value;
        var excludeWordList = [
            excludeWords1.querySelector('input').value,
            excludeWords2.querySelector('input').value,
            excludeWords3.querySelector('input').value
        ].filter(Boolean);
        var lang = langLabel.querySelector('select').value;
        var excludeLangChecked = excludeLang.querySelector('input').checked;

        if (keywordList.length > 0) {
            var joinedKeywords = keywordList.join(searchMethod ? `%20${searchMethod.toLowerCase()}%20` : '%20');
            query += '%20' + joinedKeywords;
        }

        filters.forEach(function(filter) {
            query += '%20' + filter;
        });

        if (minFavesVal) {
            query += '%20min_faves%3A' + encodeURIComponent(minFavesVal);
        }

        if (minRepliesVal) {
            query += '%20min_retweets%3A' + encodeURIComponent(minRepliesVal);
        }

        if (exactPhraseVal) {
            query += '%20"' + encodeURIComponent(exactPhraseVal) + '"';
        }

        excludeWordList.forEach(function(word) {
            query += '%20-' + encodeURIComponent(word);
        });

        if (lang) {
            query += excludeLangChecked ? '%20-lang%3A' + lang : '%20lang%3A' + lang;
        }

        if (sinceYear && sinceMonth && sinceDay) {
            query += '%20since%3A' + sinceYear + '-' + sinceMonth + '-' + sinceDay;
        }

        if (untilYear && untilMonth && untilDay) {
            query += '%20until%3A' + untilYear + '-' + untilMonth + '-' + untilDay;
        }

        window.open(baseUrl + query, '_blank');
    };
})(); };
            panel.appendChild(btn2);
          
        })();