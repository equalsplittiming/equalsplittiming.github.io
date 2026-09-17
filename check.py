"""Pre-push checks for the EqualSplit site.

Scans every .html page for problems that would violate the Google Ad Grants
website policy or the conventions in CLAUDE.md:

  - broken internal links and missing image files
  - <img> without alt text or explicit width/height
  - missing <title> or <meta name="description">
  - missing or multiple <h1>
  - target="_blank" links without rel="noopener"
  - missing GA4 tag
  - duplicate headings on the same page

Usage: python3 check.py            (from the repo root)
Exits 1 if anything is flagged.
"""
import os
import re
import sys
from html.parser import HTMLParser

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
GA_TAG = "G-ZQEH6G9YK7"
HEADINGS = ("h1", "h2", "h3", "h4", "h5", "h6")


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.imgs = []
        self.links = []
        self.h1_count = 0
        self.headings = []
        self.has_title = False
        self.has_description = False
        self._heading_tag = None
        self._heading_text = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "img":
            self.imgs.append(a)
        elif tag == "a":
            self.links.append(a)
        elif tag == "title":
            self.has_title = True
        elif tag == "meta" and a.get("name") == "description" and a.get("content", "").strip():
            self.has_description = True
        elif tag in HEADINGS:
            if tag == "h1":
                self.h1_count += 1
            self._heading_tag = tag
            self._heading_text = []

    def handle_data(self, data):
        if self._heading_tag:
            self._heading_text.append(data)

    def handle_endtag(self, tag):
        if self._heading_tag and tag == self._heading_tag:
            text = re.sub(r"\s+", " ", "".join(self._heading_text)).strip()
            self.headings.append((tag, text))
            self._heading_tag = None


def find_pages(root):
    pages = []
    for d, _, files in os.walk(root):
        if "/.git" in d or "/node_modules" in d:
            continue
        for f in files:
            # google*.html is the Search Console verification file, not a page
            if f.endswith(".html") and not f.startswith("google"):
                pages.append(os.path.join(d, f))
    return sorted(pages)


def target_exists(href):
    path = href.split("#")[0].split("?")[0]
    if not path:
        return True  # same-page anchor
    full = os.path.join(ROOT, path.lstrip("/"))
    return os.path.isfile(full) or os.path.isfile(os.path.join(full, "index.html"))


problems = 0


def flag(page, msg):
    global problems
    problems += 1
    print(f"{os.path.relpath(page, ROOT)}: {msg}")


for page in find_pages(ROOT):
    src = open(page, encoding="utf-8").read()
    p = PageParser()
    p.feed(src)

    if not p.has_title:
        flag(page, "missing <title>")
    if not p.has_description:
        flag(page, "missing meta description")
    if p.h1_count == 0:
        flag(page, "no <h1>")
    elif p.h1_count > 1:
        flag(page, f"{p.h1_count} <h1> tags")
    if GA_TAG not in src:
        flag(page, "missing GA4 tag")

    for img in p.imgs:
        src_attr = img.get("src", "?")
        if not img.get("alt", "").strip():
            flag(page, f"img missing alt: {src_attr}")
        if not (img.get("width") and img.get("height")):
            flag(page, f"img missing width/height: {src_attr}")
        if src_attr.startswith("/") and not target_exists(src_attr):
            flag(page, f"img not found: {src_attr}")

    for a in p.links:
        href = a.get("href", "")
        if a.get("target") == "_blank" and "noopener" not in a.get("rel", ""):
            flag(page, f"target=_blank without noopener: {href}")
        if href.startswith("/") and not target_exists(href):
            flag(page, f"broken internal link: {href}")

    seen = set()
    for tag, text in p.headings:
        key = (tag, text.lower())
        if text and key in seen:
            flag(page, f"duplicate heading <{tag}>: {text}")
        seen.add(key)

print(f"\n{problems} problem(s) found." if problems else "\nClean.")
sys.exit(1 if problems else 0)
