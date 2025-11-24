# Browser Extension Installation


Produce xpi extension file
```sh
rm ./bookmarker.xpi && cd extension && zip -r ../bookmarker.xpi * && cd ..
```

## Firefox Desktop

1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to `extension/manifest.json` and select it
5. The extension is now installed and will appear in your toolbar

**Note:** Temporary extensions are removed when Firefox is closed. For permanent installation, you need to sign the extension (https://addons.mozilla.org/en-US/developers/addons) or use Firefox Developer Edition.

## Chrome/Chromium

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `extension` folder
6. The extension is now installed and will appear in your toolbar

## Firefox Android

**Prerequisites:**
- Firefox Nightly or Firefox Beta (required for custom extension support)
- Your Bookmarker backend must be accessible from your Android device

**Installation Steps:**

1. **Enable development extensions in Firefox Android:**
   - Use Firefox Nightly/Beta on Android
   - Navigate to `about:config`
   - Search for `xpinstall.signatures.required` and set to `false`
   - Search for `extensions.experiments.enabled` and set to `true`
   - Go to 'Settings', then 'About', tap 5 time over logo - development settings will be enabled

2. **Install extension:**
   - Go to 'Settings', then 'Install extension from file'
   - Update the API URL in the extension settings after installation

3. **Debugging**
   - Enable "Remote debugging via USB" in settings
   - Connect the phone to a desktop via USB
   - Open `about:debugging` on the desktop, select you phone on the left


**Mobile Usage:**
- Tap the three-dot menu → Extensions → Bookmarker
- Or use the context menu: Long-press a link → Share → Bookmarker
- Configure the API URL via Settings to point to your accessible backend 


