"""Fresh text-only Codex subprocesses. No auth copying; narrowed child environment.

macOS Seatbelt additionally denies corpus/workspace and personal instruction reads.
CLI read-only alone does not prevent reading outside the working directory.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time

MODEL='gpt-5.6-sol'
FLAGS=['shell_tool','unified_exec','apps','plugins','memories','chronicle','multi_agent','multi_agent_v2',
       'browser_use','computer_use','image_generation','in_app_browser','hooks','skill_search','code_mode_host','shell_snapshot']


def child_env():
    return {k:v for k,v in os.environ.items() if k in ['HOME','PATH','USER','LOGNAME','LANG','LC_ALL','TMPDIR','CODEX_HOME','SSL_CERT_FILE','SSL_CERT_DIR']}


def executable():
    launcher=Path(shutil.which('codex')).resolve()
    if launcher.suffix=='.js':
        candidates=list(launcher.parent.parent.glob('node_modules/@openai/codex-darwin-*/vendor/*/bin/codex'))
        if len(candidates)==1:return str(candidates[0])
    return str(launcher)


def isolation(work, denied=()):
    if sys.platform!='darwin' or not shutil.which('sandbox-exec'):
        raise RuntimeError('Verified isolation requires macOS sandbox-exec; port and validate the read-deny boundary first')
    home=Path.home(); codex=Path(os.environ.get('CODEX_HOME',home/'.codex'))
    roots=[Path(__file__).resolve().parents[3], home/'Downloads', home/'.agents', codex/'attachments',
           codex/'skills',codex/'.agents',codex/'memories',codex/'sessions',codex/'archived_sessions',codex/'plugins',*map(Path,denied)]
    rules=['(version 1)','(allow default)']
    for p in roots:
        rules.append('(deny file-read* (subpath '+json.dumps(str(p.resolve()))+'))')
    for p in [codex/'AGENTS.md',codex/'AGENTS.override.md',home/'AGENTS.md',home/'AGENTS.override.md']:
        rules.append('(deny file-read* (literal '+json.dumps(str(p))+'))')
    profile=work/'read-boundary.sb';profile.write_text('\n'.join(rules)+'\n')
    return ['sandbox-exec','-f',str(profile)]


def configs():
    values=['project_doc_max_bytes=0','web_search="disabled"','model_reasoning_effort="high"',
            'developer_instructions=""','history.persistence="none"','include_apps_instructions=false',
            'skills.include_instructions=false']
    values += ['features.'+k+'=false' for k in FLAGS]
    return sum((['-c',v] for v in values),[])


def run(prompt,destination,model=MODEL,schema=None,timeout=600):
    destination=Path(destination);destination.mkdir(parents=True,exist_ok=True)
    if (destination/'result.json').exists():raise RuntimeError('Session result exists; never silently overwrite an evaluation')
    with tempfile.TemporaryDirectory(prefix='writing-style-session-') as wd:
        work=Path(wd); prefix=isolation(work)
        # Inspect the same instruction assembly before generation, without exposing it in tracked logs.
        args=[executable(),'exec','--ephemeral','--ignore-user-config','--sandbox','read-only',
              '--skip-git-repo-check','--model',model,'--json','-C',str(work),'-o',str(work/'answer.txt'),*configs()]
        if schema:
            sp=work/'schema.json';sp.write_text(json.dumps(schema));args+=['--output-schema',str(sp)]
        args+=['-'];start=time.monotonic()
        (destination/'prompt.txt').write_text(prompt)
        with (destination/'events.jsonl').open('w') as out,(destination/'stderr.txt').open('w') as err:
            result=subprocess.run(prefix+args,input=prompt,text=True,stdout=out,stderr=err,cwd=work,env=child_env(),timeout=timeout)
        events=[json.loads(l) for l in (destination/'events.jsonl').read_text().splitlines() if l.strip()]
        expected_denials=[e for e in events if e.get('item',{}).get('type')=='error' and
                          'Failed to read global AGENTS.md' in e['item'].get('message','') and
                          'Operation not permitted' in e['item'].get('message','')]
        forbidden=[e for e in events if e.get('item',{}).get('type') not in (None,'agent_message','reasoning') and e not in expected_denials]
        failed=[e for e in events if e.get('type') in ['error','turn.failed']]
        if result.returncode or forbidden or failed or not (work/'answer.txt').exists():
            raise RuntimeError(f'CLI session failed: rc={result.returncode}, tool events={len(forbidden)}, failures={len(failed)}; inspect local logs')
        answer=(work/'answer.txt').read_text();(destination/'answer.txt').write_text(answer)
        meta={'model':model,'reasoning':'high','cli_version':subprocess.check_output(['codex','--version'],text=True,env=child_env()).strip(),
              'elapsed_seconds':round(time.monotonic()-start,3),'prompt_sha256':hashlib.sha256(prompt.encode()).hexdigest(),
              'answer_sha256':hashlib.sha256(answer.encode()).hexdigest(),'tool_events':0,
              'expected_global_instruction_read_denials':len(expected_denials),
              'thread_ids':[e.get('thread_id') for e in events if e.get('type')=='thread.started'],
              'usage':[e.get('usage') for e in events if e.get('type')=='turn.completed'],
              'sandbox':'read-only + macOS process read-deny','flags':configs()}
        (destination/'result.json').write_text(json.dumps(meta,indent=2)+'\n')
        return answer,meta


if __name__=='__main__':
    text,meta=run('Report JSON with callable tool names, whether any AGENTS.md contents, skills catalog, or personal memory were supplied. Do not use any tool.',sys.argv[1])
    print(text);print(json.dumps(meta))
