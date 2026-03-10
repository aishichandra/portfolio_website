#!/bin/bash
# Serve the portfolio so local fonts load (browsers block fonts when opening file:// directly)
echo "Opening http://localhost:8080 — use this URL to see the font."
python3 -m http.server 8080
