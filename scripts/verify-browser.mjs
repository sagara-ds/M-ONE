import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { COMMANDS, MISSIONS, simulate } from '../src/app.js';

// Playwright is a development check only, never an application dependency.
// Example: PLAYWRIGHT_MODULE=/tmp/detektif-browser/node_modules/playwright/index.mjs node scripts/verify-browser.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.BROWSER_TEST_URL || 'http://127.0.0.1:4173';
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseURL).hostname), 'Use a local preview URL.');
const outputRoot = resolve(process.env.BROWSER_TEST_OUTPUT || 'docs');
await mkdir(resolve(outputRoot, 'screenshots'), { recursive: true });
const results = [];
const consoleErrors = [];
const requestFailures = [];
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
});

async function check(name, test) {
  const started = Date.now();
  try {
    const evidence = await test();
    results.push({ name, passed: true, milliseconds: Date.now() - started, evidence });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, milliseconds: Date.now() - started, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function makePage(options = {}, init) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  page.on('pageerror', error => consoleErrors.push({ kind: 'uncaught', error: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push({ kind: 'console', error: message.text(), location: message.location().url });
  });
  page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.goto(baseURL);
  await page.locator('[data-action="run"]').waitFor();
  return { page, context };
}

const action = (page, name) => page.locator(`[data-action="${name}"]`);
const readCount = async page => Number((await page.locator('.playback-count').textContent()).split('/')[0].trim());
async function programLabels(page) {
  return page.locator('.command-copy strong').allTextContents();
}
async function setProgram(page, program) {
  while (await action(page, 'remove-command').count()) await action(page, 'remove-command').first().click();
  assert.equal(await page.locator('.empty-program').count(), 1);
  for (const command of program) await page.locator(`[data-action="add-command"][data-command="${command}"]`).click();
  assert.deepEqual(await programLabels(page), program.map(command => COMMANDS[command].label));
}
async function snapshot(page) {
  return page.evaluate(() => {
    const position = document.querySelector('.robot-position');
    return {
      x: Number(position.style.getPropertyValue('--robot-x')),
      y: Number(position.style.getPropertyValue('--robot-y')),
      readout: document.querySelector('.step-readout strong').textContent,
      activeCard: Number(document.querySelector('.command-card.is-current')?.dataset.commandIndex),
      carried: !document.querySelector('.carried-book').hidden,
      bookVisible: !document.querySelector('.book-object').hidden,
      rotation: document.querySelector('.robot-direction').style.transform,
    };
  });
}
async function solveWithClicks(page, mission) {
  await setProgram(page, mission.solution);
  const expected = simulate(mission.solution, mission);
  for (let i = 1; i < expected.steps.length; i += 1) {
    await action(page, 'step').click();
    assert.equal(await readCount(page), i);
    const actual = await snapshot(page);
    const step = expected.steps[i];
    assert.equal(actual.x, step.robot.x);
    assert.equal(actual.y, step.robot.y);
    const degrees = Number(actual.rotation.match(/rotate\((-?[\d.]+)deg\)/)[1]);
    assert.equal(((degrees % 360) + 360) % 360, step.robot.dir * 90);
    assert.equal(actual.carried, step.robot.carrying && !step.robot.delivered);
    assert.equal(actual.bookVisible, !step.robot.carrying && !step.robot.delivered);
    assert.equal(actual.activeCard, step.programIndex);
    if (step.repeatTotal > 1) assert.match(actual.readout, new RegExp(`${step.repeatIndex} dari ${step.repeatTotal}`));
  }
  await page.locator('.result-success').waitFor();
  assert.equal(await page.locator('.mission-item.is-done').count(), mission.id);
  return { cards: mission.solution.length, simulatedSteps: expected.steps.length - 1 };
}

try {
  const { page, context } = await makePage();
  await check('Awal: suara mati, misi berikutnya terkunci', async () => {
    assert.equal(await action(page, 'toggle-sound').getAttribute('aria-pressed'), 'false');
    assert.equal(await action(page, 'toggle-voice').getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('.mission-item:disabled').count(), 5);
    assert.deepEqual(await programLabels(page), MISSIONS[0].initial.map(command => COMMANDS[command].label));
    return { lockedMissions: 5, sound: false, voice: false };
  });
  await check('Kartu dapat dinaikkan, diturunkan, dihapus, dan ditambah melalui klik', async () => {
    const initial = [...MISSIONS[0].initial];
    await page.locator('[data-action="move-down"][data-index="0"]').click();
    assert.deepEqual(await programLabels(page), [initial[1], initial[0], ...initial.slice(2)].map(command => COMMANDS[command].label));
    await page.locator('[data-action="move-up"][data-index="1"]').click();
    assert.deepEqual(await programLabels(page), initial.map(command => COMMANDS[command].label));
    await page.locator('[data-action="remove-command"][data-index="1"]').click();
    assert.equal(await action(page, 'remove-command').count(), initial.length - 1);
    await page.locator('[data-action="add-command"][data-command="left"]').click();
    assert.equal((await programLabels(page)).at(-1), COMMANDS.left.label);
    await action(page, 'reset').click();
    assert.deepEqual(await programLabels(page), initial.map(command => COMMANDS[command].label));
  });
  for (const mission of MISSIONS) {
    await check(`Misi ${mission.id}: program awal gagal, tiga petunjuk, ulangi`, async () => {
      assert.equal(await page.locator('.mission-heading h2').textContent(), mission.title);
      await action(page, 'run').click();
      assert.equal(await action(page, 'run').isDisabled(), true);
      assert.equal(await action(page, 'hint').isDisabled(), true);
      assert.equal(await page.locator('.palette-button:not(:disabled)').count(), 0);
      await page.locator('.result-error').waitFor({ timeout: 16000 });
      const failure = await page.locator('.result-error p').textContent();
      assert.ok(failure.length > 0);
      const hints = [];
      for (let i = 1; i <= 3; i += 1) {
        await action(page, 'hint').click();
        assert.equal(await page.locator('.hint-box strong').textContent(), `Petunjuk ${i}`);
        hints.push(await page.locator('.hint-box p').textContent());
      }
      assert.equal(new Set(hints).size, 3);
      assert.equal(await action(page, 'hint').isDisabled(), true);
      await action(page, 'reset').click();
      assert.equal(await page.locator('.hint-box').count(), 0);
      assert.equal(await readCount(page), 0);
      assert.deepEqual(await programLabels(page), mission.initial.map(command => COMMANDS[command].label));
      return { failure, hints };
    });
    await check(`Misi ${mission.id}: solusi melalui klik dan tiap langkah robot cocok`, () => solveWithClicks(page, mission));
    if (mission.id < MISSIONS.length) await action(page, 'next-mission').click();
  }
  await check('Enam misi selesai dan progres bertahan setelah reload', async () => {
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('detektif-bug-progress-v1')));
    assert.deepEqual(progress.completed, Array(6).fill(true));
    await page.reload();
    assert.equal(await page.locator('.mission-item.is-done').count(), 6);
    assert.equal(await page.locator('.mission-item:disabled').count(), 0);
    return { completed: progress.completed };
  });
  await check('Pengulangan menampilkan 1/3, 2/3, 3/3 pada kartu yang sama', async () => {
    await page.locator('[data-action="select-mission"][data-index="2"]').click();
    await setProgram(page, ['loop3']);
    const evidence = [];
    for (let index = 1; index <= 3; index += 1) {
      await action(page, 'step').click();
      const current = await snapshot(page);
      assert.equal(current.x, index);
      assert.match(current.readout, new RegExp(`${index} dari 3`));
      assert.equal(await page.locator('.command-progress').textContent(), `Ulangan ${index} dari 3`);
      evidence.push(current.readout);
    }
    await page.locator('.result-error').waitFor();
    return evidence;
  });
  await check('Animasi robot bergerak antarp petak dan arah kiri berputar negatif', async () => {
    await page.locator('[data-action="select-mission"][data-index="0"]').click();
    await setProgram(page, ['left', 'right', 'forward']);
    await action(page, 'step').click();
    assert.equal((await snapshot(page)).rotation, 'rotate(-90deg)');
    await action(page, 'step').click();
    assert.equal((await snapshot(page)).rotation, 'rotate(0deg)');
    await page.waitForTimeout(500);
    const before = await page.locator('.robot-position').evaluate(element => {
      window.__robotElementBeforeMove = element;
      return { left: element.getBoundingClientRect().left, width: element.getBoundingClientRect().width };
    });
    await action(page, 'step').click();
    assert.equal(await page.locator('.robot-position').evaluate(element => element === window.__robotElementBeforeMove), true);
    await page.waitForTimeout(230);
    const during = await page.locator('.robot-position').evaluate(element => element.getBoundingClientRect().left);
    assert.ok(during > before.left, `Robot did not leave its previous cell: ${JSON.stringify({ before, during })}`);
    await page.locator('.result-error').waitFor();
    const after = await page.locator('.robot-position').evaluate(element => element.getBoundingClientRect().left);
    const gap = await page.locator('.map-grid').evaluate(element => Number.parseFloat(getComputedStyle(element).columnGap));
    assert.ok(Math.abs(after - before.left - before.width - gap) < 1, JSON.stringify({ before, after, gap }));
    await action(page, 'reset').click();
    return { leftDegrees: -90, rightDegrees: 0, displacement: after - before.left, cellPitch: before.width + gap };
  });
  await check('Jeda menahan langkah dan lanjutkan meneruskan langkah berikutnya', async () => {
    await action(page, 'reset').click();
    await action(page, 'run').click();
    await page.waitForFunction(() => document.querySelector('.playback-count').textContent.trim().startsWith('1 /'));
    await action(page, 'pause').click();
    const pausedStep = await readCount(page);
    assert.match(await action(page, 'run').textContent(), /Lanjutkan program/);
    await page.waitForTimeout(1100);
    assert.equal(await readCount(page), pausedStep);
    await action(page, 'run').click();
    await page.waitForFunction(step => Number(document.querySelector('.playback-count').textContent.split('/')[0].trim()) === step + 1, pausedStep);
    await action(page, 'pause').click();
    await action(page, 'reset').click();
    return { pausedStep, resumedStep: pausedStep + 1 };
  });
  await check('Ulangi lalu segera jalankan membatalkan timer percobaan lama', async () => {
    await page.locator('[data-action="select-mission"][data-index="0"]').click();
    await action(page, 'run').click();
    await page.waitForTimeout(80);
    await action(page, 'reset').click();
    await action(page, 'run').click();
    await page.waitForTimeout(600);
    assert.equal(await readCount(page), 1);
    assert.equal(await page.locator('.result-running').count(), 1);
    await action(page, 'reset').click();
    await setProgram(page, MISSIONS[0].solution);
    for (let i = 0; i < simulate(MISSIONS[0].solution, MISSIONS[0]).steps.length - 1; i += 1) await action(page, 'step').click();
    await action(page, 'reset').click();
    await action(page, 'run').click();
    await page.waitForTimeout(600);
    assert.equal(await readCount(page), 1);
    assert.equal(await page.locator('.result-running').count(), 1);
    assert.equal(await page.locator('.result-success').count(), 0);
    await action(page, 'reset').click();
    return { cancelledInitialTick: true, cancelledOldSuccess: true };
  });
  for (const width of [375, 768, 1024, 1440]) {
    await check(`Tampilan ${width}px: tidak ada overflow mendatar`, async () => {
      await page.setViewportSize({ width, height: 1000 });
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
      assert.ok(dimensions.document <= width, JSON.stringify(dimensions));
      assert.ok(dimensions.body <= width, JSON.stringify(dimensions));
      return dimensions;
    });
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await check('Ponsel 375px: jalankan membawa peta ke layar', async () => {
    await action(page, 'run').click();
    await page.waitForTimeout(850);
    const visibleMap = await page.locator('.map-grid').evaluate(element => ({ top: element.getBoundingClientRect().top, bottom: element.getBoundingClientRect().bottom, viewport: innerHeight }));
    assert.ok(visibleMap.top >= 0 && visibleMap.bottom <= visibleMap.viewport, JSON.stringify(visibleMap));
    assert.equal(await page.locator('.simulation-card').evaluate(element => element === document.activeElement), true);
    await action(page, 'reset').click();
    return { map: visibleMap, focusedSimulationPanel: true };
  });
  await page.screenshot({ path: resolve(outputRoot, 'screenshots/mobile-375.png'), fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.workspace-grid').evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 18));
  await page.locator('.workspace-grid').screenshot({ path: resolve(outputRoot, 'screenshots/desktop-board.png'), animations: 'disabled' });
  await context.close();

  // Instrument real native Web Audio methods; no synthesized fake audio engine.
  const audioSession = await makePage({}, () => {
    window.__audioProbe = { constructions: 0, resumes: 0, starts: [], stops: [], gains: [], frequencySets: [], contexts: [] };
    const NativeAudioContext = window.AudioContext;
    class ObservedAudioContext extends NativeAudioContext {
      constructor(...args) {
        super(...args);
        window.__audioProbe.constructions += 1;
        window.__audioProbe.contexts.push(this);
      }
      resume(...args) {
        window.__audioProbe.resumes += 1;
        return super.resume(...args);
      }
      createOscillator(...args) {
        const oscillator = super.createOscillator(...args);
        const originalStart = oscillator.start.bind(oscillator);
        const originalStop = oscillator.stop.bind(oscillator);
        const originalFrequencySet = oscillator.frequency.setValueAtTime.bind(oscillator.frequency);
        let scheduledFrequency = oscillator.frequency.value;
        oscillator.frequency.setValueAtTime = (value, at) => {
          scheduledFrequency = value;
          window.__audioProbe.frequencySets.push({ frequency: value, at });
          return originalFrequencySet(value, at);
        };
        oscillator.start = (...values) => {
          window.__audioProbe.starts.push({ frequency: scheduledFrequency, at: values[0] });
          return originalStart(...values);
        };
        oscillator.stop = (...values) => {
          window.__audioProbe.stops.push(values[0] ?? null);
          return originalStop(...values);
        };
        return oscillator;
      }
      createGain(...args) {
        const gain = super.createGain(...args);
        const set = gain.gain.setValueAtTime.bind(gain.gain);
        gain.gain.setValueAtTime = (value, at) => {
          window.__audioProbe.gains.push(value);
          return set(value, at);
        };
        return gain;
      }
    }
    window.AudioContext = ObservedAudioContext;
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [{ lang: 'en-US', name: 'English test voice' }],
        cancel: () => {},
        speak: () => { window.__speechCalls = (window.__speechCalls || 0) + 1; },
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  const audioPage = audioSession.page;
  await check('Web Audio asli: tidak otomatis, aktif setelah klik, menjadwalkan efek gerak', async () => {
    await action(audioPage, 'hint').click();
    assert.equal(await audioPage.evaluate(() => window.__audioProbe.constructions), 0);
    await action(audioPage, 'toggle-sound').click();
    await audioPage.waitForFunction(() => window.__audioProbe.starts.length > 0);
    const initial = await audioPage.evaluate(() => ({ constructions: window.__audioProbe.constructions, states: window.__audioProbe.contexts.map(context => context.state), starts: window.__audioProbe.starts.length }));
    assert.equal(initial.constructions, 1);
    assert.deepEqual(initial.states, ['running']);
    await action(audioPage, 'reset').click();
    await action(audioPage, 'step').click();
    const after = await audioPage.evaluate(() => window.__audioProbe.starts);
    assert.ok(after.length > initial.starts);
    assert.ok(after.some(tone => tone.frequency === 440));
    assert.ok(after.some(tone => tone.frequency === 554));
    assert.ok(after.every(tone => Number.isFinite(tone.at) && tone.at >= 0));
    return { contextStates: initial.states, scheduledOscillators: after.length, frequencies: [...new Set(after.map(tone => tone.frequency))], audibleListening: false };
  });
  await check('Suara dimatikan: tidak menjadwalkan oscillator baru', async () => {
    await action(audioPage, 'toggle-sound').click();
    const before = await audioPage.evaluate(() => window.__audioProbe.starts.length);
    await action(audioPage, 'reset').click();
    await action(audioPage, 'step').click();
    await action(audioPage, 'hint').click();
    await audioPage.waitForTimeout(200);
    assert.equal(await audioPage.evaluate(() => window.__audioProbe.starts.length), before);
    assert.ok(await audioPage.evaluate(() => window.__audioProbe.gains.includes(0)));
    return { oscillatorStartsBefore: before, oscillatorStartsAfter: before };
  });
  await check('Bacaan tanpa suara Indonesia: fallback teks tanpa membaca bahasa lain', async () => {
    await action(audioPage, 'toggle-voice').click();
    await audioPage.waitForFunction(() => document.querySelector('#audio-note').textContent.includes('Suara bahasa Indonesia belum tersedia'));
    assert.equal(await audioPage.evaluate(() => window.__speechCalls || 0), 0);
    assert.equal(await action(audioPage, 'read-mission').isDisabled(), false);
    await action(audioPage, 'read-mission').click();
    assert.equal(await audioPage.evaluate(() => window.__speechCalls || 0), 0);
    return { note: await audioPage.locator('#audio-note').textContent(), speechCalls: 0, simulatedVoiceAvailability: 'English only' };
  });
  await check('Volume, bacaan, gerak tenang, kecepatan tersimpan setelah reload', async () => {
    await action(audioPage, 'toggle-sound').click();
    await action(audioPage, 'toggle-calm').click();
    assert.match(await audioPage.locator('#audio-note').textContent(), /Suara bahasa Indonesia belum tersedia/);
    await audioPage.locator('#sound-volume').focus();
    await audioPage.locator('#sound-volume').press('Home');
    for (let i = 0; i < 5; i += 1) await audioPage.locator('#sound-volume').press('ArrowRight');
    await audioPage.locator('#playback-pace').selectOption('slow');
    const saved = await audioPage.evaluate(() => JSON.parse(localStorage.getItem('detektif-bug-preferences-v1')));
    assert.deepEqual(saved, { sound: true, voice: true, volume: 0.25, calm: true, pace: 'slow' });
    await audioPage.reload();
    assert.equal(await action(audioPage, 'toggle-sound').getAttribute('aria-pressed'), 'true');
    assert.equal(await action(audioPage, 'toggle-voice').getAttribute('aria-pressed'), 'true');
    assert.equal(await action(audioPage, 'toggle-calm').getAttribute('aria-pressed'), 'true');
    assert.equal(await audioPage.locator('#sound-volume').inputValue(), '25');
    assert.equal(await audioPage.locator('#playback-pace').inputValue(), 'slow');
    assert.equal(await audioPage.evaluate(() => document.documentElement.classList.contains('calm-motion')), true);
    assert.equal(await audioPage.evaluate(() => window.__audioProbe.constructions), 0);
    return { saved, noAudioContextOnReload: true };
  });
  await audioSession.context.close();

  const reduced = await makePage({ reducedMotion: 'reduce' });
  await check('Reduced motion: gerak tenang, tanpa transisi dan confetti, misi tetap berfungsi', async () => {
    assert.equal(await action(reduced.page, 'toggle-calm').isDisabled(), true);
    assert.equal(await action(reduced.page, 'toggle-calm').getAttribute('aria-pressed'), 'true');
    assert.equal(await reduced.page.evaluate(() => getComputedStyle(document.querySelector('.robot-position')).transitionDuration), '0s');
    assert.equal(await reduced.page.evaluate(() => getComputedStyle(document.querySelector('.robot-art')).animationName), 'none');
    await solveWithClicks(reduced.page, MISSIONS[0]);
    assert.equal(await reduced.page.locator('.confetti').count(), 0);
    return { transitionDuration: '0s', heroAnimation: 'none', confetti: 0, missionSuccess: true };
  });
  await reduced.context.close();

  await check('Browser tidak mencatat exception, console error, atau kegagalan request', async () => {
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(requestFailures, []);
    return { consoleErrors: 0, failedRequests: 0 };
  });
} finally {
  await browser.close();
  const report = {
    checkedAt: new Date().toISOString(),
    target: baseURL,
    browser: 'Chromium headless',
    method: 'UI clicks and native Web Audio instrumentation; speech fallback uses injected English-only voice availability',
    limits: ['Sound was scheduled in native Web Audio but was not listened to by a person.', 'No child or teacher user study was performed.', 'Speech quality depends on real device voices.'],
    passed: results.filter(result => result.passed).length,
    failed: results.filter(result => !result.passed).length,
    results,
    consoleErrors,
    requestFailures,
  };
  await writeFile(resolve(outputRoot, 'browser-results.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Browser checks: ${report.passed} passed, ${report.failed} failed. Report: ${resolve(outputRoot, 'browser-results.json')}`);
  if (report.failed) process.exitCode = 1;
}
