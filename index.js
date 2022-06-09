const puppeteer = require('puppeteer'); // v13.0.0 or later
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");

const Config = {
  followNewTab: true,
  fps: 30,
  ffmpeg_Path: '/usr/bin/ffmpeg' || null,
  videoFrame: {
    width: 1920,
    height: 1080,
  },
  aspectRatio: '16:9',
};


(async () => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disabled-setupid-sandbox"],
      slowMo: 50 // slow down by ms
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    const timeout = 5000;
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
        await targetPage.setViewport({"width":1920,"height":1080})
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
        await element.click({ offset: { x: 127.5, y: 14.6640625} });
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
        await targetPage.keyboard.down("Tab");
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up("Tab");
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Password"],["body > div > div > form > div:nth-child(2) > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 24.5, y: 18.6640625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Password"],["body > div > div > form > div:nth-child(2) > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("g6O2EJpUO5nidZaGdT0Bs7");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "g6O2EJpUO5nidZaGdT0Bs7");
        }
        await page.screenshot({
          path: 'screenshot.jpg',
          type: 'jpeg',
          quality: 80,
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Sign in"],["body > div > div > form > div.submit.formRow > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 149.5, y: 14.6640625} });
    }

//    await page.screenshot({ path: 'screenshot_1.png', fullPage: true })
  // Takes a screenshot of an area within the page
    await recorder.stop();
    await browser.close();
})();
