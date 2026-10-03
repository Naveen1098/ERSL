"""Fetch publications from a Google Scholar profile and write public/publications.json.

Usage: SCHOLAR_ID=xxxxxxxxxxxx python scripts/fetch_scholar.py
If Scholar blocks the request, the existing publications.json is left untouched.
"""
import json
import os
import sys

from scholarly import scholarly

scholar_id = os.environ.get("SCHOLAR_ID", "GN_fGecAAAAJ").strip()
if not scholar_id:
    print("SCHOLAR_ID not set; skipping.")
    sys.exit(0)

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "publications.json")

try:
    author = scholarly.search_author_id(scholar_id)
    author = scholarly.fill(author, sections=["publications"])
    pubs = []
    for i, p in enumerate(author.get("publications", [])):
        p = scholarly.fill(p)
        bib = p.get("bib", {})
        venue = bib.get("journal") or bib.get("conference") or bib.get("venue") or bib.get("publisher") or ""
        try:
            year = int(bib.get("pub_year", 0))
        except ValueError:
            year = 0
        kind = "Conference" if bib.get("conference") else "Peer-Reviewed Article"
        pubs.append({
            "id": f"scholar-{i}",
            "title": bib.get("title", ""),
            "authors": bib.get("author", "").replace(" and ", ", "),
            "venue": venue,
            "year": year,
            "type": kind,
            "link": p.get("pub_url", ""),
            "abstract": bib.get("abstract", ""),
        })
    if pubs:
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump(pubs, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(pubs)} publications.")
    else:
        print("No publications returned; keeping existing file.")
except Exception as e:  # network/blocked
    print(f"Scholar fetch failed ({e}); keeping existing file.")
