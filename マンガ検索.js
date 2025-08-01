(function(){
    const config = {
  "fileName": "マンガ検索",
  "genres": [
    {
      "name": "ヒトミラ作者",
      "tags": [
        {
          "name": "作者有効化",
          "url": "artist/",
          "imageUrl": "undefined",
          "priority": 1,
          "autoSelect": true
        }
      ],
      "subGenres": [
        {
          "name": "ふたなり",
          "tags": [
            {
              "name": "ひょうが。",
              "url": "hyouga.",
              "imageUrl": "https://img.momoniji.com/wp-content/uploads/b/55/5526/552669/c001.webp",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "きたく",
              "url": "kitaku",
              "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7uERaV6qkOOqq9ZtW_D5UIEUzSSoayQxgzOScys6jpPj1_AIq_zo1phk&s=10",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "あいたにこふ",
              "url": "aitanikov",
              "imageUrl": "https://z3.momon-ga.com/galleries/629008/1.webp",
              "priority": 4,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "TS",
          "tags": [
            {
              "name": "TSFのF",
              "url": "tsf no f",
              "imageUrl": "https://z3.momon-ga.com/galleries/1227278/1.webp",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "柚木",
              "url": "yuzuki",
              "imageUrl": "https://img.honto.jp/series/1/0/240/C-MBJ-28246-3-484613X_1.jpg",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "安治ぽん太郎",
              "url": "aji pontarou",
              "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgZ21t8nk5iiZhdqvxkNQmA0Yy7AbsieWDYwdNGAF7sNDeYgxyvOwqrIn1xbN6UGrw9TU&usqp=CAU",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "べってぃ",
              "url": "betty",
              "imageUrl": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01369000/RJ01368004_img_main.jpg",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "あむぁい(タグx)",
              "url": "group/amuai okashi seisakusho",
              "imageUrl": "https://doujin-assets.dmm.co.jp/digital/comic/d_539881/d_539881pl.jpg",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "いわした ",
              "url": "iwashita",
              "imageUrl": "https://comic.iowl.jp/_next/image?url=https://comic-image.iowl.jp/images/thumbnail/2258/225830/225830_large.jpg&w=384&q=75",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "れいとうみかん ",
              "url": "reitou mikan",
              "imageUrl": "https://img.papy.co.jp/lc/sc/item/cover/9-2711160-c400.jpg",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "ウェルト",
              "url": "welt",
              "imageUrl": "https://pbs.twimg.com/media/GE28a6faYAAbPRX?format=jpg&name=4096x4096",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "やすみみらきち",
              "url": "yasumi mirakichi",
              "imageUrl": "https://t3.nhentai.website/galleries/2674229/cover.jpg",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "吉田悟郎",
              "url": "yoshida gorou",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/2896893/1.webp",
              "priority": 4,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "男の娘",
          "tags": [
            {
              "name": "佐々木武蔵",
              "url": "sasaki musashi",
              "imageUrl": "https://cdn.imagedeliveries.com/3037979/thumbnails/cover.jpg",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "ななもと",
              "url": "nanamoto",
              "imageUrl": "https://doujinrepublic.com/media/binary/005/333/414/5333414.jpg.webp",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "きつねビール",
              "url": "kitsune beer",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/2994307/1.webp",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "遊亀こねふ",
              "url": "yuuki konefu",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/3429704/1.webp",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "ミナミ・シン",
              "url": "sin iti",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/3019476/1.webp",
              "priority": 4,
              "autoSelect": false
            },
            {
              "name": "ふくもとまひろ",
              "url": "fukumoto mahiro",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/3294213/1.webp",
              "priority": 4,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "魔法少女",
          "tags": [
            {
              "name": "山梨ユウヤ",
              "url": "yamanashi yuuya",
              "imageUrl": "https://melonbooks.akamaized.net/user_data/packages/resize_image.php?image=232000033025.jpg&c=1&aa=0",
              "priority": 4,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "ロリ",
          "tags": [
            {
              "name": "古山　造",
              "url": "furuyama tsukuru",
              "imageUrl": "https://aicomic.org/attachment/comic/2970336-98bab124b3/2970336-98bab124b3.jpg",
              "priority": 4,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "潮吹き",
          "tags": [
            {
              "name": "ぽちたろ",
              "url": "pochitaro",
              "imageUrl": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01074000/RJ01073400_img_main.jpg",
              "priority": 4,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "性教育",
          "tags": [
            {
              "name": "グリエルモ",
              "url": "guglielmo",
              "imageUrl": "https://image.yodobashi.com/product/100/000/086/600/704/437/100000086600704437_10203.jpg",
              "priority": 4,
              "autoSelect": false
            }
          ],
          "subGenres": []
        }
      ]
    },
    {
      "name": "ヒトミラタグ",
      "tags": [
        {
          "name": "タグ有効化",
          "url": "tag/",
          "imageUrl": "undefined",
          "priority": 1,
          "autoSelect": true
        },
        {
          "name": "ふたなり",
          "url": "female:futanari",
          "imageUrl": "undefined",
          "priority": 3,
          "autoSelect": false
        },
        {
          "name": "TS",
          "url": "male:gender change",
          "imageUrl": "undefined",
          "priority": 3,
          "autoSelect": false
        },
        {
          "name": "男の娘",
          "url": "female:shemale",
          "imageUrl": "undefined",
          "priority": 3,
          "autoSelect": false
        },
        {
          "name": "魔法少女",
          "url": "female:magical girl",
          "imageUrl": "undefined",
          "priority": 3,
          "autoSelect": false
        },
        {
          "name": "ロリ",
          "url": "female:loli",
          "imageUrl": "undefined",
          "priority": 3,
          "autoSelect": false
        },
        {
          "name": "潮吹き",
          "url": "female:squirting",
          "imageUrl": "undefined",
          "priority": 3,
          "autoSelect": false
        },
        {
          "name": "週間人気",
          "url": "popular/week/",
          "imageUrl": "undefined",
          "priority": 2,
          "autoSelect": false
        },
        {
          "name": "月間人気",
          "url": "popular/month/",
          "imageUrl": "undefined",
          "priority": 2,
          "autoSelect": false
        },
        {
          "name": "年間人気",
          "url": "popular/year/",
          "imageUrl": "undefined",
          "priority": 2,
          "autoSelect": false
        }
      ],
      "subGenres": []
    },
    {
      "name": "モモンガ作者",
      "tags": [],
      "subGenres": [
        {
          "name": "ふたなり",
          "tags": [
            {
              "name": "ひょうが。",
              "url": "cartoonist/ひょうが。/",
              "imageUrl": "https://img.momoniji.com/wp-content/uploads/b/55/5526/552669/c001.webp",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "きたく",
              "url": "cartoonist/きたく/",
              "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7uERaV6qkOOqq9ZtW_D5UIEUzSSoayQxgzOScys6jpPj1_AIq_zo1phk&s=10",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "あいたにこふ",
              "url": "cartoonist/あいたにこふ/",
              "imageUrl": "https://z3.momon-ga.com/galleries/629008/1.webp",
              "priority": 1,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "TS",
          "tags": [
            {
              "name": "TSFのF",
              "url": "group/tsfのf/",
              "imageUrl": "https://z3.momon-ga.com/galleries/1227278/1.webp",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "柚木",
              "url": "cartoonist/柚木/",
              "imageUrl": "https://img.honto.jp/series/1/0/240/C-MBJ-28246-3-484613X_1.jpg",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "安治ぽん太郎",
              "url": "cartoonist/安治ぽん太郎/",
              "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgZ21t8nk5iiZhdqvxkNQmA0Yy7AbsieWDYwdNGAF7sNDeYgxyvOwqrIn1xbN6UGrw9TU&usqp=CAU",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "べってぃ",
              "url": "group/あむぁいおかし製作所/",
              "imageUrl": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01369000/RJ01368004_img_main.jpg",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "あむぁい",
              "url": "group/あむぁいおかし製作所/",
              "imageUrl": "https://doujin-assets.dmm.co.jp/digital/comic/d_539881/d_539881pl.jpg",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "いわした",
              "url": "cartoonist/いわした/",
              "imageUrl": "https://comic.iowl.jp/_next/image?url=https://comic-image.iowl.jp/images/thumbnail/2258/225830/225830_large.jpg&w=384&q=75",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "れいとうみかん",
              "url": "cartoonist/れいとうみかん/",
              "imageUrl": "https://img.papy.co.jp/lc/sc/item/cover/9-2711160-c400.jpg",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "ウェルト",
              "url": "cartoonist/ウェルト/",
              "imageUrl": "https://pbs.twimg.com/media/GE28a6faYAAbPRX?format=jpg&name=4096x4096",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "やすみみらきち",
              "url": "cartoonist/やすみみらきち/",
              "imageUrl": "https://t3.nhentai.website/galleries/2674229/cover.jpg",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "吉田悟郎",
              "url": "group/吉田悟郎商會/",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/2896893/1.webp",
              "priority": 1,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "男の娘",
          "tags": [
            {
              "name": "佐々木武蔵",
              "url": "cartoonist/佐々木武蔵/",
              "imageUrl": "https://cdn.imagedeliveries.com/3037979/thumbnails/cover.jpg",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "きつねビール",
              "url": "cartoonist/きつねビール/",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/2994307/1.webp",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "男の子で遊ぼう",
              "url": "cartoonist/男の子で遊ぼう/",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/3429704/1.webp",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "ミナミ・シン",
              "url": "cartoonist/ミナミ・シン/",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/3019476/1.webp",
              "priority": 1,
              "autoSelect": false
            },
            {
              "name": "ふくもとまひろ",
              "url": "cartoonist/fukumoto-mahiro/",
              "imageUrl": "https://cdn4.momon-ga.com/galleries/3294213/1.webp",
              "priority": 1,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "魔法少女",
          "tags": [
            {
              "name": "山梨ユウヤ",
              "url": "cartoonist/山梨ユウヤ/",
              "imageUrl": "https://melonbooks.akamaized.net/user_data/packages/resize_image.php?image=232000033025.jpg&c=1&aa=0",
              "priority": 1,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "潮吹き",
          "tags": [
            {
              "name": "ぽちたろ",
              "url": "cartoonist/ぽちたろ/",
              "imageUrl": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01074000/RJ01073400_img_main.jpg",
              "priority": 1,
              "autoSelect": false
            }
          ],
          "subGenres": []
        },
        {
          "name": "性教育",
          "tags": [
            {
              "name": "グリエルモ",
              "url": "cartoonist/ぐりえるも/",
              "imageUrl": "https://image.yodobashi.com/product/100/000/086/600/704/437/100000086600704437_10203.jpg",
              "priority": 1,
              "autoSelect": false
            }
          ],
          "subGenres": []
        }
      ]
    },
    {
      "name": "モモンガタグ",
      "tags": [
        {
          "name": "タグ有効化",
          "url": "tag/",
          "imageUrl": "undefined",
          "priority": 1,
          "autoSelect": true
        },
        {
          "name": "ふたなり",
          "url": "futanari/",
          "imageUrl": "undefined",
          "priority": 2,
          "autoSelect": false
        },
        {
          "name": "TS",
          "url": "gender-change/",
          "imageUrl": "undefined",
          "priority": 2,
          "autoSelect": false
        },
        {
          "name": "男の娘",
          "url": "shemale/",
          "imageUrl": "undefined",
          "priority": 2,
          "autoSelect": false
        },
        {
          "name": "魔法少女",
          "url": "magical-girl/",
          "imageUrl": "undefined",
          "priority": 2,
          "autoSelect": false
        }
      ],
      "subGenres": []
    }
  ],
  "searchButtons": [
    {
      "name": "ヒトミラ検索",
      "prefix": "https://hitomi.la/",
      "suffix": "-all.html"
    },
    {
      "name": "モモンガ検索",
      "prefix": "https://momon-ga.com/",
      "suffix": ""
    }
  ]
};
    const containerId = 'customSearchBookmarkletContainer';
    if (document.getElementById(containerId)) { document.getElementById(containerId).remove(); }
    const style = document.createElement('style');
    style.textContent = `.bookmarklet-container { position:fixed; bottom:10px; right:10px; background:white; border:1px solid #ccc; border-radius: 5px; padding:10px; z-index:2147483647; box-shadow:0 2px 10px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; } .bookmarklet-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; } .bookmarklet-header button { all:unset; font-size:18px; cursor:pointer; padding:2px 5px; line-height:1; } .bookmarklet-header button:hover { background: #f0f0f0; border-radius: 3px; } .genre-section { margin-bottom:10px; } .toggle { cursor:pointer; user-select:none; font-weight:bold; } .hidden { display:none; } .tag { display:flex; align-items:center; margin:2px 0; } .tag img { width:20px; height:20px; margin-right:5px; } .sub-genre { margin-left:20px; border-left:2px solid #eee; padding-left:10px; } .search-buttons button { margin: 2px; }`;
    document.head.appendChild(style);
    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'bookmarklet-container';
    document.body.appendChild(container);
    const header = document.createElement('div');
    header.className = 'bookmarklet-header';
    container.appendChild(header);
    const settingsButton = document.createElement('button');
    settingsButton.textContent = '⚙️';
    settingsButton.onclick = () => window.open('https://sites.google.com/view/custome-search2/%E3%83%9B%E3%83%BC%E3%83%A0', '_blank');
    header.appendChild(settingsButton);
    const closeButton = document.createElement('button');
    closeButton.textContent = '☒';
    closeButton.onclick = () => container.remove();
    header.appendChild(closeButton);
    function createGenreSection(genre, isSub = false) {
        const section = document.createElement('div');
        section.className = 'genre-section' + (isSub ? ' sub-genre' : '');
        const toggle = document.createElement('div');
        toggle.className = 'toggle';
        toggle.textContent = '▶ ' + genre.name;
        const content = document.createElement('div');
        content.className = 'hidden';
        toggle.onclick = () => {
            content.classList.toggle('hidden');
            toggle.textContent = (content.classList.contains('hidden') ? '▶ ' : '▼ ') + genre.name;
            // --- 自動チェック機能のロジックをここに追加 ---
            if (!content.classList.contains('hidden')) {
                // パネル展開時：autoSelectがtrueのタグをチェックする
                (genre.tags || []).forEach(t => {
                    if (t.autoSelect) {
                        const checkbox = content.querySelector('input[data-url="' + t.url.replace(/"/g, '\"') + '"]');
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    }
                });
            } else {
                // パネル格納時：すべてのチェックを外す
                content.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
            }
        };
        (genre.tags || []).forEach(t => {
            const tag = document.createElement('label');
            tag.className = 'tag';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.dataset.url = t.url;
            cb.dataset.priority = t.priority;
            tag.appendChild(cb);
            if (t.imageUrl && t.imageUrl !== 'undefined') {
                const img = document.createElement('img');
                img.src = t.imageUrl;
                img.alt = t.name;
                tag.appendChild(img);
            }
            const span = document.createElement('span');
            span.textContent = ' ' + t.name;
            tag.appendChild(span);
            content.appendChild(tag);
        });
        (genre.subGenres || []).forEach(sub => content.appendChild(createGenreSection(sub, true)));
        section.appendChild(toggle);
        section.appendChild(content);
        return section;
    }
    (config.genres || []).forEach(genre => container.appendChild(createGenreSection(genre)));
    const searchButtonsContainer = document.createElement('div');
    searchButtonsContainer.className = 'search-buttons';
    container.appendChild(searchButtonsContainer);
    (config.searchButtons || []).forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.name;
        button.onclick = () => {
            const sel = Array.from(container.querySelectorAll('input[type=checkbox]:checked'))
                .sort((a, b) => (a.dataset.priority || 1) - (b.dataset.priority || 1))
                .map(el => el.dataset.url);
            const url = (btn.prefix || '') + sel.join('') + (btn.suffix || '');
            if (url) { window.open(url, '_blank'); }
        };
        searchButtonsContainer.appendChild(button);
    });
})();