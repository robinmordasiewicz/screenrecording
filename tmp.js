const puppeteer = require('puppeteer');
const { createCursor } = require("ghost-cursor");

const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const {installMouseHelper} = require('./install-mouse-helper');
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
//const TOKEN = process.argv[2];
//var arg = process.argv.slice(2);
//var TOKEN=arg[0];
var TOKEN="lB2TOIHh86yFcVtTn0pRyI";
if ( !TOKEN ) {
    throw "Please provide a URL as the first argument";
}

const Config = {
  followNewTab: true,
  fps: 30,
  ffmpeg_Path: 'ffmpeg' || null,
  videoFrame: {
    width: 1920,
    height: 1080
  },
  aspectRatio: '16:9'
};

(async () => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disabled-setupid-sandbox","--enable-font-antialiasing","--force-device-scale-factor=1", "--high-dpi-support=1"],
      slowMo: 0,
      headless : true
    });
    const page = await browser.newPage();
    const cursor = createCursor(page);
    await installMouseHelper(page); // Install Mouse Helper
    await page.setViewport({ width: 1920, height: 1080 });
    const timeout = 50000;
    page.setDefaultTimeout(timeout);
    const recorder = new PuppeteerScreenRecorder(page, Config);
    await recorder.start("output.mp4");

    async function waitForSelectors(selectors, frame, options) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

    async function scrollIntoViewIfNeeded(element, timeout) {
      await waitForConnected(element, timeout);
      const isInViewport = await element.isIntersectingViewport({threshold: 0});
      if (isInViewport) {
        return;
      }
      await element.evaluate(element => {
        element.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'auto',
        });
      });
      await waitForInViewport(element, timeout);
    }

    async function waitForConnected(element, timeout) {
      await waitForFunction(async () => {
        return await element.getProperty('isConnected');
      }, timeout);
    }

    async function waitForInViewport(element, timeout) {
      await waitForFunction(async () => {
        return await element.isIntersectingViewport({threshold: 0});
      }, timeout);
    }

    async function waitForSelector(selector, frame, options) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }

    async function waitForElement(step, frame, timeout) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      }, timeout);
    }

    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }

    async function querySelectorAll(selector, frame) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (i === 0) {
          elements = await frame.$$(part);
        } else {
          const tmpElements = elements;
          elements = [];
          for (const el of tmpElements) {
            elements.push(...(await el.$$(part)));
          }
        }
        if (elements.length === 0) {
          return [];
        }
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }

    async function waitForFunction(fn, timeout) {
      let isActive = true;
      setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }
    {
        const targetPage = page;
        await targetPage.setViewport({"width":1920,"height":1080});
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        //await targetPage.goto("http://robin-jenkins.amer.myedgedemo.com:8080/", {"waitUntil" : "networkidle0"});
        await targetPage.goto("http://robin-jenkins.amer.myedgedemo.com:8080/");
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Username"],["#j_username"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await targetPage.mouse.move(965, 510);
/*
        await targetPage.mouse.move(960, 515);
        await targetPage.mouse.move(955, 520);
        await targetPage.mouse.move(950, 525);
        await targetPage.mouse.move(945, 530);
        await targetPage.mouse.move(940, 535);
        await targetPage.mouse.move(935, 540);
        await targetPage.mouse.move(930, 545);
        await targetPage.mouse.move(925, 550);
        await element.click({ offset: { x: 125, y: 15} });
*/
        await cursor.click(element);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Username"],["#j_username"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("admin");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "admin");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Password"],["body > div > div > form > div:nth-child(2) > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
/*
        await targetPage.mouse.move(925, 550);
        await targetPage.mouse.move(925, 555);
        await targetPage.mouse.move(925, 560);
        await targetPage.mouse.move(925, 565);
        await targetPage.mouse.move(925, 570);
        await targetPage.mouse.move(925, 575);
        await targetPage.mouse.move(925, 580);
        await targetPage.mouse.move(925, 585);
        await targetPage.mouse.move(925, 590);
*/
        await cursor.move(element);
        await element.click({ offset: { x: 125, y: 15} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Password"],["body > div > div > form > div:nth-child(2) > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("lB2TOIHh86yFcVtTn0pRyI");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "lB2TOIHh86yFcVtTn0pRyI");
        }
        await targetPage.screenshot({
          path: 'screenshot.png',
          type: 'png',
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Sign in"],["body > div > div > form > div.submit.formRow > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
/*
        await targetPage.mouse.move(930, 588);
        await targetPage.mouse.move(933, 595);
        await targetPage.mouse.move(936, 600);
        await targetPage.mouse.move(938, 610);
        await targetPage.mouse.move(941, 615);
        await targetPage.mouse.move(943, 620);
        await targetPage.mouse.move(945, 625);
        await targetPage.mouse.move(948, 630);
        await targetPage.mouse.move(950, 633);
        await targetPage.mouse.move(953, 635);
        await targetPage.mouse.move(956, 638);
        await targetPage.mouse.move(960, 643);
*/
        await cursor.move(element);
        await targetPage.waitForTimeout(1000);
        await element.click({ offset: { x: 150, y: 15} });
    }
    {
        const targetPage = page;
        await targetPage.waitForNavigation({waitUntil: 'networkidle2'});
        await targetPage.screenshot({
          path: 'screenshot2.png',
          type: 'png',
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
       // await targetPage.screenshot({ path: 'screenshot2.png'})
    }
    {
        await page.waitForTimeout(2000);
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        const element = await waitForSelectors([["#tasks > div:nth-child(6) > span > a > span.task-link-text"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await cursor.move(element);
        await element.click({ offset: { x: 63, y: 12.5} });
        await targetPage.waitForNavigation({waitUntil: 'networkidle2'});
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        const element = await waitForSelectors([["#main-panel > section:nth-child(4) > div > div:nth-child(5) > a > dl > dd:nth-child(2)"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 61.671875, y: 7.96875} });
        await targetPage.waitForNavigation({waitUntil: 'networkidle2'});
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        await targetPage.waitForTimeout(2000);
        const element = await waitForSelectors([["#main-panel > div > div > div > form:nth-child(4) > div:nth-child(1) > div.jenkins-form-item.tr > div.setting-main > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 40, y: 16.0078125} });
    }
    {
        const targetPage = page;
        await targetPage.waitForTimeout(2000);
        const element = await waitForSelectors([["#main-panel > div > div > div > form:nth-child(4) > div:nth-child(1) > div.jenkins-form-item.tr > div.setting-main > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("https://robinmordasiewicz.github.io/jcasc/jenkins.yaml");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "https://robinmordasiewicz.github.io/jcasc/jenkins.yaml");
        }
    }
    {
        const targetPage = page;
        await targetPage.waitForTimeout(2000);
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        const element = await waitForSelectors([["aria/Apply new configuration"],["#yui-gen1-button"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 71, y: 11.0078125} });
        await targetPage.waitForNavigation({waitUntil: 'networkidle2'});
        //await Promise.all(promises);
    }
    {
        const targetPage = page;
        await targetPage.waitForTimeout(2000);
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        const element = await waitForSelectors([["aria/Dashboard"],["#breadcrumbs > li:nth-child(1) > a"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 51.8046875, y: 25} });
        await targetPage.waitForNavigation({waitUntil: 'networkidle2'});
        //await Promise.all(promises);
    }

    //save cookies
//    const cookies = await page.cookies();
//    await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
    await page.waitForTimeout(5000);

    await recorder.stop();
    await browser.close();

})();
