#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)
PATCH_FILE="${REPO_ROOT}/patches/cyberchef-dnd-workaround.js"

cd "${REPO_ROOT}"

version=$(jq -r .package.version src-tauri/tauri.conf.json)

echo "Downloading CyberChef v${version}"

rm -rf dist
mkdir -p dist
cd dist
curl -L "https://github.com/gchq/CyberChef/releases/download/v${version}/CyberChef_v${version}.zip" -o cyberchef.zip
unzip -q cyberchef.zip
rm cyberchef.zip
mv *.html index.html

cp "${PATCH_FILE}" ./cyberchef-dnd-workaround.js
if ! grep -q "cyberchef-dnd-workaround.js" index.html; then
	tmpfile=$(mktemp)
	awk '
		/<\/body>/ && !inserted {
			print "    <script src=\"./cyberchef-dnd-workaround.js\"></script>"
			inserted = 1
		}
		{ print }
	' index.html >"${tmpfile}"
	mv "${tmpfile}" index.html
fi
