import { devices } from "@playwright/test";
// Keep one Chromium worker browser; switch emulated viewports per test context.
// This avoids restarting the browser at a project boundary on this macOS runner.
export const viewports = ["Desktop Chrome", "iPhone 13"].map((name, index) => {
  const device = devices[name];
  return {
    name: index === 0 ? "desktop" : "mobile",
    options: {
      viewport: device.viewport,
      userAgent: device.userAgent,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
    },
  };
});
