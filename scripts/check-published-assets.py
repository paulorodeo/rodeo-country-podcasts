#!/usr/bin/env python3
"""Verify every vendored Lovable media file is served unchanged by Cloudflare."""
import hashlib
import json
import os
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("RODEO_TEST_BASE", "https://podcast.fazenda.rodeo").rstrip("/")
FILES = sorted((ROOT / "src/assets").glob("*.asset.json"))
if not FILES:
    raise SystemExit("Missing asset manifests")

def check_all():
    for file in FILES:
        data = json.loads(file.read_text())
        local = ROOT / "public" / data["url"].lstrip("/")
        if not local.exists():
            raise RuntimeError(f"Missing local image: {local}")
        expected = local.read_bytes()
        req = urllib.request.Request(BASE + data["url"], headers={"User-Agent": "RodeoMedia-QA/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            remote = resp.read(6_000_001)
            content_type = resp.headers.get("content-type", "").split(";")[0]
            assert resp.status == 200, (data["original_filename"], resp.status)
            assert content_type == data["content_type"], (data["original_filename"], content_type)
            assert remote == expected, (data["original_filename"], hashlib.sha256(remote).hexdigest())
        print(f"PASS {data['original_filename']} {len(remote)} bytes")

last_error = None
for attempt in range(1, 11):
    try:
        check_all()
        print(f"SUCCESS: all {len(FILES)} Lovable images served intact from {BASE}")
        break
    except Exception as err:
        last_error = err
        print(f"Attempt {attempt}/10 not ready: {err}", flush=True)
        if attempt == 10:
            raise
        time.sleep(12)
