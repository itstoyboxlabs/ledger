#!/usr/bin/env python3
"""Regenerates app/src/shared/constants/IMPORT_PROMPT.ts from IMPORT_PROMPT.md.
Edit IMPORT_PROMPT.md, then run: python3 scripts/build-import-prompt.py"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
text = (root / "IMPORT_PROMPT.md").read_text().strip()
out = ("// Generated from IMPORT_PROMPT.md by scripts/build-import-prompt.py. Do not edit by hand.\n"
       f"export const IMPORT_PROMPT = {json.dumps(text)}\n")
(root / "app/src/shared/constants/IMPORT_PROMPT.ts").write_text(out)
print("wrote importPrompt.js,", len(text), "chars")
