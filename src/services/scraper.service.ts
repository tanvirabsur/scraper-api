import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { randomUUID } from "crypto";

import type { Business } from "../types/business.js";

chromium.use(StealthPlugin());

export const scrapeBusinesses = async (
  query: string,
  limit: number
): Promise<Business[]> => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    locale: "en-US",
    viewport: {
      width: 1400,
      height: 900,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    await page.goto("https://www.google.com/maps?hl=en", {
      waitUntil: "domcontentloaded",
    });

    await page.fill("#searchboxinput", query);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000);

    const selector = 'a[href*="/maps/place/"]';

    await page.waitForSelector(selector);

    const cards = await page.$$(selector);

    const businesses: Business[] = [];

    const total = Math.min(cards.length, limit);

    for (let i = 0; i < total; i++) {
      const currentCards = await page.$$(selector);

      await currentCards[i].click();

      await page.waitForTimeout(2500);

      let name = "";
      let rating = "";
      let address = "";
      let phone = "";
      let website = "";

      try {
        name = await page.locator("h1.DUwDvf").innerText();
      } catch {}

      try {
        rating = await page
          .locator(
            'div.F7nice span span[aria-hidden="true"]'
          )
          .first()
          .innerText();
      } catch {}

      try {
        address = await page
          .locator('button[data-item-id="address"]')
          .innerText();
      } catch {}

      try {
        phone = await page
          .locator('button[data-item-id^="phone:tel:"]')
          .innerText();
      } catch {}

      try {
        website =
          (await page
            .locator('a[data-item-id="authority"]')
            .getAttribute("href")) ?? "";
      } catch {}

      businesses.push({
        id: randomUUID(),
        name,
        rating,
        address,
        phone,
        website,
      });
    }

    return businesses;
  } finally {
    await browser.close();
  }
};