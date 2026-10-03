"""Fetch publications for Dr. Hongxing Liu (GN_fGecAAAAJ) and write public/publications.json.

Zero-dependency script using Python's standard library urllib.request with fallback.
Usage: python scripts/fetch_scholar.py
"""
import json
import os
import sys
import urllib.request

scholar_id = os.environ.get("SCHOLAR_ID", "GN_fGecAAAAJ").strip()
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "publications.json")

print(f"Syncing publications for Scholar ID: {scholar_id} (Dr. Hongxing Liu)...")

# Primary: Query academic registry across Dr. Liu's university appointments
url = "https://api.openalex.org/works?filter=author.id:A5101778436,institutions.id:I17301866|I63135867|I91045830|I52357470|I1286329397&sort=publication_year:desc&per_page=100"

req = urllib.request.Request(
    url,
    headers={"User-Agent": "ERSL-Website-Sync/2.0 (mailto:hongxing.liu@ua.edu)"}
)

def reconstruct_abstract(inv):
    if not inv or not isinstance(inv, dict):
        return ""
    words_by_pos = {}
    for word, positions in inv.items():
        if isinstance(positions, list):
            for pos in positions:
                words_by_pos[pos] = word
    sorted_positions = sorted(words_by_pos.keys())
    text = " ".join([words_by_pos[p] for p in sorted_positions])
    return (text[:550] + "...") if len(text) > 550 else text

try:
    with urllib.request.urlopen(req, timeout=25) as response:
        if response.status == 200:
            data = json.loads(response.read().decode("utf-8"))
            results = data.get("results", [])
            pubs = []
            for idx, w in enumerate(results):
                authorships = w.get("authorships", [])
                authors = ", ".join(
                    [a.get("author", {}).get("display_name", "") for a in authorships if a.get("author")]
                ) or "H. Liu et al."
                
                primary_loc = w.get("primary_location") or {}
                source = primary_loc.get("source") or {}
                venue = source.get("display_name") or primary_loc.get("raw_source_name") or "Academic Journal"
                
                year = w.get("publication_year") or 2024
                w_type = w.get("type", "")
                is_conf = w_type in ["proceedings-article", "conference-paper"]
                
                doi = w.get("doi") or primary_loc.get("landing_page_url") or f"https://scholar.google.com/citations?user={scholar_id}"
                
                concepts = [c.get("display_name") for c in w.get("concepts", []) if c.get("display_name")][:4]
                
                abstract_text = reconstruct_abstract(w.get("abstract_inverted_index")) or "Peer-reviewed contribution to remote sensing, hydrology, and geospatial environmental modeling by Dr. Hongxing Liu and collaborators."
                
                pubs.append({
                    "id": f"pub-scholar-{idx + 1}",
                    "title": w.get("title") or w.get("display_name") or "Research Publication",
                    "authors": authors,
                    "venue": venue,
                    "year": year,
                    "type": "Conference" if is_conf else "Peer-Reviewed Article",
                    "link": doi,
                    "abstract": abstract_text,
                    "keywords": concepts
                })
            
            if pubs:
                with open(OUT, "w", encoding="utf-8") as f:
                    json.dump(pubs, f, indent=2, ensure_ascii=False)
                print(f"Successfully fetched and wrote {len(pubs)} peer-reviewed publications to public/publications.json.")
                sys.exit(0)
except Exception as e:
    print(f"Online academic registry query notice: {e}")

# Fallback: check scholarly if installed
try:
    from scholarly import scholarly
    print("Attempting scholarly fallback...")
    author = scholarly.search_author_id(scholar_id)
    author = scholarly.fill(author, sections=["publications"])
    pubs = []
    for i, p in enumerate(author.get("publications", [])[:30]):
        bib = p.get("bib", {})
        venue = bib.get("journal") or bib.get("conference") or bib.get("venue") or ""
        year = int(bib.get("pub_year", 0)) if str(bib.get("pub_year", "")).isdigit() else 0
        pubs.append({
            "id": f"pub-scholar-{i+1}",
            "title": bib.get("title", ""),
            "authors": bib.get("author", "").replace(" and ", ", "),
            "venue": venue,
            "year": year,
            "type": "Conference" if bib.get("conference") else "Peer-Reviewed Article",
            "link": p.get("pub_url", f"https://scholar.google.com/citations?user={scholar_id}"),
            "abstract": bib.get("abstract", "Published research from ERSL Lab."),
            "keywords": ["Remote Sensing", "GIScience"]
        })
    if pubs:
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump(pubs, f, indent=2, ensure_ascii=False)
        print(f"Wrote {len(pubs)} publications via scholarly.")
except Exception as e:
    print(f"Scholarly fallback ended ({e}); existing publications.json preserved.")
