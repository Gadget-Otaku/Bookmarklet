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