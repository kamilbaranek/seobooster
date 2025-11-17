import { chromium, type Browser } from 'playwright';

let browserPromise: Promise<Browser> | null = null;

const getBrowser = () => {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browserPromise;
};

export type ScreenshotOptions = {
  width?: number;
  height?: number;
  fullPage?: boolean;
  waitAfterLoadMs?: number;
  timeoutMs?: number;
};

export const captureScreenshot = async (url: string, options: ScreenshotOptions = {}) => {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: {
      width: options.width ?? 1280,
      height: options.height ?? 720
    }
  });
  const page = await context.newPage();
  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: options.timeoutMs ?? 25000
    });
    if ((options.waitAfterLoadMs ?? 3000) > 0) {
      await page.waitForTimeout(options.waitAfterLoadMs ?? 3000);
    }
    const buffer = await page.screenshot({
      fullPage: options.fullPage ?? false,
      type: 'jpeg',
      quality: 80
    });
    await context.close();
    return buffer;
  } catch (error) {
    await context.close();
    throw error;
  }
};

export const shutdownRenderer = async () => {
  if (!browserPromise) {
    return;
  }
  const browser = await browserPromise;
  await browser.close();
  browserPromise = null;
};
