"""Parse the detailed TXT export without displaying bodies; freeze ID-only splits."""
import argparse
from collections import Counter
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re

VERSION = '1.0.0'
HEADER = re.compile(r'^===== (\d+) / (\d+) =====\s*$', re.M)


def split_for(post_id):
    bucket = int(hashlib.sha256(post_id.encode('ascii')).hexdigest(), 16) % 10
    return 'train' if bucket < 8 else 'development' if bucket == 8 else 'final'


def parse(text):
    headers = list(HEADER.finditer(text))
    expected = re.search(r'^件数:\s*(\d+)\s*$', text, re.M)
    records, malformed = [], []
    for n, h in enumerate(headers):
        body = text[h.end():headers[n + 1].start() if n + 1 < len(headers) else len(text)].lstrip('\r\n')
        m = re.match(r'日時:\s*([^\n]*)\nURL:\s*([^\n]*)\n\n([\s\S]*)', body)
        if not m:
            malformed.append(int(h[1])); continue
        date, url, post = m.groups()
        id_match = re.fullmatch(r'https://(?:x\.com|twitter\.com)/niwakasumaho/status/(\d+)', url.strip())
        post_id = id_match[1] if id_match else ''
        try:
            # Export records local wall time, without timezone metadata.
            iso = datetime.strptime(date.strip(), '%Y/%m/%d %H:%M:%S').isoformat()
        except ValueError:
            iso = ''
        records.append({'index':int(h[1]), 'id':post_id, 'datetime':iso,
                        'datetime_original':date.strip(), 'url':url.strip(),
                        'text':post.rstrip('\r\n'), 'split':split_for(post_id) if post_id else 'invalid'})
    def dup(field):
        return sum(v-1 for k,v in Counter(r[field] for r in records).items() if k and v>1)
    audit = {'parser_version':VERSION, 'expected_count':int(expected[1]) if expected else None,
             'header_count':len(headers), 'parsed_count':len(records), 'duplicate_id':dup('id'),
             'duplicate_url':dup('url'), 'missing_date':sum(not r['datetime'] for r in records),
             'missing_url':sum(not r['url'] for r in records),
             'invalid_id':sum(not r['id'] for r in records),
             'empty_body':sum(not r['text'].strip() for r in records), 'malformed_records':malformed,
             'explicit_no_body_placeholder':sum(r['text'].strip()=='[本文なし / メディアのみ]' for r in records),
             'index_sequence_valid':[r['index'] for r in records]==list(range(1,len(records)+1)),
             'header_totals_consistent':bool(expected) and all(int(h[2])==int(expected[1]) for h in headers),
             'split_counts':dict(Counter(r['split'] for r in records)),
             'date_min':min((r['datetime'] for r in records if r['datetime']),default=None),
             'date_max':max((r['datetime'] for r in records if r['datetime']),default=None)}
    audit['pass'] = (audit['parsed_count']==audit['expected_count']==audit['header_count'] and
                     not any(audit[k] for k in ['duplicate_id','duplicate_url','missing_date','missing_url','invalid_id','malformed_records']) and
                     audit['index_sequence_valid'] and audit['header_totals_consistent'])
    return records,audit


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('source',type=Path); ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args(); raw=args.source.read_bytes(); rows,audit=parse(raw.decode('utf-8-sig').replace('\r\n','\n'))
    audit.update(source_sha256=hashlib.sha256(raw).hexdigest(),source_bytes=len(raw),source_lines=len(raw.splitlines()),
                 split_algorithm='int(SHA256(ASCII(post_id)).hexdigest(),16) % 10; 0..7=train,8=development,9=final; no seed')
    args.out.mkdir(parents=True,exist_ok=True)
    if not audit['pass']:
        print(json.dumps(audit,ensure_ascii=False,indent=2)); raise SystemExit('Parse validation failed; no splits written')
    for split in ['train','development','final']:
        content=''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows if r['split']==split)
        target=args.out/(split+'.jsonl')
        if target.exists() and target.read_text()!=content:
            raise SystemExit('Existing split differs; use a new corpus directory')
        target.write_text(content)
    (args.out/'manifest.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(audit,ensure_ascii=False,indent=2))


if __name__=='__main__': main()
