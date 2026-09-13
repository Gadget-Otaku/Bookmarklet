"""Regenerate numeric evidence tables from fixed labels + local train statistics."""
from collections import Counter
import hashlib
import json
from pathlib import Path
from analyze_corpus import clean

BASE=Path(__file__).resolve().parents[1]
def table(head,rows):
    return '\n'.join(['| '+' | '.join(head)+' |','| '+' | '.join(['---']*len(head))+' |']+
                     ['| '+' | '.join(str(v).replace('\n','newline').replace('|','/') for v in row)+' |' for row in rows])
def pct(v):return f'{v*100:.2f}%'


def main():
    s=json.loads((BASE/'.local/analysis/train-statistics.json').read_text());m=s['natural']
    corpus=BASE/'.local/corpus';manifest=json.loads((corpus/'manifest.json').read_text())
    rows=[json.loads(l) for split in ['train','development','final'] for l in (corpus/(split+'.jsonl')).read_text().splitlines()]
    media=Counter(r['split'] for r in rows if clean(r['text'])[1]=='media_only')
    # Structural leakage diagnostic only: no final bodies are emitted or used for style discovery.
    texts={sp:Counter(hashlib.sha256(r['text'].strip().encode()).hexdigest() for r in rows if r['split']==sp) for sp in ['train','development','final']}
    cross={sp:len(set(texts['train'])&set(texts[sp])) for sp in ['development','final']}
    manifest_md=f"""# Corpus manifest

- Original filename: x_niwakasumaho_posts_detailed_2026-09-11_10-17-22.txt
- Local original path: recorded in ignored x/.local/corpus/source-location.json. Original preserved; copy byte equality verified.
- SHA-256: {manifest['source_sha256']}
- Bytes: {manifest['source_bytes']}; lines: {manifest['source_lines']}
- Export declared: {manifest['expected_count']}; parsed: {manifest['parsed_count']}; record headers: {manifest['header_count']}
- Duplicate IDs: {manifest['duplicate_id']}; duplicate URLs: {manifest['duplicate_url']}
- Missing dates/URLs/invalid IDs: {manifest['missing_date']}/{manifest['missing_url']}/{manifest['invalid_id']}
- Empty bodies: {manifest['empty_body']}; malformed: {len(manifest['malformed_records'])}
- Explicit export no-body/media placeholder: {manifest.get('explicit_no_body_placeholder',0)}. These are nonempty TXT strings, not natural author prose.
- Export wall-time range: {manifest['date_min']} – {manifest['date_max']}. Timezone was not included in the TXT and is not inferred.
- Deterministic split: {manifest['split_algorithm']}
- Train: {manifest['split_counts']['train']}; development: {manifest['split_counts']['development']}; final locked: {manifest['split_counts']['final']}
- Parser: {manifest['parser_version']}; initial split fixed before substantive body analysis.
- Automated no-natural-text / media-or-tags-only count: {sum(media.values())} ({dict(media)}). This is not proof of attached media: the export has no attachment field.
- Train semantic media-only/context-only labels: {s['categories'].get('media_only',0)}. This uses a broader semantic judgment and is not the same denominator/definition as automated detection.
- Exact text hash types shared with train: development={cross['development']}, final={cross['final']}. These are structural overlap diagnostics, not released holdout text. Short stock reactions can coincide across IDs; ID split is not a topic/thread split.

Raw corpus is local-only because future platforms can include private messages. Raw texts, post-ID mapping, reconstructed briefs, judge references, and events stay in .local. Tracked files contain source hash, aggregate statistics, sanitized synthetic cases and index/category/mode labels only.

The final set is not used for style tuning. Development evaluation selects 24 records by ascending SHA-256(\"eval-v1:\" + post_id), before reading selected content. The final evaluation uses all {manifest['split_counts']['final']} assigned records; insufficient context is reported separately, never silently replaced.
"""
    (BASE/'CORPUS_MANIFEST.md').write_text(manifest_md)
    out=['# Quantitative evidence','',f"Training only: {sum(s['categories'].values())} records; semantic analysis eligible: {m['n']}.",'',
         '## Cleaning labels','',table(['Category','Posts'],s['categories'].items()),'',
         '## Length and segmentation','',table(['Metric','Mean','Median','SD(pop)','Min','P10','P25','P75','P90','P95','P99','Max'],
           [[name]+[d[k] for k in ['mean','median','sd_population','min','p10','p25','p75','p90','p95','p99','max']] for name,d in [(k,m[k]) for k in ['raw_chars','weighted_chars','sentence_count','sentence_chars','newlines','paragraphs']]]),'',
         table(['Rate','Value'],[(k,pct(m[k])) for k in ['single_sentence_rate','short_le40_weighted_rate','long_gt200_weighted_rate','over280_rate','question_rate','uncertainty_rate','self_correction_rate','profanity_rate','laughter_w_rate','bullet_rate','newline_rate']]),'',
         '## Markers and positions','', 'Counts are substring matches, not morphological parses. マジ includes マジで; やっぱ includes やっぱり; でも can occur inside other phrases. Positions refer to segmented sentences. Semantic function is reviewed separately.','',
         table(['Marker','Posts','Rate','Occurrences','Start','Middle','End'],[[k,v['post_count'],pct(v['post_count']/m['n']),v['occurrences'],v['start'],v['middle'],v['end']] for k,v in m['markers'].items()]),'',
         '## Endings','', 'Longest matching listed suffix per post; trailing punctuation/laughter stripped. Other includes plain verbs, nouns and unlisted endings, not malformed language.','',
         table(['Ending','Posts','Rate'],[[k,v,pct(v/m['n'])] for k,v in sorted(m['endings'].items(),key=lambda x:-x[1])]),'',
         '## Symbols and co-occurrence','', 'Raw w/ww counts can include Latin names; laughter_w_rate above excludes Latin-word neighbors. Co-occurrence is post-level, not evidence of causal or grammatical function.','',
         table(['Symbol','Posts','Occurrences'],[[k,v['posts'],v['occurrences']] for k,v in m['symbols'].items()]),'',
         table(['Pair','Posts'],m['cooccurrence'].items()),'',
         '## Temporal table','',
         table(['Period','n','Weighted mean','1 sentence','Newline','まあ /100','てか /100','マジ /100','Software','Hardware','Game','Daily'],
           [[p,j['all']['n'],j['all']['weighted_chars']['mean'],pct(j['all']['single_sentence_rate']),pct(j['all']['newline_rate'])]+
            [round(j['all']['markers'][w]['post_count']/j['all']['n']*100,2) for w in ['まあ','てか','マジ']]+[j['topics'][t]['n'] for t in ['software','hardware','game','daily']] for p,j in s['periods'].items()]),'',
         'Topic counts are lexical, multilabel proxies. Game/technical discussions can overlap; labels do not sum to n.','',
         '## Topic-controlled temporal comparison','',
         table(['Period','Software n','Software mean','Software まあ /100','Hardware n','Hardware mean'],
           [[p,j['topics']['software']['n'],j['topics']['software'].get('weighted_chars',{}).get('mean','NA'),
             round(j['topics']['software']['markers']['まあ']['post_count']/j['topics']['software']['n']*100,2) if j['topics']['software']['n'] else 'NA',
             j['topics']['hardware']['n'],j['topics']['hardware'].get('weighted_chars',{}).get('mean','NA')] for p,j in s['periods'].items()]),'',
         '## Mode measurements','', 'Semantic multilabel classification, at most 3 modes per record. Not gold human labels; sparse modes carry wider uncertainty.','',
         table(['Mode','n','Weighted mean','Sentences mean','Newline','Question','Uncertain','Tech density','Self correction','Profanity','Bullet','Sarcasm n','Humor n'],
           [[k,j['n'],j.get('weighted_chars',{}).get('mean','NA'),j.get('sentence_count',{}).get('mean','NA')]+[pct(j.get(v,0)) for v in ['newline_rate','question_rate','uncertainty_rate','technical_token_density','self_correction_rate','profanity_rate','bullet_rate']]+[j['sarcasm_count'],j['humor_count']] for k,j in s['modes'].items()]),'',
         '## Mode vocabulary / endings / punctuation','',
         table(['Mode','Common markers (post n)','Top listed endings (n)','。 / 、 / ！ / w posts'],
           [[k,', '.join(f'{w}:{v["post_count"]}' for w,v in sorted(j['markers'].items(),key=lambda x:-x[1]['post_count'])[:5]),
             ', '.join(f'{w}:{n}' for w,n in [(w,n) for w,n in sorted(j['endings'].items(),key=lambda x:-x[1]) if w!='other'][:8]),
             ' / '.join(str(j['symbols'][v]['posts']) for v in ['。','、','！','w'])] for k,j in s['modes'].items()])]
    (BASE/'QUANTITATIVE.md').write_text('\n'.join(out)+'\n')
    # Compact corpus-wide comparison target for evaluation; no per-post text or IDs.
    (BASE/'eval/corpus_baseline.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'eligible':m['n'],'media_or_tags_only':sum(media.values()),'cross_split_text_hash_overlap':cross}))


if __name__=='__main__':main()
