"""Runtime extraction shared by GPTs copy/paste counts and isolated evaluation."""
import argparse
import json
from pathlib import Path

START='<!-- GPTS_RUNTIME_START -->'
END='<!-- GPTS_RUNTIME_END -->'


def runtime(text):
    if text.count(START)!=1 or text.count(END)!=1 or text.index(START)>text.index(END):
        raise ValueError('Exactly one ordered pair of GPTs markers is required')
    return text.split(START)[1].split(END)[0].strip()


def build(style,instructions,cases):
    # No constraints, reference, expected answer, or feedback sent to generator.
    public=[{'id':c['id'],'input':c['input']} for c in cases]
    return ('<RUNTIME_INSTRUCTIONS>\n'+runtime(instructions)+'\n</RUNTIME_INSTRUCTIONS>\n'
            '<STYLE_PROFILE>\n'+style+'\n</STYLE_PROFILE>\n'
            '<USER_INPUT>\n'+json.dumps(public,ensure_ascii=False)+'\n</USER_INPUT>\n'
            'Transport adapter: each item is an independent user request. Return a JSON object with results, '
            'one {id, output} per item in order. output is the exact runtime response string with ①/②/③. '
            'Do not combine facts across items. Tools are unavailable in this proxy. Use only supplied facts; '
            'do not pretend to search. No commentary or explanations outside this JSON.')


if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--style',type=Path,required=True);ap.add_argument('--instructions',type=Path,required=True);ap.add_argument('--cases',type=Path,required=True);args=ap.parse_args()
    print(build(args.style.read_text(),args.instructions.read_text(),[json.loads(l) for l in args.cases.read_text().splitlines()]))
