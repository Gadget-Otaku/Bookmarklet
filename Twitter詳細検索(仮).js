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

    function getUserName() {
        var pathArray = window.location.pathname.split('/');
        return pathArray[1] || '';
    }

    var user = getUserName();
    if (!user) {
        alert('Twitterプロフィールページでこのブックマークレットを実行してください。');
        return;
    }

    var form = document.createElement('form');
    form.style.position = 'fixed';
    form.style.top = '10px';
    form.style.left = '10px';
    form.style.backgroundColor = 'white';
    form.style.padding = '10px';
    form.style.border = '1px solid black';
    form.style.zIndex = '9999';

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
        if (followerOnly.querySelector('input').checked) filters.push('filter%3Afollows');
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

        if (post) {
            query += post === 'from' ? 'from%3A' : 'to%3A';
        }
        query += encodeURIComponent(user);

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