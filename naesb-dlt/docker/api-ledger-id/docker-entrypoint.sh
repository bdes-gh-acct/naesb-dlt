#!/bin/bash
set -e

echo "Updating trusted certs..."
update-ca-trust extract

echo "Starting service..."
exec npm --prefix packages/api-ledger-id start