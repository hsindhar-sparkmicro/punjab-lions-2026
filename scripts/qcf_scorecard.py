"""Parse a Cricket Quebec (QCF) CricClubs scorecard into one match record.

Input is the page text as captured for the 2026 season: the CricClubs "Full Scorecard"
page (and optionally its "Ball By Ball" page) printed to PDF from a browser and run
through `pdftotext -layout`. The same parser rebuilds the 2026 baselines from
punjab-lions-2026/matches/*.txt (see `update_2027.py selftest`).
"""
import re, subprocess, os

LIONS = 'Punjab Lions'
# CricClubs spellings -> names used on the site
CLEAN = {'Mohamad Vahora Vahora': 'Mohamad Vahora', 'Sujaan Singh Singh': 'Sujaan Singh',
         'Lakhwinder Singh Singh': 'Lakhwinder Singh', 'Raghav Tara Tara': 'Raghav Tara',
         'JASHAN LUBANA': 'Jashan Lubana', 'Xx Kashish': 'XX Kashish', 'Hamayun Afzal': 'Humayun Afzal'}
EXCLUDE = {'Abu Taher Arafat', 'Substitute', 'Sub'}   # not a Lions player (site rule)
DISM = re.compile(r'^(c\b|c&b|c & b|b\b|lbw|run out|st\b|St\b|not out|retired|hit wicket|obstruct|handled|timed out|absent|did not)', re.I)
NUM = r'(\d+(?:\.\d)?)'
EXTRAS = r'\(b (\d+) lb (\d+) w (\d+) nb (\d+)\s*(?:pen (\d+))?\s*\)\s+(\d+)'

def clean(n):
    n = re.sub(r'[\uf000-\uf8ff\u2060*†]', '', n).replace('\u00a0', ' ').strip()
    n = re.sub(r'\s+', ' ', n)
    return CLEAN.get(n, n)

def short(n):
    t = n.split()
    return ' '.join(t[:-1]) + ' ' + t[-1][0] if len(t) > 1 else n

def balls(o):
    o = str(o)
    if '.' in o:
        a, b = o.split('.'); return int(a) * 6 + int(b)
    return int(o) * 6

def read_any(path):
    """Text from a .txt, or a browser-printed .pdf via pdftotext -layout."""
    if path.lower().endswith('.pdf'):
        return subprocess.run(['pdftotext', '-layout', path, '-'], check=True, capture_output=True, text=True).stdout
    return open(path, encoding='utf-8').read()

def _innings_segments(sc):
    """Split scorecard text into [(team, text)] by the 'X innings (N overs maximum)' headers."""
    L = sc.split('\n'); segs = []; cur = None; buf = []
    for l in L:
        m = re.match(r'^\s*(.+?) innings\s*\((\d+) overs maximum\)', l)
        if m and (cur is None or m.group(1).strip() != cur[0]):
            if cur: segs.append((cur[0], cur[1], '\n'.join(buf)))
            cur = (m.group(1).strip(), int(m.group(2))); buf = []; continue
        m2 = re.match(r'^\s*(\S.*?) innings(?:\s{2,}\S.*)?\s*$', l)
        if m2 and cur and m2.group(1).strip() != cur[0] and not cur[0].endswith(m2.group(1).strip()) and 'Bowling' not in l and ' R B ' not in l and 'target' not in l:
            segs.append((cur[0], cur[1], '\n'.join(buf))); cur = (m2.group(1).strip(), cur[1]); buf = []; continue
        if cur: buf.append(l)
    if cur: segs.append((cur[0], cur[1], '\n'.join(buf)))
    return segs

def _batting(seg):
    L = seg.split('\n'); rows = {}; order = []
    stop = re.search(r'^\s*Extras\s*$', seg, re.M)
    for i, l in enumerate(L):
        s = l.strip()
        if s.startswith(('Extras', 'Bowling', 'Did not bat', 'Fall of Wickets')): break
        m = re.match(r'^(.*?\D)\s+(\d+)\s+(\d+)\s*(\d+)\s+(\d+)\s+(\d+\.\d\d|-)\s*$', s)
        if not m or 'innings' in s or re.search(r'\d\s*$', m.group(1)): continue
        pre = re.sub(r'[\uf000-\uf8ff]', '', m.group(1)).strip()
        parts = [p for p in re.split(r'\s{2,}', pre) if p.strip()]
        if len(parts) == 1 and not DISM.match(parts[0]):
            ms = re.search(r'(?<=\S)[*†]?\s+(?=(c |c&b|b |lbw|run out|st |St |not out|retired|hit wicket))', parts[0])
            if ms: parts = [parts[0][:ms.start()], parts[0][ms.end():]]
        if len(parts) >= 2 and not DISM.match(parts[0]):
            name, dis = parts[0], ' '.join(parts[1:])
        else:
            dis = ' '.join(parts); name = None
            # name printed on the line above ("Name   c X b Y") ...
            for j in range(i - 1, max(i - 3, -1), -1):
                pp = [p for p in re.split(r'\s{2,}', L[j].strip()) if p.strip()]
                if len(pp) >= 2 and not DISM.match(pp[0]) and not re.search(r'\d', L[j]) and 'innings' not in L[j]:
                    name = pp[0]; break
            # ... or on its own line just below / above the figures
            if not name:
                for j in list(range(i + 1, min(i + 4, len(L)))) + list(range(i - 1, max(i - 3, -1), -1)):
                    c = L[j].strip()
                    if len(c) >= 4 and ' ' in c and c != dis and not DISM.match(c) and not re.search(r'\d', c) and 'innings' not in c and c not in ('Extras', 'Total'):
                        name = c; break
        if not name: continue
        if re.search(r'\b(b|c|st|St)$', dis) or (re.search(r'^(c |run out|st |St )', dis) and dis.count('(') == dis.count(')') and re.search(r' b [A-Za-z]+$', dis)) or dis.count('(') > dis.count(')'):
            for j in range(i + 1, min(i + 3, len(L))):
                c = L[j].strip()
                if c and not re.search(r'\d', c) and not DISM.match(c) and len(c) <= 24 and clean(c) != clean(name):
                    dis = dis + ' ' + c; break
        name = clean(name)
        if name in rows: continue
        rows[name] = dict(r=int(m.group(2)), b=int(m.group(3)), f4=int(m.group(4)), s6=int(m.group(5)),
                          out=not re.match(r'^(not out|retired|absent|did not)', dis.strip(), re.I), dis=dis.strip())
        order.append(name)
    return rows

def _bowling(seg):
    rows = {}
    for l in seg.split('\n'):
        s = l.strip()
        m = re.match(r'^(.+?)\s+' + r'\s+'.join([NUM] * 5) + r'\s+([\d.]+)\s*(?:\((.*?)\))?\s*$', s)
        if not m or s.startswith('Bowling') or '(' in m.group(1): continue
        name = clean(m.group(1))
        if not re.search(r'[A-Za-z]', name) or name in rows: continue
        ex = m.group(8) or ''
        wd = re.search(r'(\d+)\s*w(?!k)', ex); nb = re.search(r'(\d+)\s*nb', ex)
        rows[name] = dict(balls=balls(m.group(2)), m=int(m.group(3)), dots=int(float(m.group(4))), r=int(m.group(5)), w=int(m.group(6)),
                          wd=int(wd.group(1)) if wd else 0, nb=int(nb.group(1)) if nb else 0)
    return rows

def _total(seg):
    m = re.search(r'\((\d+) wickets?, ([\d.]+) overs? \)\s+(\d+)', seg) or re.search(r'\((\d+) wickets?, ([\d.]+) overs?\)\s+(\d+)', seg)
    return dict(runs=int(m.group(3)), wk=int(m.group(1)), balls=balls(m.group(2))) if m else None

def _fow(seg):
    blk = seg.split('Fall of Wickets', 1)[1] if 'Fall of Wickets' in seg else ''
    out = []; last = 0
    for w, s, o in re.findall(r'(\d+)\s*-\s*(\d+)\s*,\s*Over\s*([\d.]+)', blk):
        w = int(w)
        if w != last + 1: break
        out.append(dict(wkt=w, score=int(s), over=o)); last = w
    return out

def _fielding(seg, roster_short, skip=()):
    """Credit Lions fielders from the dismissal text of the opposition's batting card."""
    F = {}
    def add(raw, k):
        raw = raw.replace('†', '').strip()
        n = roster_short.get(raw, raw)
        F.setdefault(n, dict(ct=0, wkct=0, st=0, ro=0))[k] += 1
    for name, r in _batting(seg).items():
        if name in skip: continue   # a Lions batting row duplicated into this card by the page render
        d = r['dis']
        m1 = re.match(r'^c\s*&\s*b\s+(.+)$', d); m2 = re.match(r'^c (.+?) b (.+)$', d)
        m3 = re.match(r'^run out \((.+)\)$', d); m4 = re.match(r'^[Ss]t (.+?) b ', d)
        if m1: add(m1.group(1), 'ct')
        elif m2: add(m2.group(1), 'wkct' if '†' in m2.group(1) else 'ct')
        elif m3:
            for x in m3.group(1).split('/'): add(x, 'ro')
        elif m4: add(m4.group(1), 'st')
    return F

def _over_summaries(bbb):
    """Per innings (page order), {over: (score, wkts)} from the ball-by-ball 'Over N (x Runs)' summaries
    (same reading as analysis/parse.py: a new innings starts when the over number resets)."""
    L = [l for l in bbb.replace('\f', '\n').split('\n') if l.strip()]; inns = [[]]  # PDF text has page breaks and blank lines
    for i, l in enumerate(L):
        mo = re.match(r'^\s*Over (\d+) \((\d+) Runs?\)', l)
        if not mo: continue
        for j in range(i + 1, min(i + 14, len(L))):
            ms = re.match(r'^\s*(\d+)/(\d+)\s*$', L[j])
            if ms:
                o = (int(mo.group(1)), int(ms.group(1)), int(ms.group(2)))
                if inns[-1] and o[0] <= inns[-1][-1][0]: inns.append([])
                inns[-1].append(o); break
    return [{o: (sc, w) for o, sc, w in x} for x in inns if x]

def parse(sc, bbb='', meta=None, roster=()):
    """sc: scorecard text; bbb: ball-by-ball text ('' if not captured); meta: dict overrides.
    roster: CricClubs names of Lions players (for short-name fielding credit)."""
    meta = dict(meta or {})
    sc = sc.replace('\u2060', '').replace('\u00a0', ' ')
    mi = re.search(r'^.*? innings \(\d+ overs maximum\)', sc, re.M)
    head = sc[:mi.start()] if mi else sc.split('Info', 1)[0]
    ms0 = re.search(r'^\s*(?:League|Quarter Final|Semi Final|Final|Super League|Eliminator|Qualifier)\s+\d\d/\d\d/\d{4}', head, re.M)
    if 'title' not in meta:
        # browser-printed pages carry the site menu (series names) first; the match title is the last "20xx ..." line before the stage/date line
        tl = re.findall(r'^\s*(20\d\d .+?)\s*$', head[:ms0.start()] if ms0 else head, re.M); meta['title'] = tl[-1] if tl else ''
    if 'stage' not in meta:
        ms = re.search(r'^\s*(League|Quarter Final|Semi Final|Final|Super League|Eliminator|Qualifier)\s+(\d\d/\d\d/\d{4})', head, re.M)
        if ms: meta['stage'] = ms.group(1); mm, dd, yy = ms.group(2).split('/'); meta.setdefault('date', f'{yy}-{mm}-{dd}')
    if 'result' not in meta:
        mr = re.search(r'^\s*(.+?(?:won by .+|Tie|No Result|abandoned.*))\s*$', head, re.M | re.I); meta['result'] = mr.group(1).strip() if mr else ''
    res = meta['result']
    meta['res'] = 'W' if res.startswith(LIONS + ' won') else 'T' if re.search(r'\btie\b', res, re.I) else 'NR' if re.search(r'no result|abandon', res, re.I) else 'L'
    meta['ko'] = meta.get('stage', 'League') not in ('League', 'Super League')
    rshort = {}
    for n in roster:
        rshort[short(n)] = clean(n)
    rshort.update({'Hamayun A': 'Humayun Afzal', 'Humayun A': 'Humayun Afzal', 'JASHAN L': 'Jashan Lubana', 'Xx K': 'XX Kashish', 'Mohamad Vahor': 'Mohamad Vahora'})
    segs = _innings_segments(sc)
    if 'fmt' not in meta:
        mo = re.search(r'innings \((\d+) overs maximum\)', sc)
        meta['fmt'] = 'T20' if re.search(r'\bT20\b', meta.get('title', '')) or (mo and int(mo.group(1)) <= 20) else 'LONG'
    rec = dict(meta=meta, lionsBat=None, lionsBowl=None, players={})
    P = rec['players']
    def pl(n): return P.setdefault(n, dict(bat=None, bowl=None, fld=dict(ct=0, wkct=0, st=0, ro=0)))
    overs = _over_summaries(bbb) if bbb else []
    lions_batters = set()
    for team, maxo, seg in segs:
        if team == LIONS: lions_batters |= set(_batting(seg))
    for idx, (team, maxo, seg) in enumerate(segs):
        tot = _total(seg); fow = _fow(seg)
        at = overs[idx] if idx < len(overs) else {}
        if team == LIONS:
            bat = _batting(seg)
            for n, r in bat.items():
                if n in EXCLUDE: continue
                pl(n)['bat'] = r
            md = re.search(r'Did not bat:(.*?)(?:\n\s*Bowling|\n\s*Fall of)', seg, re.S)
            if md:
                for n in re.split(r',', re.sub(r'\s+', ' ', md.group(1))):
                    n = clean(n)
                    if n and n not in EXCLUDE and re.search(r'[A-Za-z]', n): pl(n)
            exb = re.search(EXTRAS, seg)
            rec['lionsBat'] = dict(total=tot, extras=int(exb.group(6)) if exb else None, batRuns=sum(r['r'] for r in bat.values()), maxOvers=maxo, ppWk=sum(1 for f in fow if int(f['over'].split('.')[0]) < 6),
                                   allOut=bool(tot and (tot['wk'] >= 10 or (tot['wk'] >= len(bat) - 1 and not re.search(r'Did not bat:\s*\S', seg) and tot['balls'] < maxo * 6))),
                                   batters=len(bat))
        else:
            bw = _bowling(seg)
            for n, r in bw.items():
                if n in EXCLUDE: continue
                pl(n)['bowl'] = r
            for n, f in _fielding(seg, rshort, lions_batters).items():
                if n in EXCLUDE: continue
                for k, v in f.items(): pl(n)['fld'][k] += v
            ex = re.search(EXTRAS, seg)
            # runs conceded in overs 1-6: score at the end of over 6 (innings that lasted 6 overs and have a ball-by-ball)
            pp_runs = at[6][0] if 6 in at else None
            rec['lionsBowl'] = dict(total=tot, maxOvers=maxo, extras=dict(zip(['b', 'lb', 'w', 'nb', 'pen', 'all'], [int(x or 0) for x in ex.groups()])) if ex else None,
                                    balls=sum(r['balls'] for r in bw.values()), wides=sum(r['wd'] for r in bw.values()), nb=sum(r['nb'] for r in bw.values()),
                                    ppRuns=pp_runs)
    return rec
