# PROJECT X Mobile (Android / iOS)

React Native + Expo starter. Platform tabs stay in one mobile application and load official websites through WebView where supported. This is **not** a guarantee that personal accounts can log in: providers may block WebViews. A clearly labeled external-browser fallback is available.

## Local development
From repo root: `npm install` then `npm run dev:mobile`. Use Expo Go for initial UI testing if compatible, or a development build.

## Android APK
Set up an Expo account and run `npx eas login`, `cd apps/mobile`, `npx eas build:configure`, then `npx eas build --platform android --profile preview`. The preview profile outputs an APK.

## iOS
An Apple Developer account and signing are required for device/TestFlight/App Store distribution. After configuring EAS, run `npx eas build --platform ios --profile production`.

No APK or IPA has been built or tested yet. This starter does not include Neon authentication or native messaging integrations.
