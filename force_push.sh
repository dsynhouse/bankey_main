#!/bin/bash
echo "=== GIT STATUS ==="
git status

echo -e "\n=== LOCAL COMMITS (Last 5) ==="
git log --oneline -5

echo -e "\n=== REMOTE STATUS ==="
git ls-remote origin HEAD

echo -e "\n=== PUSHING TO ORIGIN ==="
git push origin main --verbose

echo -e "\n=== DONE ==="
