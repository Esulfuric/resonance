
#!/bin/bash

# Build the web application
npm run build

# Sync the web app with native platforms
npx cap sync

echo "Mobile build complete! You can now run:"
echo "  npx cap run android (for Android)"
echo "  npx cap run ios (for iOS - requires Mac with Xcode)"
