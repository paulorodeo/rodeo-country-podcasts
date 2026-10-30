#!/usr/bin/env python3
"""Vendor Lovable binary assets for independent Cloudflare deployment.

Reads only checked-in src/assets/*.asset.json manifests, validates project
ID, media type and byte size, and downloads each binary to the exact path
currently referenced by the app. This keeps Lovable's existing preview and
frontend source intact and removes runtime dependence on Lovable hosting.
"""
from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
MANIFESTS = ROOT / "src" / "assets"
PUBLIC = ROOT / "public"
PROJECT_ID = "a14659df-327f-4f47-8c7f-250c7fb5a52f"
ORIGIN = f"https://project--{PROJECT_ID}-dev.lovable.app"
MAX_BYTES = 6_000_000
MEDIA_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".avif": "image/avif",
    ".webp": "image/webp",
}

def is_image(blob: bytes, suffix: str) -> bool:
    if suffix == ".png":
        return blob.startswith(b"\x89PNG\r\n\x1a\n")
    if suffix == ".webp":
        return blob.startswith(b"RIFF") and blob[8:12] == b"WEBP"
    if suffix == ".avif":
        return b"ftypavif" in blob[:32] or b"ftypavis" in blob[:32]
    if suffix in (".jpeg", ".jpg"):
        return blob.startswith(b"\xff\xd8\xff")
    return False

def main() -> int:
    manifest_paths = sorted(MANIFESTS.glob("*.asset.json"))
    if not manifest_paths:
        raise RuntimeError("No Lovable asset manifests found")
    changed = 0
    for manifest_path in manifest_paths:
        data = json.loads(manifest_path.read_text())
        asset_id = data["asset_id"]
        name = data["original_filename"]
        rel_url = data["url"]
        size = int(data["size"])
        ext = Path(name).suffix.lower()
        if data.get("project_id") != PROJECT_ID:
            raise RuntimeError(f"Unexpected Lovable project ID: {manifest_path}")
        if not re.fullmatch(r"[0-9a-f-]{36}", asset_id):
            raise RuntimeError(f"Malformed asset ID: {manifest_path}")
        if not re.fullmatch(r"[A-Za-z0-9._-]+", name) or name.startswith("."):
            raise RuntimeError(f"Unsafe filename: {manifest_path}")
        if ext not in MEDIA_TYPES:
            raise RuntimeError(f"Unsupported image type: {name}")
        expected_path = f"/__l5e/assets-v1/{asset_id}/{name}"
        if rel_url != expected_path:
            raise RuntimeError(f"Unexpected URL: {manifest_path}")
        if not 0 < size <= MAX_BYTES:
            raise RuntimeError(f"Unexpected file size: {name}: {size}")
        destination = PUBLIC / expected_path.lstrip("/")
        if destination.is_file():
            old = destination.read_bytes()
            if len(old) == size and is_image(old, ext):
                print(f"EXISTS {name} bytes={len(old)}")
                continue
        url = ORIGIN + expected_path
        request = urllib.request.Request(url, headers={"User-Agent": "RodeoAssetVendor/1.0"})
        try:
            with urllib.request.urlopen(request, timeout=35) as response:
                content_type = response.headers.get("Content-Type", "").split(";")[0].lower()
                blob = response.read(MAX_BYTES + 1)
                if response.status != 200 or content_type != MEDIA_TYPES[ext]:
                    raise RuntimeError(f"Unexpected response for {name}: status={response.status} type={content_type}")
        except urllib.error.HTTPError as error:
            raise RuntimeError(f"Lovable source returned HTTP {error.code} for {name}") from error
        if len(blob) != size or not is_image(blob, ext):
            raise RuntimeError(f"Image integrity mismatch for {name}: expected={size}, received={len(blob)}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(blob)
        changed += 1
        print(f"VENDORED {name} bytes={len(blob)}")
    print(f"Verified {len(manifest_paths)} manifests, downloaded {changed} new or replaced image binaries")
    return 0

if __name__ == "__main__":
    sys.exit(main())
