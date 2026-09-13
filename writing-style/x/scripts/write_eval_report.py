"""Publish aggregate evidence only; raw posts, prompts and outputs stay local."""
import argparse
from collections import Counter
from datetime import datetime,timezone
import difflib
import hashlib
import json
from pathlib import Path
import random
import re
import statistics
from analyze_corpus import clean,metrics
from build_eval_prompt import runtime
from evaluate_outputs import DIMENSIONS,aggregate
from run_codex_eval import BASE,read_jsonl


def sha(data):return hashlib.sha256(data).hexdigest()
def table(headers,rows):
    return '\n'.join(['| '+' | '.join(map(str,headers))+' |','| '+' | '.join(['---']*len(headers))+' |',*['| '+' | '.join(map(str,r))+' |' for r in rows]])
def paired_difference(first,second):
    a={r['id']:r for r in first};b={r['id']:r for r in second}
    if set(a)!=set(b):raise ValueError('Paired cases differ')
    delta=[statistics.mean(b[k]['judge']['scores'].values())-statistics.mean(a[k]['judge']['scores'].values()) for k in sorted(a)]
    rng=random.Random(20260911)
    boot=sorted(statistics.mean(rng.choices(delta,k=len(delta))) for _ in range(2000))
    return {'mean':round(statistics.mean(delta),4),'bootstrap_95_case_interval':[round(boot[49],4),round(boot[1949],4)]}


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--remote',type=Path);args=ap.parse_args()
    runs=BASE/'.local/eval-runs';names=['baseline','revision1','revision2','final']
    summaries={n:json.loads((runs/n/'summary.json').read_text()) for n in names}
    results={n:read_jsonl(runs/n/'results.jsonl') for n in names}
    frozen=json.loads((BASE/'.local/freeze.json').read_text())
    final_neutral=read_jsonl(runs/'final-neutral/neutralized.jsonl')
    baseline=json.loads((BASE/'eval/corpus_baseline.json').read_text())
    train=baseline.get('natural',baseline)
    comparison={}
    for n in names:
        rr=[r for r in results[n] if r.get('reference') and clean(r['reference'])[0]]
        comparison[n]={'reference':metrics([clean(r['reference'])[0] for r in rr if clean(r['reference'])[0]]),
                       'generated':metrics([o for r in rr for o in r['mechanical']['options']]),
                       'reference_cases':len(rr)}
    paired={n:paired_difference(results['baseline'],results[n]) for n in ['revision1','revision2']}
    subsets={n:{source:{k:v for k,v in aggregate([r for r in rr if r['source']==source]).items() if k!='generated_statistics'}
                for source in sorted({r['source'] for r in rr})} for n,rr in results.items()}
    sessions=[]
    for p in runs.rglob('result.json'):
        m=json.loads(p.read_text());sessions.append(m)
    ids=[t for s in sessions for t in s.get('thread_ids',[])]
    evidence={'profile':frozen,'rounds':{n:{k:v for k,v in s.items() if k!='generated_statistics'} for n,s in summaries.items()},
              'paired_development_difference':paired,'source_subsets':subsets,'final_selected':len(final_neutral),
              'final_sufficient':sum(r['sufficient'] for r in final_neutral),
              'final_neutral_overlap_cases':sum(bool(r['neutral_overlap']) for r in final_neutral),
              'isolation':{'completed_sessions':len(sessions),'distinct_thread_ids':len(set(ids)),'tool_events':sum(s.get('tool_events',0) for s in sessions)},
              'matched_distribution':comparison}
    remote=json.loads(args.remote.read_text()) if args.remote else None
    evidence['remote']=remote
    global_proof=BASE/'.local/global-publication.json'
    evidence['global_rule_publication']=json.loads(global_proof.read_text()) if global_proof.exists() else None
    current_instructions=(BASE/'GPTS_INSTRUCTIONS.md').read_text()
    current_runtime=runtime(current_instructions)
    current_runtime_version=re.search(r'(?m)^- runtime_version: (.*)$',current_instructions)[1]
    remote_visibility='Private' if remote and remote['repository']['isPrivate'] else 'Public'
    (BASE/'eval/results_summary.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
    hist=BASE/'eval/revisions';hist.mkdir(exist_ok=True)
    for first,second in [('baseline','revision1'),('revision1','revision2'),('revision1','release')]:
        patch=[]
        for file in ['STYLE.md','GPTS_INSTRUCTIONS.md']:
            a=(runs/first/file).read_text().splitlines(keepends=True)
            b=((runs/'final'/file) if second=='release' else runs/second/file).read_text().splitlines(keepends=True)
            patch.extend(difflib.unified_diff(a,b,fromfile='a/'+file,tofile='b/'+file,n=0))
        (hist/f'{first}-to-{second}.patch').write_text(''.join(patch))
    report=['# X style evaluation — 1.0.0','',
      '評価日: 2026-09-11。採用はRevision 1。必須形式を満たす件数を最優先する事前のrubricで54/54となった版を選んだ。Baselineは主観平均と意味保持が上であり、Revision 1が全観点で優れるという結論ではない。',
      '', '## Data and isolation', '',
      'train 1,486件で文体を構築。development 176件中24件をIDのsalted SHA順で選び、synthetic 30件を加えた同じ54件を全3roundで評価。各候補を13軸0–5で採点し、候補→case→datasetの順で平均した。作者推定確率、人間らしさscore、AI検出結果ではない。',
      '', 'モデルはgpt-5.6-sol、reasoning high、Codex CLI 0.145.0。neutralizer、generator、judgeは新規ephemeral session。generatorにはSTYLE、marker内runtime、id/inputだけを渡し、reference、expected_mode、constraints、judge feedbackは渡していない。原文を渡すのはneutralizerとjudgeだけ。neutralizerは原文を中立briefへ変換し、長い日本語説明の一致を独立sessionで再中立化。固有名詞だけの一致は除外した。',
      '', '主なflagsはexec --ephemeral --ignore-user-config --sandbox read-only --skip-git-repo-check --model gpt-5.6-sol --json --output-schema。project_doc_max_bytes=0、web_search=disabled、history.persistence=none、skills.include_instructions=falseに加えshell/apps/plugins/memory系を無効化。macOS Seatbeltはprocess全体にrepository、Downloads、attachments、個人instructions/skills/session/memoryへのread-denyを適用した。native executableを用い、authはコピーも変更もしていない。実設定は[runner](scripts/codex_session.py)。',
      '',f'完了した評価session={len(sessions)}、異なるthread ID={len(set(ids))}、実tool event={evidence["isolation"]["tool_events"]}。global AGENTSの意図した読込み拒否を別扱いし、他のtool/errorは不採用。ラッパーtool名の残存と実アクセスの成功を混同しない。CLI preflightとcanaryのraw証拠は.localに保存。',
      '', '## Iterations', '',
      table(['Round','Cases / candidates','Mechanical PASS','Mean / 5','Intent','Fact'],[
          [n,f'{s["case_count"]} / {s["candidate_count"]}',f'{s["mechanical_pass"]}/{s["case_count"]}',s['mean_score'],s['dimension_means']['intent'],s['dimension_means']['fact_discipline']] for n,s in summaries.items()]),
      '', 'Baselineで反復した確信度変更・類似候補を受け、Revision 1はSTYLEの観測/推測区分とruntimeの候補構造差を修正。形式条件は全件PASSとなったが、一語入力や第3候補に意味追加・省略が増えた。Revision 2では意味の核の照合と感情/推測の区分を強化したが、形式と主観平均の両方で採用基準を更新できなかった。各修正後は全54件を再実行した。',
      '', '修正は[差分](eval/revisions/baseline-to-revision1.patch)、[Revision 2差分](eval/revisions/revision1-to-revision2.patch)で保存。git apply --unidiff-zero --reverseでreleaseとの差分を逆適用してRevision 1を再構成し、各差分を逆順に辿れる。3版とも再構成後のbytesが評価snapshotと一致することを検証した。これらは評価履歴でありruntimeの第二の正本ではない。',
      '', 'Baselineの初回機械判定49/54は、URL保持と短い語順変更を90%文字一致で誤検出した。同じ保存済み出力に対し、URLを除く完全一致又は両候補60文字以上で94%以上一致へ修正して53/54。生成やjudgeの再抽選はしていない。表は全round共通の修正後checker。微妙な同義語交換はjudgeで別評価する。',
      '',table(['Axis',*names],[[d,*[summaries[n]['dimension_means'][d] for n in names]] for d in DIMENSIONS]),
      '', '元投稿からの再構成と未知topicの合成caseを分離した結果:', '',
      table(['Round','Source','n','Mechanical PASS','Mean','Intent','Fact'],[
          [n,source,s['case_count'],s['mechanical_pass'],s['mean_score'],s['dimension_means']['intent'],s['dimension_means']['fact_discipline']]
          for n,parts in subsets.items() for source,s in parts.items()]),
      '', '同一caseの全軸平均差を2,000回bootstrapした参考区間（Baseline差、case単位、固定seed）:', '',
      table(['Round','Mean difference','95% case interval'],[[n,v['mean'],str(v['bootstrap_95_case_interval'])] for n,v in paired.items()]),
      '', 'この区間はLLM再実行の揺らぎを測っていない。独立した人間評価、複数model judge、複数seed比較をしておらず、わずかな点差を確定的な品質差と解釈しない。',
      '', '中立化で原文の感情・曖昧さ・含みが変わる可能性がある。一致0は表現の漏洩検査であり、意味保存の完全性を証明しない。finalの指摘はこの入力変換を含むpipeline全体の結果であり、全てをSTYLE単体の誤差とは断定しない。',
      '', '## Locked final', '',
      f'固定日時 {frozen["frozen_at"]}。最良選択はmechanical PASS件数→intent/fact平均→全軸平均。STYLE/runtimeを1.0.0へ正規化しhash固定した後、final全{len(final_neutral)}件を一度だけ開いた。文体調整には使用していない。中立化後に十分な作者内容がある{sum(r["sufficient"] for r in final_neutral)}件を評価し、内容不足{sum(not r["sufficient"] for r in final_neutral)}件は別扱い。最終スコアを見て生成を選び直していない。',
      '', f'中立化後の長い日本語説明一致={evidence["final_neutral_overlap_cases"]}件。原文はlocal-only。画像や返信先を補わない。同じ短い定型反応のtext hashがtrainと共有するtypesはdev=1、final=2あり、ID分割はtopic/threadの独立を保証しない。',
      '', '## Mechanical failures and judge patterns', '',
      table(['Round','Mechanical failures','Judge failure clusters'],[[n,json.dumps(s['mechanical_failures'],ensure_ascii=False),json.dumps(s['failure_clusters'],ensure_ascii=False)] for n,s in summaries.items()]),
      '',table(['Round','Candidate max units','Candidates over 280','Failed case IDs'],[
          [n,max((v for r in results[n] for v in r['mechanical']['lengths']),default=0),
           sum(v>280 for r in results[n] for v in r['mechanical']['lengths']),
           ', '.join(r['id'] for r in results[n] if not r['mechanical']['pass']) or 'none'] for n in names]),
      '', '機械FAILはLLM高得点で相殺しない。judgeのclusterはcase単位で重複除去した指摘数であり、正解付き分類の精度ではない。文体の一致だけでなく、確認済み事実を条件文へ変える、願望を予測にする、主観を強める、入力外の因果や本人経験を補う失敗を監視する。一語/文脈欠損では意味を保った3案の差を十分に作れない場合が残る。',
      '', 'counterの正しさと、計算toolを使えないLLMだけで常に280以内へ収める能力は別。evalは出力を黙って修正せずFAILを残す。production clientは必要に応じて同じcounterで送信前に検証し、超過候補をユーザーへ渡す前に扱いを決める必要がある。そのclient実装は今回行っていない。',
      '', '## Corpus distribution comparison', '',
      '以下は対応holdout原文と生成候補の比較。原文は自然文cleanup後、生成は全3候補。自然文抽出0のreferenceは、この分布比較のみ両側から除外し、評価scoreからは除外しない。syntheticを除いて話題の差を抑えるが、neutralizationによる内容圧縮や1原文対3候補の違いは残る。全trainとの一致率を採点目標にしていない。', '',
      table(['Set','N','Weighted mean','Sentence mean','Newline rate','Question rate','まあ / てか / マジ / めっちゃ'],
        [[label,m.get('n'),m.get('weighted_chars',{}).get('mean'),m.get('sentence_count',{}).get('mean'),m.get('newline_rate'),m.get('question_rate'),'/'.join(str(m.get('markers',{}).get(w,{}).get('post_count',0)) for w in ['まあ','てか','マジ','めっちゃ'])]
         for label,m in [('train natural',train),*[(n+' '+side,c[side]) for n,c in comparison.items() for side in ['reference','generated']]]]),
      '', '完全な語尾、記号、口癖、句数、長さ分布は[集計JSON](eval/results_summary.json)のmatched_distributionに収録。生成は口癖・改行を抑える傾向があり、本人の自己修正の間や長短の幅を弱める可能性がある。一律quotaで口癖を増やすのではなく、次versionでは同じmode/話題で機能に対応した分布を検査する。',
      '', '## Runtime, tests and reproducibility', '',
      f'採用style_version=1.0.0、runtime_version=1.0.0。marker間本文: {frozen["runtime_counts"]["raw_chars"]} raw chars、{frozen["runtime_counts"]["utf8_bytes"]} UTF-8 bytes、{frozen["runtime_counts"]["lines"]} lines。公式GPTs資料で現在のInstructions上限の明記を確認できず、使用率と余裕はUNKNOWN。通常ChatGPTのCustom Instructions上限を代用していない。[公式資料](https://help.openai.com/en/articles/8554397-creating-a-gpt)（2026-09-11確認）。',
      '', f'現在のGPTs controllerはruntime_version={current_runtime_version}。marker間本文は{len(current_runtime)} raw chars、{len(current_runtime.encode())} UTF-8 bytes、{len(current_runtime.splitlines())} lines。Public GitHubの固定raw URL、HTTP本文metadata検査、会話内再利用、Knowledge fallbackを明記した取得制御。STYLE 1.0.0は不変で、消費済みfinalを再利用してこのruntime更新の主観scoreを作らない。',
      '', '19 unit tests: PASS。ASCII、日本語、改行、複合emoji、URL、混在、279/280/281、parser欠損/重複、本文なしexport marker、安定split、promptからanswer key排除、runtime marker、GitHub取得契約、出力形式、protected URL、重複、schema、保存済み出力hashを検査。固定train labelsで統計を再計算し、元の数値集計とbyte一致。label hashとtrain JSONL hashも照合する。X公式twitter-text完全互換は主張しない。',
      '', '必須file/metadata/link/raw除外、評価済みfrozen hash、現在runtimeのGitHub取得契約はverify_project.pyで検査。raw corpus、holdout、prompts、model出力とeventsは.localのみ。tracked集計は原文・post ID・session IDを含まない。release/round hashesとcase-set hashは集計JSONに保存。',
      '', '## Live GPTs deployment check', '',
      '2026-09-12にGPT `X投稿用` のInstructionsへruntime 1.0.3を保存し、Chromeで再読込した値がmarker間本文とbyte一致することを確認。Floorpでは競合が生じたため、その後の配備確認はChromeの新規タブだけで行った。',
      '', '同じ入力「最新版を再読込して、次のメモを短いX投稿にしてください」で、Pro指定ありは1候補だけを返してFAIL。Pro指定を外した別の新規会話は①②③を各1回含む3候補を返してPASS。model表示のない既定経路とPro経路を同一結果として扱わない。',
      '', 'Private `Gadget-Otaku/dev`は通常Web取得で404となったため、ユーザーの明示指示で公開可能なtracked projectだけをPublic `Gadget-Otaku/Bookmarklet`へ移行。raw corpus、holdout原文、model output/event、credential、local manifestは移行していない。',
      '', 'runtime 1.1.0のmarker本文をGPTへ保存。Chromeの別の新規会話でX投稿を生成しないアクセス専用診断を実行し、応答にraw URLのsource link、account、style_version、generated_atが表示されたためGPTs Web取得をPASSとした。platformは元ファイルの小文字xから表示上Xへ正規化された。',
      '', '## Publication and remote smoke', '']
    if remote:
        report += [f'{remote_visibility} {remote["repository"]["nameWithOwner"]} / default branch {remote["branch"]}。gh read-back SHA `{remote["remote_sha"]}` とpublication worktree HEADが一致。STYLE/GPTSは公開raw URLから取得し、local hash一致を確認。取得copyを明示して独立Codex generatorへ与え、技術・丁寧・推測・URL・瞬間反応のsmoke {remote["mechanical_pass"]}/{remote["cases"]} PASS。judgeは未実行のためsmoke品質scoreは付けない。', '',table(['File','Remote/local SHA-256'],list(remote['content_hashes'].items())), '', '評価後のreportだけを追記する場合も、STYLE/runtime hashは不変。最後の文書commitはGit履歴と完了時read-backで確認する。']
        report += ['', '移行対象46 filesはraw corpus、holdout、model logs、credential、machine-local pathを含まず、必須file/link/privacy/hashと19 unit testsがPASS。移行時のPublic repository全体のtracked auditには既存memo_data.jsonのlegacy absolute path 1件が残るが、今回追加したwriting-style/root規則のfindingではない。']
        if evidence['global_rule_publication']:
            g=evidence['global_rule_publication']
            report += ['',f'一般化したCLI隔離規則は正本からallowlist mirrorを生成し、28 files / drift 0とrule validationを確認。既存設定管理branch `{g["branch"]}` のcommit `{g["commit"]}` へ反映し、Private visibilityと変更3fileのremote SHA-256一致をread-backした。default branchに未統合の他案件履歴を混ぜないため、文体projectの公開と分離している。']
    else:report += ['NOT TESTED: 初回push後にghで取得したcopyを使って5ケースを実行し、この節を実測で更新する。']
    report += ['', '## Public boundary and remaining limits', '',
      '既存の開発Wishlist更新では原文やprivate corpusを外部serviceへ送信していない。Public repositoryへの移行でもraw corpus、holdout、model logsはlocal-onlyを維持する。',
      '', 'Public raw URLのGPTs実取得: PASS。KnowledgeへのSTYLE upload、Iceravenへの組込み、実際のX投稿・UI counter、live fact-check経路、人間の第三者評価: NOT TESTED。CLIのSTYLE+runtime模擬、公開raw read-back、GPTsの実取得を別の成功証拠として記録した。',
      '', '次versionの優先課題は、意味の省略/確信度の変化、短い曖昧入力の3案、本人の自己修正・改行・口癖の機能、丁寧な不同意と技術以外のhumor。finalは使用済みであり、追加の独立コーパスと人間によるblind評価で確認する。今回finalの失敗を見てSTYLEを再調整しない。', '']
    (BASE/'EVAL_REPORT.md').write_text('\n'.join(report))
    print(json.dumps({'report':'x/EVAL_REPORT.md','rounds':list(summaries),'remote_verified':remote is not None}))


if __name__=='__main__':main()
