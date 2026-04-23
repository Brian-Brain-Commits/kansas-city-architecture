#!/usr/bin/env python3
"""
sync_skyline_scene.py — keep the homepage skyline SVG in sync on its reused pages.

Source of truth: index.html's `<svg class="skyline-svg" ...>` block (the whole SVG,
everything between the opening tag and its matching closing tag).

Targets (pages that embed the same scene):
  - neighborhoods/downtown.html

Run this after editing the homepage skyline SVG so the downtown neighborhood page
picks up the change.

What this DOES NOT do:
  - Install the `<section class="skyline-hero">` wrapper. That's a one-time
    manual migration per page (the overlay is customized per page — different
    title, eyebrow, etc.).
  - Rewrite CSS, IDs, or the weather-toggle radio group. Those are page-level
    concerns handled in the target HTML once.
  - Touch anything outside the `<svg class="skyline-svg" ...>...</svg>` block.

Usage:
  python3 scripts/sync_skyline_scene.py           # sync all targets
  python3 scripts/sync_skyline_scene.py --check   # report drift, exit 1 if any
"""
from __future__ import annotations

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "index.html"
TARGETS = [
    ROOT / "neighborhoods" / "downtown.html",
]

SVG_OPEN_RE = re.compile(r'<svg class="skyline-svg"[^>]*>')
SVG_CLOSE_TAG = "</svg>"


def extract_skyline_svg(html: str, *, label: str) -> tuple[int, int, str]:
    m = SVG_OPEN_RE.search(html)
    if not m:
        raise SystemExit(f"{label}: no <svg class='skyline-svg' ...> found")
    start = m.start()
    close_idx = html.find(SVG_CLOSE_TAG, m.end())
    if close_idx == -1:
        raise SystemExit(f"{label}: opening <svg class='skyline-svg'> has no </svg>")
    end = close_idx + len(SVG_CLOSE_TAG)
    return start, end, html[start:end]


def sync_one(source_svg: str, target_path: pathlib.Path, *, check_only: bool) -> bool:
    """Return True if target is already in sync, False if it drifted."""
    html = target_path.read_text()
    start, end, current = extract_skyline_svg(html, label=str(target_path))
    if current == source_svg:
        return True
    if check_only:
        return False
    new_html = html[:start] + source_svg + html[end:]
    target_path.write_text(new_html)
    return False


def main() -> int:
    ap = argparse.ArgumentParser(description="Sync the homepage skyline SVG to reused pages.")
    ap.add_argument(
        "--check",
        action="store_true",
        help="Report drift without writing. Exit 1 if any target is out of sync.",
    )
    args = ap.parse_args()

    source_html = SOURCE.read_text()
    _, _, source_svg = extract_skyline_svg(source_html, label=str(SOURCE))

    any_drift = False
    for target in TARGETS:
        if not target.exists():
            print(f"[skip] {target.relative_to(ROOT)} does not exist")
            continue
        in_sync = sync_one(source_svg, target, check_only=args.check)
        rel = target.relative_to(ROOT)
        if in_sync:
            print(f"[ok]   {rel} (in sync)")
        else:
            any_drift = True
            if args.check:
                print(f"[drift] {rel}")
            else:
                print(f"[sync] {rel} <- index.html")

    if args.check and any_drift:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
