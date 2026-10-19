#!/usr/bin/env python3
"""Regenerate showroom manifest in index.html and js/showroom-photos.js."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "images"
INDEX = ROOT / "index.html"
OUT = ROOT / "js" / "showroom-photos.js"

MAPPING = {
    1: "01",
    2: "02",
    3: "03",
    4: "04",
    5: "05",
    6: "S01",
    7: "S02",
    8: "S03",
    9: "S04",
    10: "S05",
    11: "S06",
}

manifest: dict[str, list[dict[str, str]]] = {}
for fid, prefix in MAPPING.items():
    key = f"photos-factory-{fid}-showroom"
    files = sorted(IMG.glob(f"showroom-{prefix}_*.jpg"))
    manifest[key] = [
        {"src": f"images/{p.name}", "alt": f"Showroom photo {i} from Factory {fid}"}
        for i, p in enumerate(files, 1)
    ]

payload = json.dumps(manifest, indent=2)
OUT.write_text(
    "// Auto-generated. Run: python3 scripts/generate_showroom_manifest.py\n"
    f"window.SHOWROOM_PHOTOS = {payload};\n"
)

block = (
    "<!-- showroom-manifest:auto -->\n"
    "    <script>\n"
    f"    window.SHOWROOM_PHOTOS = {payload};\n"
    "    </script>\n"
    "    <!-- /showroom-manifest:auto -->"
)
html = INDEX.read_text()
if "<!-- showroom-manifest:auto -->" in html:
    html = re.sub(
        r"<!-- showroom-manifest:auto -->.*?<!-- /showroom-manifest:auto -->",
        block,
        html,
        flags=re.DOTALL,
    )
else:
    html = html.replace(
        '<script src="js/site.js" defer></script>',
        block + '\n    <script src="js/site.js" defer></script>',
    )
html = html.replace('<script src="js/showroom-photos.js" defer></script>\n    ', "")
INDEX.write_text(html)
print(f"Updated index.html and {OUT} ({sum(len(v) for v in manifest.values())} photos)")
