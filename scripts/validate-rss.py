#!/usr/bin/env python3
"""Smoke-test the publicly served RSS without changing production data."""
import sys
import urllib.request
import xml.etree.ElementTree as ET

url = sys.argv[1] if len(sys.argv) > 1 else "https://paulorodeo-rodeo-country-podcasts.pjdigital.workers.dev/rss.xml"
req = urllib.request.Request(url, headers={"User-Agent": "RodeoPodcasts-QA/1.0"})
with urllib.request.urlopen(req, timeout=30) as resp:
    content = resp.read(2_000_001)
    print("HTTP:", resp.status, "Content-Type:", resp.headers.get("Content-Type"))
    print("Rss source:", resp.headers.get("X-Rodeo-Rss-Source"), resp.headers.get("X-Rodeo-Rss"))
assert len(content) <= 2_000_000, "RSS too large"
root = ET.fromstring(content)
assert root.tag == "rss", "Not an RSS document"
channel = root.find("channel")
assert channel is not None, "Missing channel"
items = channel.findall("item")
print("Channel:", channel.findtext("title"))
print("Language:", channel.findtext("language"))
print("Episodes:", len(items))
for item in items[:5]:
    enclosure = item.find("enclosure")
    guid = item.findtext("guid")
    print("Episode:", item.findtext("title"), "GUID:", bool(guid))
    if enclosure is not None:
        size = enclosure.attrib.get("length")
        print("Enclosure length:", size, "URL present:", bool(enclosure.attrib.get("url")))
        assert size is None or (size.isdecimal() and int(size) >= 0), "Invalid enclosure length"
assert items, "No published podcast episodes in RSS"
assert channel.findtext("language") == "pt-BR", "Unexpected RSS language"
print("Podcast feed QA PASSED")
