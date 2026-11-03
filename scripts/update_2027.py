#!/usr/bin/env python3
"""Punjab Lions 2027 goal markers: add QCF CricClubs scorecards (club 1834) and recompute.

  python3 scripts/update_2027.py add  --sc <scorecard.pdf|txt> [--bbb <ball-by-ball.pdf|txt>] [--id MATCHID] [--stage League] [--fmt T20|LONG] [--opp NAME]
  python3 scripts/update_2027.py fetch --id MATCHID      # tries CricClubs directly; reports a Cloudflare block
  python3 scripts/update_2027.py rebuild                 # recompute data2027.js from data/matches_2027.json
  python3 scripts/update_2027.py remove --id MATCHID     # drop a match that was added by mistake
  python3 scripts/update_2027.py list
  python3 scripts/update_2027.py selftest [--matches DIR] # re-parse the 2026 scorecards; must reproduce the 2026 baselines

Inputs: the CricClubs "Full Scorecard" page (and its "Ball By Ball" page, needed for the new-ball economy marker),
printed to PDF from a browser (viewScorecard.do?matchId=N&clubId=1834 / ballbyball.do?...), or their `pdftotext -layout` text.
Writes data/matches_2027.json (one parsed record per match) and data2027.js (window.PL_2027, read by the site).
It never commits or pushes; it prints the git commands to publish.
"""
import argparse, json, os, re, sys, glob, datetime, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import qcf_scorecard as Q

MATCHES = os.path.join(ROOT, 'data', 'matches_2027.json')
TARGETS = os.path.join(ROOT, 'data', 'targets_2027.json')
OUTJS = os.path.join(ROOT, 'data2027.js')
BIG2 = ('Abhinav Singh', 'Harsimranjit Singh Sindhar')
SEASON_INNINGS_2026 = 31          # pace for count goals: to-date per match x 31 (the 2026 season)
SC_URL = 'https://cricclubs.com/QCF/viewScorecard.do?matchId={}&clubId=1834'
BB_URL = 'https://cricclubs.com/QCF/ballbyball.do?matchId={}&clubId=1834'

def load(p, d=None):
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else d

def roster():
    T = load(TARGETS, {'players': []})
    names = [p['name'] for p in T['players']]
    raw = {'Mohamad Vahora': 'Mohamad Vahora Vahora', 'Sujaan Singh': 'Sujaan Singh Singh', 'Lakhwinder Singh': 'Lakhwinder Singh Singh',
           'Raghav Tara': 'Raghav Tara Tara', 'Humayun Afzal': 'Hamayun Afzal', 'XX Kashish': 'Xx Kashish', 'Jashan Lubana': 'JASHAN LUBANA'}
    return names + [raw[n] for n in names if n in raw]

# ---------------------------------------------------------------- team metrics
def team_values(recs):
    """Current value of every team goal metric over the given match records (None = no data yet)."""
    n = len(recs)
    t20b = [r['lionsBat'] for r in recs if r['meta']['fmt'] == 'T20' and r.get('lionsBat')]
    pp = [r['lionsBowl']['ppRuns'] for r in recs if r['meta']['fmt'] == 'T20' and r.get('lionsBowl') and r['lionsBowl'].get('ppRuns') is not None]
    balls = sum(r['lionsBowl']['balls'] for r in recs if r.get('lionsBowl')); wides = sum(r['lionsBowl']['wides'] for r in recs if r.get('lionsBowl'))
    fif = sum(1 for r in recs for nm, p in r['players'].items() if nm not in BIG2 and p['bat'] and p['bat']['r'] >= 50)
    allout = sum(1 for r in recs if r.get('lionsBat') and r['lionsBat']['allOut'])
    ducks = sum(1 for r in recs for p in r['players'].values() if p['bat'] and p['bat']['r'] == 0 and p['bat']['out'])
    kos = [r for r in recs if r['meta']['ko']]
    ko_ok = sum(1 for r in kos if sum(1 for nm, p in r['players'].items() if nm not in BIG2 and p['bowl'] and p['bowl']['w'] > 0) >= 2)
    pace = lambda c: c / n * SEASON_INNINGS_2026 if n else None
    return {
        'ppwk': (sum(b['ppWk'] for b in t20b) / len(t20b), f"{sum(b['ppWk'] for b in t20b)} in {len(t20b)} T20 innings") if t20b else (None, 'no T20 innings yet'),
        'fifties_others': (pace(fif), f'{fif} in {n} matches') if n else (None, ''),
        'allouts': (pace(allout), f'{allout} in {n} innings') if n else (None, ''),
        'ducks': (pace(ducks), f'{ducks} in {n} matches') if n else (None, ''),
        'wides_po': (wides / (balls / 6), f'{wides} in {balls // 6}.{balls % 6} overs') if balls else (None, ''),
        'ppecon': (sum(pp) / (6 * len(pp)), f'{sum(pp)} runs in {len(pp)} T20 powerplays') if pp else (None, 'no T20 powerplay yet'),
        'ko_others': (ko_ok / len(kos), f'{ko_ok} of {len(kos)} knockouts') if kos else (None, 'no knockouts yet'),
    }

# ---------------------------------------------------------------- player metrics
def player_values(recs, name):
    a = dict(apps=0, r=0, b=0, out=0, f50=0, w=0, bb=0, rc=0, wd=0, dis=0, r20=0, b20=0, bb20=0, rc20=0)
    for r in recs:
        p = r['players'].get(name)
        if not p: continue
        t20 = r['meta']['fmt'] == 'T20'; a['apps'] += 1
        if p['bat']:
            x = p['bat']; a['r'] += x['r']; a['b'] += x['b']; a['out'] += x['out']; a['f50'] += x['r'] >= 50
            if t20: a['r20'] += x['r']; a['b20'] += x['b']
        if p['bowl']:
            x = p['bowl']; a['w'] += x['w']; a['bb'] += x['balls']; a['rc'] += x['r']; a['wd'] += x['wd']
            if t20: a['bb20'] += x['balls']; a['rc20'] += x['r']
        a['dis'] += sum(p['fld'].values())
    return a

def player_metric(a, metric, apps2026):
    """(value, detail); counts are paced to the player's 2026 match count."""
    if not a['apps']: return None, 'not played yet'
    pace = lambda c: c / a['apps'] * apps2026
    ov = lambda b: f'{b // 6}.{b % 6}'
    M = {
        'runs': lambda: (pace(a['r']), f"{a['r']} in {a['apps']} matches"),
        'wkts': lambda: (pace(a['w']), f"{a['w']} in {a['apps']} matches"),
        'fifties': lambda: (pace(a['f50']), f"{a['f50']} in {a['apps']} matches"),
        'wides': lambda: (pace(a['wd']), f"{a['wd']} in {a['apps']} matches") if a['bb'] else (None, 'no overs yet'),
        'apps': lambda: (a['apps'], f"{a['apps']} played"),
        'sr': lambda: (100 * a['r'] / a['b'], f"{a['r']} off {a['b']}") if a['b'] else (None, 'no balls faced yet'),
        'sr_t20': lambda: (100 * a['r20'] / a['b20'], f"{a['r20']} off {a['b20']} in T20") if a['b20'] else (None, 'no T20 balls faced yet'),
        'econ': lambda: (6 * a['rc'] / a['bb'], f"{a['rc']} off {ov(a['bb'])} overs") if a['bb'] else (None, 'no overs yet'),
        'econ_t20': lambda: (6 * a['rc20'] / a['bb20'], f"{a['rc20']} off {ov(a['bb20'])} T20 overs") if a['bb20'] else (None, 'no T20 overs yet'),
        'wd_po': lambda: (6 * a['wd'] / a['bb'], f"{a['wd']} in {ov(a['bb'])} overs") if a['bb'] else (None, 'no overs yet'),
        'dis_pm': lambda: (a['dis'] / a['apps'], f"{a['dis']} in {a['apps']} matches"),
    }
    return M[metric]()

# ---------------------------------------------------------------- progress + deltas
def progress(v, base, target, lower):
    """0..1; the 2026 baseline sits at 0.5 and the 2027 target at 1."""
    if v is None: return None
    ref = 2 * base - target
    if ref == target: return 1.0 if (v <= target if lower else v >= target) else 0.5
    p = (ref - v) / (ref - target) if lower else (v - ref) / (target - ref)
    return max(0.0, min(1.0, p))

def marker(g, cur, prev, last):
    v, det = cur; pv = prev[0]
    keep = g.get('keep') and g['base'] == g['target']
    base, target = g['base'], g['target']
    if keep:   # "keep it up" goals: target = 2026 level; scale so the baseline is the target flag
        target = base * (0.9 if g['lower'] else 1.1); base_p = 1.0
    p = progress(v, base, target, g['lower']); pp = progress(pv, base, target, g['lower']) if pv is not None else progress(g['base'], base, target, g['lower'])
    m = dict(value=None if v is None else round(v, 3), detail=det, progress=round(p if p is not None else progress(g['base'], base, target, g['lower']), 4),
             baseProgress=round(progress(g['base'], base, target, g['lower']), 4), started=v is not None)
    if keep: m['progress'] = round(min(1.0, (v / g['base'] if not g['lower'] else g['base'] / v) if v else 1.0), 4) if v is not None else 1.0; m['baseProgress'] = 1.0
    if last and v is not None:
        before = pv if pv is not None else g['base']
        if abs(v - before) < 1e-9: m['delta'] = dict(dir='=', toward=None, vs=last)
        else:
            up = v > before
            m['delta'] = dict(dir='▲' if up else '▼', toward=(not up) if g['lower'] else up, vs=last, change=round(v - before, 3))
    return m

def compute():
    T = load(TARGETS); Mx = load(MATCHES)
    recs = sorted(Mx['matches'], key=lambda r: (r['meta'].get('date', ''), str(r['meta'].get('id'))))
    last = recs[-1] if recs else None
    lastv = (last['meta'].get('opp') or 'last match') if last else None
    tv, tp = team_values(recs), team_values(recs[:-1]) if len(recs) > 1 else {k: (None, '') for k in team_values([])}
    team = []
    for g in T['team']:
        m = marker(g, tv[g['key']], tp[g['key']], lastv); m.update({k: g[k] for k in g}); team.append(m)
    season = load(os.path.join(ROOT, 'data', 'apps_2026.json'), {})
    players = {}
    for P in T['players']:
        n = P['name']; a, ap = player_values(recs, n), player_values(recs[:-1], n)
        played_last = bool(last and n in last['players'])
        ms = []
        for g in P['targets']:
            apps26 = season.get(n, 1)
            cur = player_metric(a, g['metric'], apps26); prv = player_metric(ap, g['metric'], apps26)
            m = marker(g, cur, prv, lastv if played_last else None); m.update(g); ms.append(m)
        players[n] = dict(strengths=P['strengths'], workons=P['workons'], targets=ms, apps2027=a['apps'])
    out = dict(season=T['season'], clubId=T['clubId'], generated=datetime.datetime.now().astimezone().isoformat(timespec='minutes'),
               played=len(recs), note=T.get('baselineNote', ''),
               matches=[dict(id=r['meta'].get('id'), date=r['meta'].get('date'), opp=r['meta'].get('opp'), stage=r['meta'].get('stage'), fmt=r['meta']['fmt'], res=r['meta']['res'],
                             result=r['meta'].get('result'), url=SC_URL.format(r['meta'].get('id'))) for r in recs],
               team=team, players=players)
    open(OUTJS, 'w', encoding='utf-8').write('/* generated by scripts/update_2027.py; do not edit by hand */\nwindow.PL_2027=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    return out

# ---------------------------------------------------------------- commands
def split_capture(text):
    """A saved file may hold the scorecard and ball-by-ball together (2026 .txt format) or just one page."""
    if '===== FULL SCORECARD' in text:
        head, _, rest = text.partition('===== FULL SCORECARD'); sc, _, bbb = rest.partition('===== BALL BY BALL')
        meta = {k.strip(): v.strip() for k, v in re.findall(r'^([A-Za-z\- ]+):\s*(.*)$', head, re.M)}
        return sc, bbb, meta
    return text, '', {}

def cmd_add(a):
    sc, bbb, hm = split_capture(Q.read_any(a.sc))
    if a.bbb: bbb = Q.read_any(a.bbb)
    mid = a.id or hm.get('MatchId') or (re.search(r'(\d{4,})', os.path.basename(a.sc)) or [None, None])[1]
    if not mid: sys.exit('Need --id MATCHID (not found in the file name).')
    if 'Punjab Lions' not in sc: sys.exit('This does not look like a Punjab Lions scorecard (no "Punjab Lions" in the text).')
    if re.search(r'Just a moment|Cloudflare|cf-chl', sc): sys.exit('The file is a Cloudflare challenge page, not a scorecard. Print the page again once it has loaded.')
    meta = dict(id=str(mid))
    if hm.get('Competition'):
        comp, stage = [x.strip() for x in hm['Competition'].split('/')]; meta.update(comp=comp, stage=stage, fmt='T20' if 't20' in comp.lower() else 'LONG')
    for k in ('stage', 'fmt', 'opp', 'date'):
        if getattr(a, k, None): meta[k] = getattr(a, k)
    if hm.get('Opponent'): meta.setdefault('opp', hm['Opponent'])
    if hm.get('Result'): meta['result'] = hm['Result']
    rec = Q.parse(sc, bbb, meta, roster())
    if not rec.get('lionsBat') and not rec.get('lionsBowl'): sys.exit('Could not find either innings in the scorecard text.')
    if 'opp' not in rec['meta']:
        teams = [t.strip() for t in re.findall(r'^\s*(\S.*?) innings\b(?! R B)', sc, re.M) if t.strip() != Q.LIONS and Q.LIONS not in t]
        rec['meta']['opp'] = teams[0].strip() if teams else '?'
    if not str(rec['meta'].get('date', '')).startswith('2027') and not a.force:
        sys.exit(f"Match date {rec['meta'].get('date')} is not in 2027; refusing to add it (use --force to override).")
    if not bbb: print('note: no ball-by-ball given, so the new-ball economy marker skips this match.')
    M = load(MATCHES)
    for r in M['matches']:
        if str(r['meta'].get('id')) != str(mid) and r.get('lionsBat') == rec.get('lionsBat') and r.get('lionsBowl') == rec.get('lionsBowl') and not a.force:
            sys.exit(f"This scorecard looks identical to match {r['meta'].get('id')} already in the file; not adding it twice (use --force to override).")
    M['matches'] = [r for r in M['matches'] if str(r['meta'].get('id')) != str(mid)] + [rec]
    json.dump(M, open(MATCHES, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    lb, lw = rec.get('lionsBat') or {}, rec.get('lionsBowl') or {}
    print(f"added {mid}: {rec['meta'].get('date')} v {rec['meta']['opp']} ({rec['meta'].get('stage', 'League')}, {rec['meta']['fmt']}) {rec['meta']['res']}"
          f" | Lions {lb.get('total')} | opp {lw.get('total')} | players {len(rec['players'])}")
    report(compute())

def cmd_fetch(a):
    import urllib.request
    for url in (SC_URL.format(a.id), BB_URL.format(a.id)):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            body = urllib.request.urlopen(req, timeout=20).read().decode('utf-8', 'replace'); code = 200
        except Exception as e:
            body = getattr(e, 'read', lambda: b'')().decode('utf-8', 'replace') if hasattr(e, 'read') else ''; code = getattr(e, 'code', str(e))
        if re.search(r'Just a moment|cf-chl|challenge-platform', body) or code == 403:
            print(f'{url}\n  blocked: CricClubs answers scripts with a Cloudflare challenge (HTTP {code}).')
        else:
            p = os.path.join(ROOT, 'data', 'raw', f'{a.id}_{"sc" if "viewScorecard" in url else "bb"}.html'); os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, 'w').write(body); print(f'{url}\n  HTTP {code}, saved {p}')
    print('\nThe parser reads the browser-printed pages. Open both URLs above in a browser, print each to PDF, then run:\n'
          f'  python3 scripts/update_2027.py add --sc <scorecard.pdf> --bbb <ballbyball.pdf> --id {a.id}')

def report(out):
    print(f"\n{out['played']} match(es) in 2027. Team markers:")
    for m in out['team']:
        d = m.get('delta'); ds = f" {d['dir']} {'toward' if d['toward'] else 'away from' if d['toward'] is False else 'no change to'} target after v {d['vs']}" if d else ''
        print(f"  {m['label']:<52} 2026 {m['base']:<6} 2027 {m['value'] if m['value'] is not None else '–':<8} target {m['target']:<5} fill {m['progress']:.2f}{ds}")
    print(f'\nWrote {os.path.relpath(MATCHES, ROOT)} and {os.path.relpath(OUTJS, ROOT)}. Nothing was committed. To publish:\n'
          '  git add data/matches_2027.json data2027.js && git commit -m "2027: add match <id>" && git push origin main')

def cmd_selftest(a):
    files = sorted(glob.glob(os.path.join(a.matches, '*.txt')))
    recs = []
    for f in files:
        sc, bbb, hm = split_capture(open(f, encoding='utf-8').read())
        comp, stage = [x.strip() for x in hm['Competition'].split('/')]
        recs.append(Q.parse(sc, bbb, dict(id=hm['MatchId'], date=hm['Date'], opp=hm['Opponent'], result=hm['Result'], stage=stage, comp=comp,
                                          fmt='T20' if 't20' in comp else 'LONG'), roster()))
    tv = team_values(recs); T = load(TARGETS); ok = True
    exp = dict(ppwk=1.93, fifties_others=3, allouts=11, ducks=27, wides_po=0.50, ppecon=7.54, ko_others=0.4)
    print(f'{len(recs)} scorecards parsed')
    for g in T['team']:
        v = tv[g['key']][0]; v = v * len(recs) / SEASON_INNINGS_2026 if g.get('count') else v   # counts: undo pacing
        good = abs(v - exp[g['key']]) < 0.006
        ok &= good; print(f"  {'ok ' if good else 'BAD'} {g['label']:<52} parsed {v:.3f}  baseline {exp[g['key']]}  ({tv[g['key']][1]})")
    apps = {}
    for P in T['players']:
        n = P['name']; pa = player_values(recs, n); apps[n] = pa['apps']
        for g in P['targets']:
            if g['metric'] in ('apps', 'dis_pm'): continue   # season tables count one more match than the scorecards hold
            v, _ = player_metric(pa, g['metric'], pa['apps'])
            if v is None or abs(v - g['base']) > max(0.011, 0.006 * abs(g['base'])):
                ok = False; print(f'  BAD {n} {g["metric"]}: parsed {v} vs base {g["base"]}')
    print('selftest', 'PASSED' if ok else 'FAILED'); sys.exit(0 if ok else 1)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter); sp = ap.add_subparsers(dest='cmd', required=True)
    x = sp.add_parser('add'); x.add_argument('--sc', required=True); x.add_argument('--bbb'); x.add_argument('--id'); x.add_argument('--stage'); x.add_argument('--fmt', choices=['T20', 'LONG'])
    x.add_argument('--opp'); x.add_argument('--date'); x.add_argument('--force', action='store_true')
    x = sp.add_parser('fetch'); x.add_argument('--id', required=True)
    sp.add_parser('rebuild'); sp.add_parser('list')
    x = sp.add_parser('remove'); x.add_argument('--id', required=True)
    x = sp.add_parser('selftest'); x.add_argument('--matches', default=os.environ.get('PL_2026_MATCHES', '/workspace/cricket/punjab-lions-2026/matches'))
    a = ap.parse_args()
    if a.cmd == 'add': cmd_add(a)
    elif a.cmd == 'fetch': cmd_fetch(a)
    elif a.cmd == 'rebuild': report(compute())
    elif a.cmd == 'list':
        for r in load(MATCHES)['matches']: print(r['meta'].get('id'), r['meta'].get('date'), r['meta'].get('opp'), r['meta'].get('stage'), r['meta']['fmt'], r['meta']['res'])
    elif a.cmd == 'remove':
        M = load(MATCHES); n0 = len(M['matches']); M['matches'] = [r for r in M['matches'] if str(r['meta'].get('id')) != a.id]
        json.dump(M, open(MATCHES, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); print(f'removed {n0 - len(M["matches"])}'); report(compute())
    elif a.cmd == 'selftest': cmd_selftest(a)

if __name__ == '__main__':
    main()
