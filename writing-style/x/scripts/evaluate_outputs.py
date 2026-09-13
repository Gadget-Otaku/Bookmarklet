"""Mechanical gates precede the independent judge; never repair model output."""
import argparse
from difflib import SequenceMatcher
import json
from pathlib import Path
import re
from count_x_chars import count,urls
from analyze_corpus import metrics

DIMENSIONS=['style_similarity','thought_flow','vocabulary','rhythm','mode','emotion','sarcasm',
            'x_naturalness','ai_pattern_avoidance','conciseness','intent','fact_discipline','over_imitation_avoidance']
FORBIDDEN=r'以下(?:です|の[通とお]り|の3)|修正しました|ファクトチェックしました|おすすめは|文字数[は:：]|^analysis\b|必要であれば.*(?:できます|します)|STYLE\.md'
FAILURE_LABELS=['too_ai_like','too_verbose','too_aggressive','too_many_slang_markers','too_many_maa',
 'insufficient_sarcasm','fake_sarcasm','excessive_balance','lost_emotion','invented_facts','over_correction',
 'wrong_mode','formal_mode_too_casual','short_reaction_too_verbose','three_outputs_too_similar',
 'intent_loss','certainty_shift','awkward_rhythm']


def check(output,case=None):
    case=case or {};fail=[]
    m=re.fullmatch(r'①\n([\s\S]+?)\n\n②\n([\s\S]+?)\n\n③\n([\s\S]+?)\s*',output)
    if not m:return {'pass':False,'failures':['numbering_or_preamble'],'options':[],'lengths':[]}
    opts=[s.strip() for s in m.groups()];lens=[count(s) for s in opts]
    if len(opts)!=3:fail.append('option_count')
    if any(not s for s in opts):fail.append('empty')
    if any(n>280 for n in lens):fail.append('over280')
    if any(re.search(r'^[①②③]$',s,re.M) for s in opts):fail.append('extra_option')
    if any(re.search(FORBIDDEN,s,re.M|re.I) for s in opts):fail.append('forbidden_meta')
    # Identical URLs are protected spans, not evidence of duplicate prose.
    normalize=lambda s:re.sub(r'[\s。！？!?、,.]','',re.sub(r'https?://\S+','',s))
    similarities=[SequenceMatcher(None,normalize(opts[i]),normalize(opts[j])).ratio() for i,j in [(0,1),(0,2),(1,2)]]
    if any(normalize(opts[i])==normalize(opts[j]) or
           (min(len(normalize(opts[i])),len(normalize(opts[j])))>=60 and similarities[k]>=0.94)
           for k,(i,j) in enumerate([(0,1),(0,2),(1,2)])):fail.append('obvious_duplicate')
    actual_urls=[[u[2] for u in urls(o)] for o in opts]
    required=case.get('constraints',{}).get('required_urls',[])
    allowed=case.get('constraints',{}).get('allowed_urls',required)
    for found in actual_urls:
        if any(u not in found for u in required):fail.append('missing_url')
        if any(u not in allowed for u in found):fail.append('invented_url')
    for value in case.get('constraints',{}).get('forbidden_strings',[]):
        if any(value in o for o in opts):fail.append('forbidden_string')
    return {'pass':not fail,'failures':sorted(set(fail)),'options':opts,'lengths':lens,'pair_similarities':similarities,'url_counts':list(map(len,actual_urls))}


def aggregate(results):
    from collections import Counter
    all_opts=[o for r in results for o in r['mechanical']['options']]
    scores={d:[r['judge']['scores'][d] for r in results if r.get('judge')] for d in DIMENSIONS}
    means={d:round(sum(v)/len(v),4) if v else None for d,v in scores.items()}
    return {'case_count':len(results),'candidate_count':len(all_opts),
            'mechanical_pass':sum(r['mechanical']['pass'] for r in results),
            'mechanical_failures':dict(Counter(f for r in results for f in r['mechanical']['failures'])),
            'dimension_means':means,'mean_score':round(sum(means.values())/len(means),4) if all(v is not None for v in means.values()) else None,
            'failure_clusters':dict(Counter(label for r in results if r.get('judge') for label in FAILURE_LABELS
                                            if any(label in f for f in r['judge']['failures']))),
            'generated_statistics':metrics(all_opts)}


if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('results',type=Path);args=ap.parse_args()
    rows=[json.loads(l) for l in args.results.read_text().splitlines()];print(json.dumps(aggregate(rows),ensure_ascii=False,indent=2))
