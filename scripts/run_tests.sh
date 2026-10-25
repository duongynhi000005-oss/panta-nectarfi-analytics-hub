#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Running Panta x NectarFi Analytics Hub Verification Suite"
echo "=========================================================="

echo "[1/2] Running automated Node.js unit tests..."
node --test tests/*.test.js

echo "[2/2] Validating Web Portal static assets..."
test -f web/index.html && test -f web/styles.css && test -f web/app.js

echo "=========================================================="
echo " All tests passed 100%! Ready for Superteam Earn Submission."
echo "=========================================================="
