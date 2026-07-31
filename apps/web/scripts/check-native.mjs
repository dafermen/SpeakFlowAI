import { readFile } from "node:fs/promises";

const files = {
  config: await readFile(
    new URL("../capacitor.config.ts", import.meta.url),
    "utf8",
  ),
  android: await readFile(
    new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url),
    "utf8",
  ),
  ios: await readFile(
    new URL("../ios/App/App/Info.plist", import.meta.url),
    "utf8",
  ),
};

const requirements = [
  [files.config, 'appId: "com.speakflowai.app"', "stable application ID"],
  [files.config, 'webDir: "dist"', "Capacitor web directory"],
  [
    files.android,
    "android.permission.RECORD_AUDIO",
    "Android microphone permission",
  ],
  [files.android, 'android:allowBackup="false"', "Android backup protection"],
  [files.ios, "NSMicrophoneUsageDescription", "iOS microphone explanation"],
];

const missing = requirements
  .filter(([content, expected]) => !content.includes(expected))
  .map(([, , label]) => label);

if (missing.length > 0) {
  throw new Error(`Missing native requirements: ${missing.join(", ")}`);
}

console.log("SpeakFlowAI native configuration requirements are present.");
