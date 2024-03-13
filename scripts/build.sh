#!/bin/bash

# Backup original files
cp .gitignore .gitignore.bak
cp app.config.ts app.config.ts.bak

# Remove line from .gitignore
sed -i '/assets\/google-services.json/d' .gitignore

# Update line in app.config.ts
sed -i 's|googleServicesFile: process.env.GOOGLE_SERVICES_JSON|"googleServicesFile": "./assets/google-services.json"|' app.config.ts

# Run eas build with provided profile or default to "dev"
PROFILE=${1:-dev}
eas build --platform android --local --profile $PROFILE

# Revert .gitignore and app.config.ts to original state
mv .gitignore.bak .gitignore
mv app.config.ts.bak app.config.ts
