"""Read back default-branch files with gh, compare bytes, run the fetched copies."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from urllib.request import Request,urlopen
from run_codex_eval import BASE,read_jsonl,write_jsonl


def gh(*args):return json.loads(subprocess.check_output(['gh',*args],text=True))
def sha(data):return hashlib.sha256(data).hexdigest()


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--expected-head',required=True);args=ap.parse_args()
    repo='Gadget-Otaku/Bookmarklet'
    meta=gh('repo','view',repo,'--json','nameWithOwner,isPrivate,defaultBranchRef,url')
    if meta['nameWithOwner']!=repo or meta['isPrivate']:raise SystemExit('Public owner/repository gate failed')
    branch=meta['defaultBranchRef']['name'];head=gh('api',f'repos/{repo}/commits/{branch}')['sha']
    if head!=args.expected_head:raise SystemExit('Default-branch commit differs from expected publication HEAD')
    out=BASE/'.local/remote'/head;out.mkdir(parents=True,exist_ok=True);hashes={};raw_urls={}
    for name in ['STYLE.md','GPTS_INSTRUCTIONS.md']:
        raw_url=f'https://raw.githubusercontent.com/{repo}/{branch}/writing-style/x/{name}'
        request=Request(raw_url,headers={'User-Agent':'writing-style-remote-smoke'})
        with urlopen(request,timeout=30) as response:
            if response.status!=200:raise SystemExit('Public raw fetch failed: '+name)
            contents=response.read()
        if sha(contents)!=sha((BASE/name).read_bytes()):raise SystemExit('Remote/local content mismatch: '+name)
        (out/name).write_bytes(contents);hashes[name]=sha(contents);raw_urls[name]=raw_url
    if gh('api',f'repos/{repo}/commits/{branch}')['sha']!=head:raise SystemExit('Default branch changed during raw fetch')
    selected=['S-technical','S-formal','S-speculation','S-url','S-reaction']
    write_jsonl(out/'cases.jsonl',[c for c in read_jsonl(BASE/'eval/cases.jsonl') if c['id'] in selected])
    subprocess.run([sys.executable,str(BASE/'scripts/run_codex_eval.py'),'evaluate','--cases',str(out/'cases.jsonl'),
                    '--round','remote-smoke','--out',str(out/'smoke'),'--style',str(out/'STYLE.md'),
                    '--instructions',str(out/'GPTS_INSTRUCTIONS.md'),'--smoke'],check=True)
    summary=json.loads((out/'smoke/summary.json').read_text())
    record={'repository':meta,'branch':branch,'remote_sha':head,'expected_head':args.expected_head,'content_hashes':hashes,'raw_urls':raw_urls,
            'runtime_source':'anonymous raw.githubusercontent.com files from the verified default branch','cases':summary['case_count'],
            'mechanical_pass':summary['mechanical_pass'],'failures':summary['mechanical_failures']}
    (out/'verification.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(record,ensure_ascii=False,indent=2))
    if summary['mechanical_pass']!=summary['case_count']:raise SystemExit('Remote smoke failed')


if __name__=='__main__':main()
