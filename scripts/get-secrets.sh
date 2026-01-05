#!/bin/bash
# Ensure we have access to common binaries (including oci cli) in cron
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/home/ubuntu/bin
# Standalone utility to fetch secrets from OCI Vault

SECRET_OCID="ocid1.vaultsecret.oc1.eu-madrid-1.amaaaaaa5wo6ujyawjiscn43sphe5z37fobw5vgggjqpu3mvzpaaej7cfi6a"

# Fetch and decode
SECRET_CONTENT=$(oci secrets secret-bundle get \
    --secret-id "$SECRET_OCID" \
    --auth instance_principal \
    --query "data.\"secret-bundle-content\".content" \
    --raw-output | base64 -d -i)

if [ -z "$SECRET_CONTENT" ]; then
    exit 1
fi

echo "$SECRET_CONTENT"