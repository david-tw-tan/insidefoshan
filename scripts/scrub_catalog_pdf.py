#!/usr/bin/env python3
"""Remove searchable factory branding text and sensitive PDF metadata."""

from __future__ import annotations

import argparse
import os
import sys

import fitz


SCRUB_CONFIG: dict[str, list[str]] = {
    "catalogs/S02-chairs-specialist-TOSCRUB.pdf": [
        "小小蚂蚁",
        "little ant",
        "Little Ant",
        "LITTLE ANT",
        "mayi",
        "MAYI",
        "蚂蚁",
    ],
    "catalogs/S04-handmade-mattress-specialist-TOSCRUB.pdf": [
        "H.H.Y.",
        "H.H.Y",
        "HHY",
    ],
    "catalogs/S05a-handmade-carpet-specialist-TOSCRUB.pdf": [],
    "catalogs/03a-opulent-luxury-collection-TOSCRUB.pdf": [
        "Modenfili Luxury Life",
        "Modenfili",
        "Modenfeli",
        "摩登翡丽",
    ],
    "catalogs/05a-midcentury-modern-collection-TOSCRUB.pdf": [
        "OLIYI CASA by BMS | www.oliyicasa.com",
        "OLIYI CASA by BMS",
        "www.oliyicasa.com",
        "OLIYI CASA",
        "BMS",
    ],
}


def clean_metadata(doc: fitz.Document) -> None:
    doc.set_metadata(
        {
            "title": "",
            "author": "",
            "subject": "",
            "keywords": "",
        }
    )
    if doc.xref_xml_metadata() > 0:
        doc.del_xml_metadata()


def _is_scrub_white_box(rect: fitz.Rect) -> bool:
    """White fill rects left by legacy fill=(1,1,1) redactions."""
    return rect.height <= 70 and rect.width <= 400


def remove_legacy_white_boxes(doc: fitz.Document) -> int:
    """Strip white overlay boxes from an earlier scrub pass (text already gone)."""
    total = 0
    for page in doc:
        rects = [
            d["rect"]
            for d in page.get_drawings()
            if d.get("fill") == (1, 1, 1) and _is_scrub_white_box(d["rect"])
        ]
        for rect in rects:
            page.add_redact_annot(rect)
            total += 1
        if page.first_annot:
            page.apply_redactions(images=0, graphics=2, text=1)
    return total


def redact_terms(doc: fitz.Document, terms: list[str]) -> int:
    """Remove searchable text matches; longest phrases first (no white overlay)."""
    ordered = sorted({t for t in terms if t}, key=len, reverse=True)
    total = 0
    for page in doc:
        for term in ordered:
            for rect in page.search_for(term):
                page.add_redact_annot(rect)
                total += 1
        if page.first_annot:
            # text=0 removes text; images/graphics=2 drop overlapping artwork cleanly.
            page.apply_redactions(images=2, graphics=2, text=0)
    return total


def verify_no_hits(path: str, terms: list[str]) -> list[str]:
    doc = fitz.open(path)
    remaining: list[str] = []
    try:
        for term in terms:
            if not term:
                continue
            for page in doc:
                if page.search_for(term):
                    remaining.append(f"search_for:{term}")
                    break
        meta = doc.metadata
        for key in ("title", "author", "subject", "keywords"):
            val = meta.get(key) or ""
            for term in terms:
                if term and term.lower() in val.lower():
                    remaining.append(f"metadata.{key}:{term}")
        xmp = doc.get_xml_metadata()
        if xmp:
            for term in terms:
                if term and term in xmp:
                    remaining.append(f"xmp:{term}")
    finally:
        doc.close()
    return remaining


def scrub_file(root: str, rel: str, terms: list[str]) -> tuple[int, list[str]]:
    path = os.path.join(root, rel)
    tmp = path + ".scrubbing.tmp"
    doc = fitz.open(path)
    clean_metadata(doc)
    redactions = redact_terms(doc, terms)
    legacy_boxes = remove_legacy_white_boxes(doc)
    if legacy_boxes:
        print(f"  removed legacy white boxes: {legacy_boxes}", file=sys.stderr)
    doc.save(
        tmp,
        garbage=4,
        deflate=True,
        clean=True,
    )
    doc.close()
    os.replace(tmp, path)
    issues = verify_no_hits(path, terms)
    return redactions, issues


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "root",
        nargs="?",
        default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        help="Repository root (default: parent of scripts/)",
    )
    parser.add_argument(
        "--file",
        action="append",
        dest="files",
        help="Catalog relative path (repeatable). Default: all configured TOSCRUB files.",
    )
    args = parser.parse_args()
    root = os.path.abspath(args.root)
    targets = args.files or list(SCRUB_CONFIG.keys())

    for rel in targets:
        terms = SCRUB_CONFIG.get(rel, [])
        if rel not in SCRUB_CONFIG:
            print(f"warning: no term list for {rel}", file=sys.stderr)
        print(f"Scrubbing {rel} …")
        n, issues = scrub_file(root, rel, terms)
        print(f"  redaction rects: {n}")
        if issues:
            print(f"  verify WARN ({len(issues)}):")
            for item in issues[:20]:
                print(f"    - {item}")
            if len(issues) > 20:
                print(f"    … and {len(issues) - 20} more")
        else:
            print("  verify OK (searchable text + configured metadata)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
