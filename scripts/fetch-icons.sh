#!/bin/bash
# Download merchant favicons (via Google's favicon service) into app/public/icons/,
# named by domain. Reads the domains from the `merchants` map in the data file
# (default $LEDGER_DATA_DIR/transactions.json or data/transactions.json, or pass a file). Run it after adding
# merchants. Skips icons that already exist. The app itself never looks anything up.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p app/public/icons

data="${1:-${LEDGER_DATA_DIR:-data}/transactions.json}"
[ -f "$data" ] || { echo "no data file at $data"; exit 1; }

domains=$(python3 -c '
import json, sys
m = json.load(open(sys.argv[1])).get("merchants", {})
print("\n".join(sorted(set(m.values()))))
' "$data")

for d in $domains; do
  out="app/public/icons/$d.png"
  [ -s "$out" ] && continue
  curl -sfL --max-time 10 "https://www.google.com/s2/favicons?domain=$d&sz=64" -o "$out" \
    && file "$out" | grep -q 'image data' \
    && echo "ok   $d" || { rm -f "$out"; echo "MISS $d"; }
done
echo "done: $(ls app/public/icons | wc -l | tr -d ' ') icons"
