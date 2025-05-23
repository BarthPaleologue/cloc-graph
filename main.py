#!/usr/bin/env python3
import argparse
import subprocess
import csv
import json
import os
from git import Repo
from datetime import datetime
import matplotlib.pyplot as plt

# Arg parsing
def parse_args():
    p = argparse.ArgumentParser(
        description='Track lines of code over time by language with granularity, top-N, and repo path.'
    )
    p.add_argument(
        '-p', '--path', default='.',
        help='Path to the Git repository (default: current dir)'
    )
    p.add_argument(
        '-s', '--step', type=int, default=1,
        help='Sample every Nth commit (default: 1)'
    )
    p.add_argument(
        '-g', '--granularity', choices=['commits','daily','weekly'],
        default='commits',
        help='Granularity: commits | daily | weekly (default: commits)'
    )
    p.add_argument(
        '-t', '--top', type=int, default=0,
        help='Limit to top N languages by total lines (default: all)'
    )
    return p.parse_args()


def main():
    args = parse_args()

    # Ensure cloc runs in the target repo
    os.chdir(args.path)
    repo = Repo('.')

    seen = set()
    records = []
    langs = set()

    # Iterate commits oldest→newest
    for idx, commit in enumerate(repo.iter_commits('HEAD', reverse=True), 1):
        if args.granularity == 'commits' and (idx % args.step) != 0:
            continue
        date_dt = datetime.fromtimestamp(commit.committed_date)
        date_str = date_dt.strftime('%Y-%m-%d')
        if args.granularity == 'daily':
            key = date_str
        elif args.granularity == 'weekly':
            iso = date_dt.isocalendar()
            key = f"{iso[0]}-{iso[1]:02d}"
        else:
            key = f"commit_{idx}"
        if key in seen:
            continue
        seen.add(key)

        # cloc JSON
        try:
            out = subprocess.check_output([
                'cloc', '--quiet', '--json', '--git', commit.hexsha
            ], text=True)
            data = json.loads(out)
        except Exception:
            data = {}

        rec = {'date': date_str}
        for lang, stats in data.items():
            if lang == 'SUM':
                continue
            rec[lang] = stats.get('code', 0)
            langs.add(lang)
        records.append(rec)

    # Determine top-N
    lang_totals = {l: sum(r.get(l, 0) for r in records) for l in langs}
    sorted_langs = sorted(langs, key=lambda l: lang_totals[l], reverse=True)
    filtered = sorted_langs[:args.top] if args.top>0 else sorted(sorted_langs)

    # Write CSV
    out_csv = 'loc_over_time_by_lang.csv'
    header = ['date'] + filtered
    with open(out_csv, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for r in records:
            writer.writerow([r.get('date')] + [r.get(l, 0) for l in filtered])

    print(f"Wrote {out_csv} ({len(records)} rows, top {len(filtered)} langs) from '{args.path}'")

    # Plot
    dates = [datetime.strptime(r['date'], '%Y-%m-%d') for r in records]
    for l in filtered:
        vals = [r.get(l,0) for r in records]
        plt.plot(dates, vals, label=l)
    plt.xlabel('Date')
    plt.ylabel('Lines of Code')
    plt.title('LOC Over Time by Language')
    plt.legend()
    plt.tight_layout()
    plt.show()


if __name__ == '__main__':
    main()