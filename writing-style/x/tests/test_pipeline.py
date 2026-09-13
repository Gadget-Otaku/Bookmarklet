import importlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

SCRIPTS=Path(__file__).resolve().parents[1]/'scripts'
sys.path.insert(0,str(SCRIPTS))
from count_x_chars import count,urls
from parse_corpus import parse,split_for
from build_eval_prompt import build,runtime,START,END
from evaluate_outputs import check,aggregate
from analyze_corpus import clean,analyze
from run_codex_eval import overlaps


class CounterTests(unittest.TestCase):
    def test_ascii_japanese_newline(self):
        for text,n in [('ABC 12!',7),('日本語',6),('a\n日',4),('a\r\n日',4),('ｶﾀｶﾅ',4)]:
            with self.subTest(text=text):self.assertEqual(count(text),n)
    def test_emoji(self):
        for e in ['😀','👍🏽','👨‍👩‍👧‍👦','🇯🇵','1️⃣','©️','🏳️‍🌈']:
            with self.subTest(emoji=e):self.assertEqual(count(e),2)
    def test_urls(self):
        for text in ['https://example.com','https://example.com/'+'a'*300,'https://例え.テスト/道']:
            self.assertEqual(count(text),23)
        self.assertEqual(count('https://example.com。'),25)
        self.assertEqual(count('(https://example.com/a)'),25)
        self.assertEqual(len(urls('https://example.com/a(b) https://example.org')),2)
        self.assertEqual(count('日本 A😀 https://example.com'),32)
    def test_boundaries(self):
        for n in [279,280,281]:
            self.assertEqual(count('a'*n),n)
        self.assertEqual(count('日'*140),280)
        self.assertEqual(count('日'*140+'a'),281)
    def test_equivalent_unicode(self):
        self.assertEqual(count('e\u0301'),count('é'))


class ParserTests(unittest.TestCase):
    def source(self,second_id='2',date='2026/9/9 01:02:03'):
        return f'件数: 2\n\n===== 1 / 2 =====\n日時: {date}\nURL: https://x.com/niwakasumaho/status/1\n\n本文\n改行\n\n===== 2 / 2 =====\n日時: {date}\nURL: https://x.com/niwakasumaho/status/{second_id}\n\n\n'
    def test_parse_empty_and_multiline(self):
        rr,a=parse(self.source());self.assertTrue(a['pass']);self.assertEqual(a['empty_body'],1)
        self.assertEqual(rr[0]['text'],'本文\n改行')
    def test_duplicate_and_bad_date_fail(self):
        self.assertFalse(parse(self.source('1'))[1]['pass'])
        self.assertFalse(parse(self.source(date='invalid'))[1]['pass'])
    def test_malformed_fails(self):
        self.assertFalse(parse(self.source().replace('URL:','Link:',1))[1]['pass'])
        self.assertFalse(parse(self.source().replace(' / 2 =====',' / 9 ====='))[1]['pass'])
    def test_split_stable_and_order_independent(self):
        ids=[str(i) for i in range(100)]
        self.assertEqual({i:split_for(i) for i in ids},{i:split_for(i) for i in reversed(ids)})
        self.assertEqual(set(split_for(i) for i in ids),{'train','development','final'})


class BoundariesTests(unittest.TestCase):
    def test_runtime_markers(self):
        self.assertEqual(runtime(START+'\nR\n'+END+'\nSECRET MEMO'),'R')
        for bad in ['R',START+END+START,END+START]:
            with self.assertRaises(ValueError):runtime(bad)
    def test_github_style_source_contract(self):
        instructions=(SCRIPTS.parent/'GPTS_INSTRUCTIONS.md').read_text()
        body=runtime(instructions)
        for required in [
            'runtime_version: 1.1.0',
            'Gadget-Otaku/Bookmarklet',
            '`main` branch',
            '`writing-style/x/STYLE.md`',
            'https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/main/writing-style/x/STYLE.md',
            '`platform: "x"`',
            '`style_version:`',
            'アップロード済みKnowledge',
            '取得していない最新版を装わない',
            '「短い投稿」「投稿にして」という単数形は1候補の指定ではない',
            '欠けていればその回答を送信せず3候補を作り直す',
        ]:
            with self.subTest(required=required):self.assertIn(required,instructions if required.startswith('runtime_version:') else body)
        self.assertNotIn('Gadget-Otaku/dev',body)
    def test_prompt_does_not_include_answer_keys(self):
        p=build('STYLE',START+'RUNTIME'+END,[{'id':'D1','input':'INPUT','reference':'FORBIDDEN_REFERENCE','judge':'FORBIDDEN_JUDGE','constraints':{'secret':'FORBIDDEN_CONSTRAINT'}}])
        for s in ['FORBIDDEN_REFERENCE','FORBIDDEN_JUDGE','FORBIDDEN_CONSTRAINT']:self.assertNotIn(s,p)
        for s in ['STYLE','RUNTIME','INPUT']:self.assertIn(s,p)
    def test_mechanical(self):
        good='①\n動いた！\n\n②\nやっと直った\n\n③\nこれで使えるな'
        self.assertTrue(check(good)['pass'])
        self.assertFalse(check('以下です\n'+good)['pass'])
        self.assertFalse(check('①\n同じ\n\n②\n同じ\n\n③\n同じ')['pass'])
        self.assertFalse(check('①\n'+'a'*281+'\n\n②\n動いた\n\n③\n使える')['pass'])
        self.assertFalse(check(good,{'constraints':{'required_urls':['https://example.com']}})['pass'])
        self.assertFalse(check(good.replace('動いた！','文字数は20です'))['pass'])
    def test_cleanup(self):
        text='便利になった。\n\nhttps://\nexample.com/path\n…\nでも少し遅い。'
        result,category,_=clean(text)
        self.assertNotIn('example.com',result);self.assertIn('でも少し遅い。',result)
        self.assertEqual(category,'contextual_original')
        self.assertEqual(clean('https://example.com')[1],'media_only')
        self.assertEqual(clean('[本文なし / メディアのみ]')[:2],('', 'media_only'))
        self.assertEqual(clean('【チャレンジ回数を記入してください】')[1],'template_or_campaign')
    def test_neutral_overlap(self):
        self.assertTrue(overlaps('同じ日本語の長い文章をそのまま使います','同じ日本語の長い文章をそのまま使います'))
        self.assertFalse(overlaps('One Hand Operation+','One Hand Operation+'))
    def test_duplicate_protected_url_and_repeated_prose(self):
        url='https://example.com/'+'a'*120
        options=['接続方法を公開。'+url,'使い方はこちら。'+url,'設定手順をまとめた。'+url]
        output='\n\n'.join(n+'\n'+o for n,o in zip('①②③',options))
        self.assertTrue(check(output,{'constraints':{'required_urls':[url]}})['pass'])
        long='設定手順を確認してから保存し、元の画面へ戻って変更が反映されたかを確認する。'*2
        output='①\n'+long+'\n\n②\n'+long.replace('元の画面','前の画面')+'\n\n③\n保存できた'
        self.assertIn('obvious_duplicate',check(output)['failures'])
    def test_smoke_is_not_judge_score(self):
        result={'mechanical':check('①\n動いた！\n\n②\nやっと直った\n\n③\nこれで使えるな'),'judge':None}
        self.assertIsNone(aggregate([result])['mean_score'])
    def test_saved_answer_integrity(self):
        from run_codex_eval import invoke,digest,MODEL,configs
        with tempfile.TemporaryDirectory() as d:
            p=Path(d);answer='{}';(p/'answer.txt').write_text(answer)
            meta={'prompt_sha256':digest(b'prompt'),'answer_sha256':digest(answer.encode()),'model':MODEL,'reasoning':'high','flags':configs()}
            (p/'result.json').write_text(json.dumps(meta))
            self.assertEqual(invoke('prompt',p,{}),{})
            (p/'answer.txt').write_text('{"changed": true}')
            with self.assertRaisesRegex(RuntimeError,'answer hash'):invoke('prompt',p,{})
    def test_schema_files_match(self):
        import run_codex_eval as e
        for name,s in [('generation',e.GEN_SCHEMA),('judge',e.JUDGE_SCHEMA),('neutralization',e.NEUTRAL_SCHEMA)]:
            self.assertEqual(json.loads((SCRIPTS.parent/'eval/schemas'/f'{name}.json').read_text()),s)


if __name__=='__main__':unittest.main()
