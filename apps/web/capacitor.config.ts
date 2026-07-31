import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.speakflowai.app",
  appName: "SpeakFlowAI",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
