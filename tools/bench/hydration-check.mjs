#!/usr/bin/env node
// hydration-check.mjs <url>...: loads each URL in headless Chrome (dev-mode app), prints hydration console stats and errors as JSON.
import { createRequire } from 'node:module';
const require = createRequire(process.env.BENCH_TOOLS ? process.env.BENCH_TOOLS + '/' : import.meta.url);
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const results = [];
for (const url of process.argv.slice(2)) {
  const page = await browser.newPage();
  const logs = [];
  page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  const svgs = await page.$$eval('svg', (els) => els.length);
  const sizes = await page.$$eval('#icons > *', (els) => els.slice(0, 3).map((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return `${r.width}x${r.height} ${s.display} ${s.flex}`; }));
  const hydrated = logs.find((l) => l.includes('hydrated')) ?? null;
  const errors = logs.filter((l) => /^(error|pageerror)|NG0[5-9]\d\d/.test(l));
  results.push({ url, svgs, sizes, hydrated, errors });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results));
