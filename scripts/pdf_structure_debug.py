#!/usr/bin/env python3
"""Diagnostic: dump raw text from key pages to understand PDF structure"""

import os
import json

try:
    import pdfplumber
except ImportError:
    os.system("pip install pdfplumber")
    import pdfplumber

PDF_PATH = r"C:\Dev\KetoCakr\admin\notes\Испанска_кето_книга.pdf"

def dump_page(pdf, page_idx, label=""):
    page = pdf.pages[page_idx]
    text = page.extract_text() or ""
    print(f"\n{'='*60}")
    print(f"PAGE {page_idx+1} {label}")
    print('='*60)
    for i, line in enumerate(text.split('\n'), 1):
        print(f"  {i:3}: {line}")

def main():
    with pdfplumber.open(PDF_PATH) as pdf:
        total = len(pdf.pages)
        print(f"Total pages: {total}")

        # Pages 2 and 3 — TOC
        dump_page(pdf, 1, "(TOC page 2)")
        dump_page(pdf, 2, "(TOC page 3?)")

        # First few recipe pages to understand section structure
        dump_page(pdf, 2,  "(page 3 - БАКТЕРИ С РИКОТА И МАЛИНИ)")
        dump_page(pdf, 19, "(page 20 - ДАМСКИ ПРЪСТЧИЦИ)")
        dump_page(pdf, 22, "(page 23 - Донетки)")

if __name__ == '__main__':
    main()
