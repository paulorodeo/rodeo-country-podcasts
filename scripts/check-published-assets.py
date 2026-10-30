#!/usr/bin/env python3
"""Verify locally vendored Rodeo Country Podcasts artwork and its MIME types."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = sorted((ROOT / "src/assets").glob("*.json"))
if not FILES:
    raise SystemExit("Missing artwork metadata")

for file in FILES:
    data = json.loads(file.read_text())
    url = data["url"]
    assert url.startswith("/media/"), (file, url)
    local = ROOT / "public" / url.lstrip("/")
    assert local.is_file(), f"Missing local artwork: {local}"
    raw = local.read_bytes()
    ext = local.suffix.lower()
    signatures = {
        ".webp": lambda b: b[:4] == b"RIFF" and b[8:12] == b"WEBP",
        ".png": lambda b: b.startswith(bytes.fromhex("89504e470d0a1a0a")),
        ".avif": lambda b: b[4:8] == b"ftyp" and b"avif" in b[8:32],
    }
    assert ext in signatures and signatures[ext](raw), f"Invalid image: {local}"
    if "size" in data:
        assert data["size"] == len(raw), (file, len(raw))
    print(f"PASS {url} ({len(raw)} bytes)")
print(f"Verified {len(FILES)} local podcast artwork files.")
