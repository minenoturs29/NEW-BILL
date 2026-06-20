# Building SRS Agency App with EAS

This project is pre-configured for **EAS Build**. Follow these steps after cloning to your computer.

## 1. Prerequisites
- Node 20+ and yarn 1.x
- A free Expo account → https://expo.dev/signup

## 2. Install & login
```bash
cd frontend
yarn install
npm install -g eas-cli
eas login
```

## 3. Link the project to your Expo account
The first time only, run:
```bash
eas init
```
This adds an `extra.eas.projectId` to `app.json` linking the build to your account.

## 4. Build an installable Android APK (for your own phone)
```bash
eas build -p android --profile preview
```
- Takes ~10–20 minutes on Expo's servers.
- You will get a download URL for a `.apk` — install it on your Android phone (allow "Install from unknown sources").

## 5. Build for iOS (optional, needs Apple Developer account)
```bash
eas build -p ios --profile preview
```

## 6. Production build (Play Store / App Store)
```bash
eas build -p android --profile production    # outputs .aab for Play Store
eas build -p ios --profile production         # outputs .ipa for App Store
```

## 7. Submit to stores (optional)
```bash
eas submit -p android --latest
eas submit -p ios --latest
```

---

### Profiles included in `eas.json`
| Profile | Purpose | Output |
|---|---|---|
| `development` | Dev build with hot reload | APK (Android) |
| `preview` | Install on your own phone | APK (Android), IPA (iOS) |
| `production` | Store-ready | AAB (Android), IPA (iOS) |

### App identifiers (already configured)
- Android package: `com.srsagency.billing`
- iOS bundle id: `com.srsagency.billing`
- Display name: **SRS Agency**

If you publish to Play Store / App Store you may want to change these to your own reverse-domain identifier before the first production build.
