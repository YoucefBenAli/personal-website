// Run with Playwright available: node tests/terminal.cjs
// Optional: CHROMIUM_PATH=/path/to/chrome node tests/terminal.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    for (const width of [1440, 375, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      const input = page.locator('#command-input');
      const run = async command => { await input.fill(command); await input.press('Enter'); };
      assert.equal(await page.locator('h1').innerText(), 'Youcef');
      assert.equal(await input.evaluate(el => el === document.activeElement), true);
      await page.keyboard.type('whoami'); await page.keyboard.press('Enter');
      assert.match(await page.locator('.entry').last().innerText(), /I’m Youcef/);
      await run('home');
      await input.evaluate(el => el.blur());
      await page.keyboard.type('stack');
      assert.equal(await input.inputValue(), 'stack');
      await page.keyboard.press('Enter'); await run('home');
      await input.press('Escape');
      await page.keyboard.type('x');
      assert.equal(await input.inputValue(), '');
      await page.locator('h1').click();
      assert.equal(await input.evaluate(el => el === document.activeElement), true);
      await input.press('Escape');
      await page.locator('h1').evaluate(el => {
        const range = document.createRange(); range.selectNodeContents(el);
        const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      });
      await page.keyboard.type('x');
      assert.equal(await input.inputValue(), '');
      assert.equal(await page.evaluate(() => getSelection().toString()), 'Youcef');
      await page.evaluate(() => getSelection().removeAllRanges());
      await page.locator('.leader').first().click();
      assert.equal(await input.evaluate(el => el === document.activeElement), true);
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()), '#70F1FF');
      for (const command of ['whoami', 'stack', 'experience', 'ai', 'github', 'contact']) await run(command);
      assert.equal(await page.locator('.entry').count(), 6);
      await run('ls');
      assert.equal(await page.locator('.response').last().innerText(), 'whoami.txt  stack.txt  experience.txt  ai.txt  github.txt  contact.txt');
      for (const command of ['whoami', 'stack', 'experience', 'ai', 'github', 'contact']) {
        await run(command);
        const expected = await page.locator('.response').last().innerHTML();
        await run(`cat ${command}.txt`);
        assert.equal(await page.locator('.response').last().innerHTML(), expected);
      }
      await page.getByRole('button', { name: 'ai', exact: true }).first().click();
      assert.match(await page.locator('.response').last().innerText(), /My AI coding setup is built around Pi/);
      assert.equal(await page.locator('.response').last().locator('a').getAttribute('href'), 'https://github.com/YoucefBenAli/personal-pi-settings');
      assert.equal(await page.locator('.response').last().locator('a').getAttribute('target'), '_blank');
      assert.equal(await page.locator('.response').last().locator('a').getAttribute('rel'), 'noopener noreferrer');
      await input.fill('a'); await input.press('Tab'); assert.equal(await input.inputValue(), 'ai');
      await input.fill('cat ai'); await input.press('Tab'); assert.equal(await input.inputValue(), 'cat ai.txt');
      await run('experience');
      assert.equal(await page.locator('.response').last().locator('p').count(), 6);
      assert.match(await page.locator('.response').last().innerText(), /Senior Software Developer — TrendAI/);
      assert.match(await page.locator('.response').last().innerText(), /Ross Video \| Jan 2021–Apr 2021/);
      await input.fill('exp'); await input.press('Tab');
      assert.equal(await input.inputValue(), 'experience');
      await input.fill('cat exp'); await input.press('Tab');
      assert.equal(await input.inputValue(), 'cat experience.txt');
      await run('cat ./whoami.txt');
      assert.match(await page.locator('.response').last().innerText(), /I’m Youcef/);
      for (const filename of ['missing.txt', 'theme', 'clear', '__proto__', '<img>']) {
        await run(`cat ${filename}`);
        assert.match(await page.locator('.response').last().innerText(), /No such file/);
      }
      await run('cat'); assert.match(await page.locator('.response').last().innerText(), /Usage: cat <file>/);
      await input.fill('cat ');
      for (const filename of ['whoami.txt', 'stack.txt', 'experience.txt', 'ai.txt', 'github.txt', 'contact.txt', 'whoami.txt']) {
        await input.press('Tab'); assert.equal(await input.inputValue(), `cat ${filename}`);
      }
      await input.fill('cat pro'); await input.press('Tab');
      assert.equal(await input.inputValue(), 'cat pro');
      await run('projects');
      assert.match(await page.locator('.response').last().innerText(), /Command not found/);
      await run('cat projects.txt');
      assert.match(await page.locator('.response').last().innerText(), /No such file/);
      await run('help');
      assert.equal(await page.getByRole('button', { name: 'projects', exact: true }).count(), 0);
      await input.fill('proj'); await input.press('Tab');
      assert.equal(await input.inputValue(), 'proj');
      await input.fill('c');
      for (const expected of ['contact', 'clear', 'cat', 'contact']) {
        await input.press('Tab'); assert.equal(await input.inputValue(), expected);
      }
      await input.press('Shift+Tab');
      assert.equal(await input.evaluate(el => el === document.activeElement), false);
      await input.fill('zzz'); await input.press('Tab');
      assert.equal(await input.evaluate(el => el === document.activeElement), false);
      await input.fill(''); await input.press('Tab');
      assert.equal(await input.evaluate(el => el === document.activeElement), false);
      await input.fill('theme l'); await input.press('Tab');
      assert.equal(await input.inputValue(), 'theme lime'); await input.press('Enter');
      assert.equal(await page.locator('#theme-label').innerText(), 'lime');
      await run('theme'); assert.equal(await page.locator('#theme-label').innerText(), 'amber');
      await run('theme'); assert.equal(await page.locator('#theme-label').innerText(), 'cyan');
      await run('theme violet');
      assert.equal(await page.locator('#theme-label').innerText(), 'cyan');
      assert.match(await page.locator('.response').last().innerText(), /Unknown theme/);
      await input.fill('theme v'); await input.press('Tab');
      assert.equal(await input.inputValue(), 'theme v');
      const backgrounds = { cyan: '#070B16', lime: '#090F08', amber: '#A99A8B' };
      const surfaces = new Set();
      const selectionColors = new Set();
      for (const theme of ['cyan', 'lime', 'amber']) {
        await run(`theme ${theme}`); assert.equal(await page.locator('#theme-label').innerText(), theme);
        assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()), backgrounds[theme]);
        assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), backgrounds[theme]);
        surfaces.add(await page.locator('.window').evaluate(el => getComputedStyle(el).backgroundColor));
        selectionColors.add(await page.locator('.screen').evaluate(el => getComputedStyle(el, '::selection').backgroundColor));
        assert.equal(await page.evaluate(() => localStorage.getItem('terminal-theme')), theme);
      }
      assert.equal(surfaces.size, 3);
      assert.equal(selectionColors.size, 3);
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'light');
      await page.screenshot({ path: `/tmp/personal-terminal-rust-${width}.png` });
      await run('theme invalid'); assert.equal(await page.locator('#theme-label').innerText(), 'amber');
      await input.fill('draft'); await input.press('ArrowUp');
      assert.equal(await input.inputValue(), 'theme invalid'); await input.press('ArrowDown');
      assert.equal(await input.inputValue(), 'draft');
      await input.press('Control+c');
      assert.equal(await input.inputValue(), '');
      assert.match(await page.locator('.entry').last().innerText(), /draft\^C$/);
      await input.press('ArrowUp'); assert.equal(await input.inputValue(), 'theme invalid');
      await input.fill('copy me');
      await input.evaluate(el => el.setSelectionRange(0, el.value.length));
      await input.press('Control+c');
      assert.equal(await input.inputValue(), 'copy me');
      await input.evaluate(el => el.setSelectionRange(el.value.length, el.value.length));
      await page.locator('h1').evaluate(el => {
        const range = document.createRange(); range.selectNodeContents(el);
        const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      });
      await page.keyboard.press('Control+c');
      assert.equal(await input.inputValue(), 'copy me');
      await page.evaluate(() => getSelection().removeAllRanges());
      await input.press('Control+c');
      assert.equal(await input.inputValue(), '');
      const count = await page.locator('.entry').count();
      await input.press('Control+c'); assert.equal(await page.locator('.entry').count(), count);
      await run('<img src=x onerror=alert(1)>');
      assert.equal(await page.locator('#output img').count(), 0);
      await run('letters'); assert.match(await page.locator('.entry').last().innerText(), /Command not found/);
      await page.getByRole('button', { name: 'help', exact: true }).first().click();
      assert.match(await page.locator('.entry').last().innerText(), /Available commands/);
      await run('clear'); assert.equal(await page.locator('#output').innerText(), '');
      await run('help'); assert.equal(await page.locator('.menu').count(), 1);
      await input.press('Control+l'); assert.equal(await page.locator('#output').innerText(), '');
      await run('home'); assert.equal(await page.locator('h1').count(), 1);
      await page.evaluate(() => { window.SITE_CONTENT.about = ['A long paragraph about building thoughtful software. '.repeat(30)]; });
      await run('whoami');
      const paragraph = page.locator('.response p').last();
      const proseLimit = await paragraph.evaluate(el => parseFloat(getComputedStyle(el).maxWidth));
      const eightyCh = await paragraph.evaluate(el => {
        const probe = document.createElement('div'); probe.style.width = '80ch'; el.append(probe);
        const width = parseFloat(getComputedStyle(probe).width); probe.remove(); return width;
      });
      assert.ok(Math.abs(proseLimit - eightyCh) < 1);
      assert.ok(await paragraph.evaluate(el => el.getBoundingClientRect().width) <= proseLimit + 1);
      assert.equal(await page.locator('.menu').evaluate(el => el.getBoundingClientRect().width), await page.locator('#output').evaluate(el => el.getBoundingClientRect().width));
      await page.evaluate(() => { window.SITE_CONTENT.about = []; });
      await run('designs');
      const comparisonLink = page.getByRole('link', { name: 'Open design comparison ↗' });
      await comparisonLink.focus(); await page.keyboard.type('x');
      assert.equal(await input.inputValue(), '');
      assert.equal(await comparisonLink.evaluate(el => el === document.activeElement), true);
      for (const anchor of await page.locator('#output a').all()) {
        assert.equal(await anchor.getAttribute('target'), '_blank');
        assert.equal(await anchor.getAttribute('rel'), 'noopener noreferrer');
      }
      const popupPromise = page.waitForEvent('popup');
      await comparisonLink.click();
      const comparisonPage = await popupPromise;
      await comparisonPage.getByRole('button', { name: 'designs', exact: true }).click();
      await comparisonPage.getByRole('button', { name: 'current', exact: true }).first().click();
      assert.equal(await comparisonPage.locator('#comparison').isVisible(), true);
      await comparisonPage.getByRole('button', { name: 'Previous', exact: true }).click();
      assert.match(await comparisonPage.locator('#compare-frame').getAttribute('src'), /versions\/20261001-190313/);
      await comparisonPage.close();
      assert.equal(await page.locator('.entry').last().locator('a').innerText(), 'Open design comparison ↗');
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      assert.equal(await page.locator('#theme-label').innerText(), 'amber');
      await input.fill('theme r'); await input.press('Tab');
      assert.equal(await input.inputValue(), 'theme reset'); await input.press('Enter');
      assert.equal(await page.locator('#theme-label').innerText(), 'cyan');
      assert.equal(await page.evaluate(() => localStorage.getItem('terminal-theme')), null);
      await page.reload(); assert.equal(await page.locator('#theme-label').innerText(), 'cyan');
      await page.evaluate(() => localStorage.setItem('terminal-theme', 'violet'));
      await page.reload(); assert.equal(await page.locator('#theme-label').innerText(), 'cyan');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.evaluate(() => document.querySelector('.window').getBoundingClientRect().bottom <= innerHeight), true);
      await page.screenshot({ path: `/tmp/personal-terminal-${width}.png` });
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS ${width}px: commands, themes, completion, focus escape, history, safety, comparison, layout`);
    }
    const touchPage = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    await touchPage.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    assert.equal(await touchPage.locator('#command-input').evaluate(el => el === document.activeElement), false);
    await touchPage.locator('h1').tap();
    assert.equal(await touchPage.locator('#command-input').evaluate(el => el === document.activeElement), true);
    await touchPage.close();
    console.log('PASS touch: no initial autofocus; terminal tap focuses prompt');
    const blocked = await browser.newPage();
    const blockedErrors = [];
    blocked.on('pageerror', error => blockedErrors.push(error.message));
    await blocked.addInitScript(() => {
      for (const method of ['getItem', 'setItem', 'removeItem']) {
        Storage.prototype[method] = () => { throw new Error('Storage unavailable'); };
      }
    });
    await blocked.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    assert.equal(await blocked.locator('#theme-label').innerText(), 'cyan');
    for (const command of ['theme amber', 'theme reset']) {
      await blocked.locator('#command-input').fill(command);
      await blocked.locator('#command-input').press('Enter');
      assert.equal(await blocked.locator('#theme-label').innerText(), command === 'theme reset' ? 'cyan' : 'amber');
    }
    assert.deepEqual(blockedErrors, []);
    await blocked.close();
    console.log('PASS storage unavailable: startup, selection, reset');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
