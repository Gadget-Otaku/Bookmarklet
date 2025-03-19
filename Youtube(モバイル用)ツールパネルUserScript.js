// ==UserScript==
// @name         Youtubeツールパネル1.2(モバイル用) 動画ダウンロード Firefoxに切り替えを追加
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Execute UserScript
// @author       Your Name
// @match        https://m.youtube.com/*
// @grant        none
// @license MIT
// ==/UserScript==
 
(function() {
    'use strict';
 
    const button = document.createElement('div');
    button.style.position = 'fixed';
    button.style.top = '15px';
    button.style.left = '120px';
    button.style.width = '25px';
    button.style.height = '25px';
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '10000';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
 
    for (let i = 0; i < 3; i++) {
        const line = document.createElement('div');
        line.style.width = '20px';
        line.style.height = '3px';
        line.style.backgroundColor = 'white';
        line.style.margin = '2px 0';
        button.appendChild(line);
    }
 
    button.addEventListener('click', () => {
javascript:(function() {
          const panel = document.createElement('div');
          panel.style = 'position:fixed;top:10px;left:10px;background:white;border:1px solid black;padding:10px;z-index:9999;';
          document.body.appendChild(panel);
          const closeButton = document.createElement('button');
          closeButton.textContent = '☒';
          closeButton.onclick = () => document.body.removeChild(panel);
          closeButton.style = 'float:right;';
          panel.appendChild(closeButton);
          
            (function() {
              const btn0 = document.createElement('button');
              btn0.textContent = "Firefoxに切り替え";
              btn0.style = 'display:block;margin:5px 0;';
              btn0.onclick = function() {
                javascript:(function(){
  var u = window.location.href;
  var ua = navigator.userAgent;
  if(/android/i.test(ua)){
    // Androidの場合: intentスキームを利用
    window.location = "intent:" + u.replace(/^https?:\/\//, "") + "#Intent;package=org.mozilla.firefox;scheme=https;end";
  } else if(/(iPhone|iPad|iPod)/i.test(ua)){
    // iOSの場合: BraveのカスタムURLスキーム（Braveが対応している場合）
    window.location = "Firefox://open-url?url=" + encodeURIComponent(u);
  } else {
    // その他（主にデスクトップ）
    if(confirm("Firefoxで表示しますか？")){
      window.location = "Firefox://open-url?url=" + encodeURIComponent(u);
    }
  }
})();
                panel.style.display = 'none';
              };
              panel.appendChild(btn0);
            })();
          
            (function() {
              const btn1 = document.createElement('button');
              btn1.textContent = "動画ダウンロード";
              btn1.style = 'display:block;margin:5px 0;';
              btn1.onclick = function() {
                javascript:(function(){    var url = window.location.href;    var videoId = url.match(/v=([^&]+)/)[1];    window.location.href = 'https://www.y2mate.com/youtube/' + videoId;})(); 
                panel.style.display = 'none';
              };
              panel.appendChild(btn1);
            })();
          
            (function() {
              const btn2 = document.createElement('button');
              btn2.textContent = "3倍速";
              btn2.style = 'display:block;margin:5px 0;';
              btn2.onclick = function() {
                javascript:(function(){
  var videos = document.getElementsByTagName('video');
  for(var i=0; i<videos.length; i++){
    videos[i].playbackRate = 3.0;
  }
})();
                panel.style.display = 'none';
              };
              panel.appendChild(btn2);
            })();
          
            (function() {
              const btn3 = document.createElement('button');
              btn3.textContent = "スピードコントローラー";
              btn3.style = 'display:block;margin:5px 0;';
              btn3.onclick = function() {
                javascript:(function() {    if (document.getElementById('videoControlPopup')) {        document.getElementById('videoControlPopup').remove();        return;    }    const popup = document.createElement('div');    popup.id = 'videoControlPopup';    popup.style.position = 'fixed';    popup.style.bottom = '0';    popup.style.width = '100%';    popup.style.backgroundColor = '#fff';    popup.style.borderTop = '2px solid #000';    popup.style.padding = '10px';    popup.style.zIndex = '9999';    popup.style.display = 'flex';    popup.style.flexDirection = 'column';    popup.style.alignItems = 'center';    const header = document.createElement('div');    header.style.display = 'flex';    header.style.justifyContent = 'center';    header.style.alignItems = 'center';    header.style.width = '100%';    header.style.marginBottom = '10px';    const maximizeButton = document.createElement('button');    maximizeButton.textContent = '最大化';    maximizeButton.style.marginRight = '10px';    maximizeButton.onclick = function() {        const video = document.querySelector('video');        if (video) {            video.requestFullscreen().catch(console.error);        }    };    const playButton = document.createElement('button');    playButton.textContent = '再生';    playButton.style.marginRight = '10px';    playButton.onclick = function() {        const video = document.querySelector('video');        if (video) video.play();    };    const stopButton = document.createElement('button');    stopButton.textContent = '停止';    stopButton.style.marginLeft = '10px';    stopButton.onclick = function() {        const video = document.querySelector('video');        if (video) video.pause();    };    const closeButton = document.createElement('button');    closeButton.textContent = 'x';    closeButton.style.marginLeft = '5px';    closeButton.onclick = function() {        popup.remove();    };    header.appendChild(maximizeButton);    header.appendChild(playButton);    header.appendChild(stopButton);    header.appendChild(closeButton);    popup.appendChild(header);    const speedControls = [0.25, 0.5, 1, 2, 3];    const speedContainer = document.createElement('div');    speedContainer.style.display = 'flex';    speedContainer.style.justifyContent = 'center';    speedControls.forEach(speed => {        const button = document.createElement('button');        button.textContent = `x${speed}`;        button.style.margin = '5px';        button.onclick = function() {            const video = document.querySelector('video');            if (video) video.playbackRate = speed;        };        speedContainer.appendChild(button);    });    popup.appendChild(speedContainer);    const skipTimes = [-30, -10, -5, 5, 10, 30];    const skipContainer = document.createElement('div');    skipContainer.style.display = 'flex';    skipContainer.style.justifyContent = 'center';    skipTimes.forEach(time => {        const button = document.createElement('button');        button.textContent = `${time > 0 ? '+' : ''}${time}`;        button.style.margin = '5px';        button.onclick = function() {            const video = document.querySelector('video');            if (video) video.currentTime += time;        };        skipContainer.appendChild(button);    });    popup.appendChild(skipContainer);    document.body.appendChild(popup);})();
                panel.style.display = 'none';
              };
              panel.appendChild(btn3);
            })();
          
            (function() {
              const btn4 = document.createElement('button');
              btn4.textContent = "字幕";
              btn4.style = 'display:block;margin:5px 0;';
              btn4.onclick = function() {
                javascript:(function(){window.location.href='https://subtitle.to/' + window.location.href;})();
                panel.style.display = 'none';
              };
              panel.appendChild(btn4);
            })();
          
            (function() {
              const btn5 = document.createElement('button');
              btn5.textContent = "コメントフィルター";
              btn5.style = 'display:block;margin:5px 0;';
              btn5.onclick = function() {
                javascript:(function(){
 
  var commentBtn = Array.from(document.querySelectorAll('button')).find(e => e.innerText.includes('コメント'));
  if(commentBtn){
    commentBtn.click();
  } else {
    alert('コメントボタンが見つかりませんでした');
  }
 
  var existingBox = document.getElementById('yt-comment-filter-box');
  if(existingBox) existingBox.remove();
 
  var box = document.createElement('div');
  box.id = 'yt-comment-filter-box';
  box.style.position = 'fixed';
  box.style.top = '270px';
  box.style.left = '100px';
  box.style.background = 'rgba(255,255,255,0.9)';
  box.style.border = '1px solid #ccc';
  box.style.padding = '7px';
  box.style.zIndex = 9999;
  box.style.borderRadius = '7px';
 
  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'キーワード';
  input.style.marginRight = '7px';
  box.appendChild(input);
 
  var btnSearch = document.createElement('button');
  btnSearch.innerText = '検索';
  btnSearch.style.marginRight = '7px';
  box.appendChild(btnSearch);
 
  var btnClose = document.createElement('button');
  btnClose.innerText = '☒';
 
  btnClose.style.fontSize = '24px';
  btnClose.style.padding = '10px 15px';
  box.appendChild(btnClose);
 
  document.body.appendChild(box);
 
  btnClose.addEventListener('click', function(){
    box.remove();
  });
 
  btnSearch.addEventListener('click', function(){
    var keyword = input.value.trim();
    if(!keyword){
      alert('キーワードを入力してください');
      return;
    }
    var comments = document.querySelectorAll('ytd-comment-thread-renderer, ytm-comment-thread-renderer');
    if(comments.length === 0){
      alert('コメントが見つかりません');
      return;
    }
    var found = false;
    comments.forEach(function(comment){
      if(comment.innerText.toLowerCase().indexOf(keyword.toLowerCase()) !== -1){
        comment.style.display = '';
        if(!found){
          comment.scrollIntoView({behavior:'smooth', block:'start'});
          found = true;
        }
      } else {
        comment.style.display = 'none';
      }
    });
    if(!found){
      alert('キーワードに一致するコメントは見つかりませんでした');
    }
  });
})();
                panel.style.display = 'none';
              };
              panel.appendChild(btn5);
            })();
          
            (function() {
              const btn6 = document.createElement('button');
              btn6.textContent = "Geminiに要約";
              btn6.style = 'display:block;margin:5px 0;';
              btn6.onclick = function() {
                javascript:(function(){ var currentUrl = window.location.href; var summaryText = '以下の動画を要約して\n ' + currentUrl; var textArea = document.createElement('textarea'); textArea.value = summaryText; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea); window.location.href = 'https://gemini.google.com/app'; })();
                panel.style.display = 'none';
              };
              panel.appendChild(btn6);
            })();
          
          document.addEventListener('click', function(e) {
            if (!panel.contains(e.target)) {
              panel.style.display = 'none';
            }
          }, { capture: true });
        })();
    });
 
    document.body.appendChild(button);
})();