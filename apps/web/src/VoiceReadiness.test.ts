import { describe, expect, it, vi } from "vitest";

import { checkVoiceReadiness } from "./VoiceReadiness";

describe("checkVoiceReadiness", () => {
  it("reports a configured voice service", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ available: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    await expect(
      checkVoiceReadiness("http://api.test", {
        fetcher,
        microphoneSupported: true,
        online: true,
      }),
    ).resolves.toBe("ready");
  });

  it("distinguishes unsupported browsers, offline use and unavailable voice", async () => {
    await expect(
      checkVoiceReadiness("http://api.test", { microphoneSupported: false }),
    ).resolves.toBe("browser-unsupported");
    await expect(
      checkVoiceReadiness("http://api.test", {
        microphoneSupported: true,
        online: false,
      }),
    ).resolves.toBe("offline");
    await expect(
      checkVoiceReadiness("http://api.test", {
        fetcher: vi
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ available: false }), { status: 200 }),
          ),
        microphoneSupported: true,
        online: true,
      }),
    ).resolves.toBe("voice-unavailable");
  });
});
