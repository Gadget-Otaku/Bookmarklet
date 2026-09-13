"""Select on development only, normalize release metadata, then lock file hashes."""
from datetime import datetime,timezone
import hashlib
import json
from pathlib import Path
import re
from build_eval_prompt import runtime

BASE=Path(__file__).resolve().parents[1]


def main():
    frozen=BASE/'.local/freeze.json'
    if frozen.exists() or (BASE/'.local/final-unlocked.json').exists():
        raise SystemExit('Profile already frozen; do not retune the consumed final holdout')
    rounds={n:json.loads((BASE/'.local/eval-runs'/n/'summary.json').read_text()) for n in ['baseline','revision1','revision2']}
    if len({s['context']['case_set_sha256'] for s in rounds.values()})!=1:raise SystemExit('Case sets differ')
    if len({s['context']['model'] for s in rounds.values()})!=1:raise SystemExit('Models differ')
    def key(name):
        s=rounds[name];d=s['dimension_means']
        return s['mechanical_pass'],(d['intent']+d['fact_discipline'])/2,s['mean_score']
    best=max(rounds,key=key);src=BASE/'.local/eval-runs'/best
    style=re.sub(r'^style_version: .+$','style_version: 1.0.0',(src/'STYLE.md').read_text(),flags=re.M)
    instructions=re.sub(r'^- runtime_version: .+$','- runtime_version: 1.0.0',(src/'GPTS_INSTRUCTIONS.md').read_text(),flags=re.M)
    body=runtime(instructions)
    instructions+=f'\n## Runtime size at release\n\n- Raw Unicode chars: {len(body)}\n- UTF-8 bytes: {len(body.encode())}\n- Lines: {len(body.splitlines())}\n- Current official GPTs Instructions limit: not established by checked official documentation.\n- Usage percentage / remaining margin: unknown; no unrelated Custom Instructions limit substituted.\n'
    (BASE/'STYLE.md').write_text(style);(BASE/'GPTS_INSTRUCTIONS.md').write_text(instructions)
    record={'frozen_at':datetime.now(timezone.utc).isoformat(),'selected_round':best,'style_version':'1.0.0','runtime_version':'1.0.0',
            'selection_key':list(key(best)),'selection_rule':'mechanical_pass, mean(intent,fact_discipline), overall mean; development only',
            'style_sha256':hashlib.sha256(style.encode()).hexdigest(),'runtime_sha256':hashlib.sha256(instructions.encode()).hexdigest(),
            'runtime_counts':{'raw_chars':len(body),'utf8_bytes':len(body.encode()),'lines':len(body.splitlines())},
            'case_set_sha256':rounds[best]['context']['case_set_sha256'],'model':rounds[best]['context']['model']}
    with frozen.open('x') as f:json.dump(record,f,ensure_ascii=False,indent=2)
    print(json.dumps(record,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
