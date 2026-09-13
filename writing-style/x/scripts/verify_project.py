"""Offline project, privacy, link, schema, counter and parser verification."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from build_eval_prompt import runtime

BASE=Path(__file__).resolve().parents[1]
PROJECT=BASE.parent
REQUIRED=['AGENTS.md','CLAUDE.md','README.md','.gitignore','CHANGELOG.md','AGENT_HANDOFF.md','docs/DECISIONS.md',
 'x/README.md','x/STYLE.md','x/ANALYSIS.md','x/QUANTITATIVE.md','x/GPTS_INSTRUCTIONS.md','x/TEST_CASES.md',
 'x/CORPUS_MANIFEST.md','x/EVAL_REPORT.md','x/eval/README.md','x/eval/cases.jsonl','x/eval/rubric.md',
 'x/eval/train_labels.jsonl','x/eval/train_labels.meta.json','x/eval/corpus_baseline.json',
 'x/eval/schemas/generation.json','x/eval/schemas/judge.json','x/eval/schemas/neutralization.json']


def main():
    errors=[]
    for p in REQUIRED:
        if not (PROJECT/p).is_file():errors.append('Missing: '+p)
    if '@AGENTS.md' not in (PROJECT/'CLAUDE.md').read_text():errors.append('Missing adapter import')
    style=(BASE/'STYLE.md').read_text()
    for key in ['platform','account','style_version','corpus_post_count','corpus_sha256','generated_at']:
        if not re.search('(?m)^'+key+': .+$',style):errors.append('Missing metadata: '+key)
    version=re.search(r'(?m)^style_version: (.*)$',style)
    if not version or not re.fullmatch(r'\d+\.\d+\.\d+(?:-[\w.]+)?',version[1]):errors.append('Invalid version')
    instructions=(BASE/'GPTS_INSTRUCTIONS.md').read_text()
    body=runtime(instructions)
    runtime_version=re.search(r'(?m)^- runtime_version: (.*)$',instructions)
    if not runtime_version or not re.fullmatch(r'\d+\.\d+\.\d+(?:-[\w.]+)?',runtime_version[1]):errors.append('Invalid runtime version')
    for required in ['Gadget-Otaku/Bookmarklet','`main` branch','`writing-style/x/STYLE.md`','https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/main/writing-style/x/STYLE.md','`platform: "x"`','`style_version:`','アップロード済みKnowledge']:
        if required not in body:errors.append('Missing GitHub runtime contract: '+required)
    if 'Gadget-Otaku/dev' in body:errors.append('Private repository remains in current runtime contract')
    cases=[json.loads(l) for l in (BASE/'eval/cases.jsonl').read_text().splitlines()]
    if len({r['id'] for r in cases})!=len(cases) or len(cases)<23:errors.append('Case coverage/IDs')
    for c in cases:
        if not {'id','source','input_type','input','expected_mode','constraints','locked'}<=set(c):errors.append('Case schema: '+c.get('id','?'))
        if c['source']!='synthetic' or c['locked']:errors.append('Holdout in tracked cases')
    labels=[json.loads(l) for l in (BASE/'eval/train_labels.jsonl').read_text().splitlines()]
    if any(set(r)!={'index','category','modes'} for r in labels):errors.append('Raw field in labels')
    if len({r['index'] for r in labels})!=len(labels):errors.append('Duplicate label index')
    identity=json.loads((BASE/'eval/train_labels.meta.json').read_text())
    if identity['labels_sha256']!=hashlib.sha256((BASE/'eval/train_labels.jsonl').read_bytes()).hexdigest():errors.append('Label identity mismatch')
    for p in (BASE/'eval/schemas').glob('*.json'):json.loads(p.read_text())
    indices={r['index'] for r in labels}
    for m in re.finditer(r'\bT(\d+)',(BASE/'ANALYSIS.md').read_text()):
        if int(m[1]) not in indices:errors.append('Evidence is not train: '+m[0])
    for p in PROJECT.rglob('*.md'):
        if '.local' in p.parts:continue
        for target in re.findall(r'(?<!!)\[[^\]]*\]\(([^)]+)\)',p.read_text()):
            if re.match(r'^[a-zA-Z][\w+.-]*:',target) or target.startswith('#'):continue
            path=target.split('#')[0]
            if not (p.parent/path).exists():errors.append(f'Broken link: {p.relative_to(PROJECT)} -> {target}')
    repo=Path(subprocess.check_output(['git','-C',str(PROJECT),'rev-parse','--show-toplevel'],text=True).strip())
    tracked=subprocess.check_output(['git','-C',str(repo),'ls-files','--','writing-style'],text=True).splitlines()
    for p in tracked:
        if '/.local/' in p or re.search(r'(?:source\.txt|events\.jsonl|neutralized\.jsonl|auth\.json)$',p):errors.append('Private/raw tracked: '+p)
    probe=BASE/'.local/corpus/source.txt'
    if subprocess.run(['git','-C',str(PROJECT),'check-ignore','-q','--no-index',str(probe)]).returncode:errors.append('.local not ignored')
    if (BASE/'.local/corpus/manifest.json').exists():
        manifest=json.loads((BASE/'.local/corpus/manifest.json').read_text())
        if manifest['source_sha256']!=hashlib.sha256(probe.read_bytes()).hexdigest():errors.append('Local source changed')
        if manifest['source_sha256'] not in style:errors.append('Profile/source hash differs')
        if len(labels)!=manifest['split_counts']['train']:errors.append('Label count differs')
        if identity['source_sha256']!=manifest['source_sha256'] or identity['train_jsonl_sha256']!=hashlib.sha256((BASE/'.local/corpus/train.jsonl').read_bytes()).hexdigest():errors.append('Label corpus identity mismatch')
    if (BASE/'.local/freeze.json').exists():
        f=json.loads((BASE/'.local/freeze.json').read_text())
        if hashlib.sha256((BASE/'STYLE.md').read_bytes()).hexdigest()!=f['style_sha256']:errors.append('Frozen profile changed: STYLE.md')
        evaluated_runtime=BASE/'.local/eval-runs/final/GPTS_INSTRUCTIONS.md'
        runtime_target=BASE/'GPTS_INSTRUCTIONS.md' if runtime_version and runtime_version[1]==f['runtime_version'] else evaluated_runtime
        if not runtime_target.exists():errors.append('Missing frozen evaluated runtime snapshot')
        elif hashlib.sha256(runtime_target.read_bytes()).hexdigest()!=f['runtime_sha256']:errors.append('Frozen evaluated runtime changed')
    evaluated=0
    for p in (BASE/'.local/eval-runs').glob('*/results.jsonl'):
        rows=[json.loads(l) for l in p.read_text().splitlines() if l.strip()]
        if len({r['id'] for r in rows})!=len(rows):errors.append('Duplicate result IDs: '+p.parent.name)
        for r in rows:
            if not {'id','input','output','mechanical','judge'}<=set(r):errors.append('Result schema: '+p.parent.name)
            if r.get('judge') and len(r['judge']['candidate_scores'])!=3:errors.append('Candidate judge coverage: '+p.parent.name)
        summary=p.with_name('summary.json')
        if summary.exists() and json.loads(summary.read_text())['case_count']!=len(rows):errors.append('Result count mismatch: '+p.parent.name)
        evaluated+=len(rows)
    t=subprocess.run([sys.executable,'-m','unittest','discover','-s',str(BASE/'tests'),'-q'],capture_output=True,text=True)
    if t.returncode:errors.append(t.stdout+t.stderr)
    print(json.dumps({'status':'FAIL' if errors else 'PASS','errors':errors,'synthetic_cases':len(cases),'train_labels':len(labels),'local_eval_rows_checked':evaluated,
                      'runtime':{'raw_chars':len(body),'utf8_bytes':len(body.encode()),'lines':len(body.splitlines())},
                      'unit_tests':t.stderr.strip()},ensure_ascii=False,indent=2))
    raise SystemExit(bool(errors))


if __name__=='__main__':main()
