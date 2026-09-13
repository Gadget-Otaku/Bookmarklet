"""User's conservative 280-unit contract, not a claim of twitter-text equivalence.

ASCII/half-width = 1, other characters = 2; emoji sequences = 2; URL = 23.
NFC normalization, CRLF -> LF. Includes ZWJ, modifier, flag, keycap/tag emoji.
HTTP(S) URLs must be explicit; bare domains are intentionally not recognized.
"""
import argparse
import re
import unicodedata

URL_RE = re.compile(r'https?://[^\s<>"「」『』【】（）]+', re.I)


def urls(text):
    result=[]
    for m in URL_RE.finditer(text):
        value=m[0].rstrip('.,!?:;。！？、')
        while value.endswith(')') and value.count(')')>value.count('('): value=value[:-1]
        while value.endswith(']') and value.count(']')>value.count('['): value=value[:-1]
        if value not in ('http://','https://'): result.append((m.start(),m.start()+len(value),value))
    return result


def emoji_base(ch):
    cp=ord(ch)
    return (0x1F000<=cp<=0x1FAFF or 0x2600<=cp<=0x27BF or cp in (0xA9,0xAE,0x203C,0x2049,0x2122,0x2139,0x3030,0x303D,0x3297,0x3299) or 0x2194<=cp<=0x21FF or 0x2300<=cp<=0x23FF or 0x2B00<=cp<=0x2BFF)


def plain_weight(text):
    i=total=0
    while i<len(text):
        ch=text[i]; cp=ord(ch)
        if ch in '#*0123456789' and (text[i+1:i+2]=='\u20e3' or text[i+1:i+3]=='\ufe0f\u20e3'):
            i+=2 if text[i+1:i+2]=='\u20e3' else 3; total+=2; continue
        if emoji_base(ch):
            i+=1
            if 0x1F1E6<=cp<=0x1F1FF and i<len(text) and 0x1F1E6<=ord(text[i])<=0x1F1FF: i+=1
            while i<len(text):
                n=ord(text[i])
                if n in (0xFE0F,0xFE0E) or 0x1F3FB<=n<=0x1F3FF or 0xE0020<=n<=0xE007F: i+=1
                elif text[i]=='\u200d' and i+1<len(text) and emoji_base(text[i+1]): i+=2
                else: break
            total+=2; continue
        total+=1 if cp<128 or unicodedata.east_asian_width(ch)=='H' else 2
        i+=1
    return total


def count(text):
    text=unicodedata.normalize('NFC',text.replace('\r\n','\n'))
    total=last=0
    for start,end,_ in urls(text):
        total+=plain_weight(text[last:start])+23; last=end
    return total+plain_weight(text[last:])


if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('text'); args=ap.parse_args(); print(count(args.text))
