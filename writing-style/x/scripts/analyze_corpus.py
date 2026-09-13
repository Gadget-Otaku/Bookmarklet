"""Deterministic descriptive statistics. Training input only; heuristics != labels."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import statistics as st
from count_x_chars import count, urls

MARKERS='まあ てか でも やっぱ やっぱり なんか そもそも 結局 個人的に マジ マジで ガチ ガチで めっちゃ 全然 流石 取り敢えず 因みに ただ いや とはいえ たぶん 多分 仮に 正直 むしろ 一応 もはや とりあえず あとは せめて 結構 けっこう 便利 神 すぎ'.split()
ENDINGS='なあ よな よね かな だろ だね じゃん なのか なのかな って感じ だわ んよね なんだよな よなあ かなあ だな だなあ だろう 気がする ほしい 欲しい らしい みたい'.split()
MODE_RULES={
 '平常・独り言':r'思う|だな|よな|なあ', '技術考察':r'API|CORS|CSP|コード|拡張機能|UserScript|スクリプト|実装|バックグラウンド',
 '比較・レビュー':r'比べ|比較|より|一方|使って|使った', '仮説':r'仮に|かもしれ|気がする|なのかな|原因.*らしい',
 '未来予測':r'今後|将来|最終的|このまま|そうなると|予想|どうなる', '成功・興奮':r'できた|完成|成功|クリア|ゲット|来た！|やっと',
 '強い称賛':r'神|最高|革命|素晴らし|凄すぎ|すごすぎ|快適すぎ', '軽い不満':r'面倒|めんど|微妙|だるい|ダルい|しんど|不便',
 '強い苛立ち':r'クソ|ゴミ|カス|ふざけ|イライラ|使い物になら|いい加減', '激怒':r'死ね|タヒね|消え失せ|ぶち|殺|くたば',
 '皮肉':r'\(\)|（）|じゃあ.*[?？]|何が.*[?？]|お客様', '嘲笑':r'草|笑|w{2,}|何この.*w',
 '自虐':r'俺.*(?:アホ|バカ)|自分.*(?:アホ|バカ)|無課金|爆死|金がない', 'ネタ':r'世界線|ドラえもん|飛ぶぞ|草|\(\)|（）',
 '瞬間リアクション':r'^(?:マジか|は[?？]|エグ|凄い|やば|ヤバ|ほんとだ|何この)', '迷い':r'迷|悩|どうしよう|分から|わから|かな[あ。？?]*$',
 '自己修正':r'でも|まあ|いや|ただ|とはいえ|そうはいっても', '解説・共有':r'共有|方法|使えば|できます|手順|↓|→',
 'ツール紹介':r'作った|作成|公開|ツール|アプリ.*紹介|拡張機能.*(?:便利|使え)', '丁寧な対外文':r'です|ます|ください|ありがとう|お願い|すみません'}
TOPICS={'software':r'AI|Codex|Gemini|ChatGPT|Claude|UserScript|ブラウザ|拡張機能|アプリ|ソフト|コード',
        'hardware':r'Galaxy|iPhone|Samsung|カメラ|センサー|バッテリー|イヤホン|PC|Mac|Windows|スマホ',
        'game':r'原神|ガチャ|フリーナ|螺旋|原石|凸|フリンズ|ネフェル|スカーク|DPS|キャラ',
        'daily':r'飯|美味|カレー|旅行|空港|帰国|日本|大学|授業|家賃|電車'}


def clean(text):
    if text.strip()=='[本文なし / メディアのみ]':
        return '', 'media_only', ['export_placeholder']
    reasons=[]; result=[]; in_url=False; in_fence=False
    for line in text.splitlines():
        if '```' in line:
            in_fence=not in_fence; reasons.append('code'); continue
        if in_fence or re.match(r'^\s*(?:yt-dlp |ffmpeg |adb |npm |\$ |Traceback|Error |unexpected status|\s*at \S|\s*-o |\s*"URL")',line):
            reasons.append('log_or_command'); continue
        if re.match(r'^\s*(?:https?://|www\.)',line):
            in_url=True; reasons.append('url_or_wrapped_url'); continue
        if in_url and (line.strip()=='…' or re.fullmatch(r'[\x20-\x7e]+',line or '') or not line.strip()):
            continue
        in_url=False
        if not line.strip(): result.append(''); continue
        if re.match(r'^\s*(?:>|RT @|引用[:：])',line): reasons.append('quote'); continue
        if re.fullmatch(r'\s*(?:[@#][\w\u3000-\u9fff]+\s*)+',line): reasons.append('tag_or_mention'); continue
        line=re.sub(r'https?://\S+','',line)
        if line.strip(): result.append(line)
    natural='\n'.join(result).strip()
    if re.search(r'キャンペーン|チャレンジ回数を記入|参加すると|フォロー.*リポスト|抽選で|チャレンジ成功！',text): category='template_or_campaign'
    elif not natural: category='media_only'
    elif re.search(r'^RT @|^引用[:：]',text): category='quoted_external'
    elif 'log_or_command' in reasons or 'code' in reasons: category='system_or_log' if len(natural)<12 else 'contextual_original'
    elif reasons: category='contextual_original'
    elif re.search(r'【.*】.*(?:MP|GB|mAh)',natural): category='uncertain'
    else: category='natural_original'
    return natural,category,sorted(set(reasons))


def sentences(text):
    return [s.strip() for s in re.split(r'[。！？!?]+|\n+',text) if s.strip()]


def distribution(values):
    if not values:return {'n':0}
    v=sorted(values)
    def percentile(p):
        n=(len(v)-1)*p; i=int(n); return round(v[i]+(v[min(i+1,len(v)-1)]-v[i])*(n-i),3)
    return {'n':len(v),'mean':round(st.mean(v),3),'median':st.median(v),'sd_population':round(st.pstdev(v),3),'min':v[0],'max':v[-1], **{f'p{p}':percentile(p/100) for p in [10,25,50,75,90,95,99]}}


def metrics(texts):
    n=len(texts)
    if not n:return {'n':0}
    rate=lambda f:round(sum(bool(f(t)) for t in texts)/n,5)
    positions={}
    for word in MARKERS:
        c=Counter()
        for t in texts:
            for s in sentences(t):
                for m in re.finditer(re.escape(word),s):
                    c['start' if m.start()==0 else 'end' if m.end()==len(s) else 'middle']+=1
        positions[word]={'post_count':sum(word in t for t in texts),'occurrences':sum(t.count(word) for t in texts),**{p:c[p] for p in ['start','middle','end']}}
    ending_count=Counter()
    for t in texts:
        s=t.rstrip('。！？!?wｗ…()（） \n')
        matched=next((e for e in sorted(ENDINGS,key=len,reverse=True) if s.endswith(e)),None)
        ending_count[matched or 'other']+=1
    return {'n':n,'raw_chars':distribution([len(t) for t in texts]),'weighted_chars':distribution([count(t) for t in texts]),
            'sentence_count':distribution([len(sentences(t)) for t in texts]),'sentence_chars':distribution([len(s) for t in texts for s in sentences(t)]),
            'newlines':distribution([t.count('\n') for t in texts]),'paragraphs':distribution([len(re.split(r'\n\s*\n',t)) for t in texts]),
            'single_sentence_rate':rate(lambda t:len(sentences(t))==1),'short_le40_weighted_rate':rate(lambda t:count(t)<=40),
            'long_gt200_weighted_rate':rate(lambda t:count(t)>200),'over280_rate':rate(lambda t:count(t)>280),
            'question_rate':rate(lambda t:re.search(r'[?？]|(?:かな|だろ|なのか)[あ。]*$',t)),
            'uncertainty_rate':rate(lambda t:re.search(r'多分|たぶん|仮に|気がする|かもしれ|みたい|らしい|予想|分から|わから|だろ|かな',t)),
            'self_correction_rate':rate(lambda t:re.search(r'でも|まあ|いや|ただ|とはいえ',t)),
            'profanity_rate':rate(lambda t:re.search(r'クソ|くそ|ゴミ|カス|タヒね|死ね|消え失せ',t)),
            'laughter_w_rate':rate(lambda t:re.search(r'(?<![A-Za-z])w+(?![A-Za-z])',t)),
            'bullet_rate':rate(lambda t:re.search(r'(?m)^\s*[・●•\-]|↓|→',t)),
            'technical_token_density':round(sum(sum(len(m[0]) for m in re.finditer(r'[A-Za-z][A-Za-z0-9_+./-]*|拡張機能|同期|自動化|設定|機能|実装|アプリ|ブラウザ',t)) for t in texts)/sum(map(len,texts)),5),
            'newline_rate':rate(lambda t:'\n' in t),'markers':positions,'endings':dict(ending_count),
            'symbols':{p:{'posts':sum(p in t for t in texts),'occurrences':sum(t.count(p) for t in texts)} for p in ['。','、','？','！','?','!','w','ww','草','(',')','（','）','→','↓','・','\n',':','：','/']},
            'cooccurrence':{name:sum(bool(re.search(a,t)) and bool(re.search(b,t)) for t in texts) for name,a,b in [('まあ+でも','まあ','でも'),('まあ+けど','まあ','けど'),('てか+question','てか','[?？]|かな|だろ|なのか'),('マジで+評価','マジで','神|便利|最高|ゴミ|クソ|酷|凄|すご|エグ|やば|ヤバ')]}}


def analyze(rows,annotations=None):
    annotations=annotations or {}
    cleaned=[]
    for r in rows:
        t,c,reasons=clean(r['text']); cleaned.append({**r,'natural':t,'category':c,'cleanup':reasons,
             'modes':[k for k,v in MODE_RULES.items() if re.search(v,t)],
             'topics':[k for k,v in TOPICS.items() if re.search(v,t)]})
        if r['index'] in annotations:
            a=annotations[r['index']];cleaned[-1].update(category=a['category'],modes=a['modes'],pattern=a.get('pattern',''),marker_function=a.get('marker_function',''))
    eligible=[r for r in cleaned if r['category'] in ['natural_original','contextual_original'] and r['natural']]
    periods={}
    for r in eligible:
        year,month=map(int,r['datetime'][:7].split('-')); period=f'{year}-Q{(month-1)//3+1}'
        periods.setdefault(period,[]).append(r)
    summary={'analysis_version':'1.0.0','input_split':sorted(set(r['split'] for r in rows)),
      'categories':dict(Counter(r['category'] for r in cleaned)), 'raw_export':metrics([r['text'] for r in rows]),
      'natural':metrics([r['natural'] for r in eligible]),
      'periods':{p:{'all':metrics([r['natural'] for r in rr]),'topics':{topic:metrics([r['natural'] for r in rr if topic in r['topics']]) for topic in TOPICS}} for p,rr in sorted(periods.items())},
      'modes':{mode:{**metrics([r['natural'] for r in eligible if mode in r['modes']]),
                     'sarcasm_count':sum(mode in r['modes'] and '皮肉' in r['modes'] for r in eligible),
                     'humor_count':sum(mode in r['modes'] and any(m in r['modes'] for m in ['ネタ','嘲笑','自虐']) for r in eligible)} for mode in MODE_RULES},
      'mode_examples':{mode:[r['index'] for r in eligible if mode in r['modes']][:12] for mode in MODE_RULES},
      'topics':dict(Counter(topic for r in eligible for topic in r['topics']))}
    return summary,cleaned


def main():
    ap=argparse.ArgumentParser();ap.add_argument('input',type=Path);ap.add_argument('--out',required=True,type=Path);ap.add_argument('--annotations',type=Path);args=ap.parse_args()
    rows=[json.loads(l) for l in args.input.read_text().splitlines() if l.strip()]
    if any(r['split']!='train' for r in rows):raise SystemExit('Main analysis accepts train only')
    annotations={r['index']:r for r in (json.loads(l) for l in args.annotations.read_text().splitlines())} if args.annotations else None
    if args.annotations and args.annotations.resolve()==(Path(__file__).resolve().parents[1]/'eval/train_labels.jsonl'):
        identity=json.loads(args.annotations.with_suffix('.meta.json').read_text())
        for file,key in [(args.input,'train_jsonl_sha256'),(args.annotations,'labels_sha256')]:
            if hashlib.sha256(file.read_bytes()).hexdigest()!=identity[key]:
                raise SystemExit('Frozen train labels belong to a different input/label hash')
    if annotations and set(annotations)!=set(r['index'] for r in rows):raise SystemExit('Annotation coverage mismatch')
    summary,cleaned=analyze(rows,annotations);args.out.mkdir(parents=True,exist_ok=True)
    (args.out/'train-statistics.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
    (args.out/'train-cleaned.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in cleaned))
    print(json.dumps({k:summary[k] for k in ['categories','topics']},ensure_ascii=False))
    print(json.dumps({k:v for k,v in summary['natural'].items() if k not in ['markers','symbols','endings']},ensure_ascii=False))


if __name__=='__main__':main()
