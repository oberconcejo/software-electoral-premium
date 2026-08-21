const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log('Navigating to Vercel app...');
  await page.goto('https://software-electoral-premium.vercel.app', { waitUntil: 'networkidle2' });
  
  console.log('Page loaded. Checking title:', await page.title());
  
  await browser.close();
})();
