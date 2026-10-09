import { createHash } from 'node:crypto';
import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MISSIONS, STAGES } from '../src/missions.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = [
  ['index.html', ['text/html', 'application/xhtml+xml']],
  ['src/app.js', ['text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript']],
  ['src/missions.js', ['text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript']],
  ['src/progress.js', ['text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript']],
  ['src/feedback.js', ['text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript']],
  ['src/style.css', ['text/css']],
  ['public/favicon.svg', ['image/svg+xml']],
  ['public/fonts/baloo-2-latin-700-normal.woff2', ['font/woff2', 'application/font-woff2', 'application/octet-stream']],
  ['public/fonts/comic-neue-latin-400-normal.woff2', ['font/woff2', 'application/font-woff2', 'application/octet-stream']],
  ['public/fonts/comic-neue-latin-700-normal.woff2', ['font/woff2', 'application/font-woff2', 'application/octet-stream']],
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

function localAddress(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')
    || host === '::1' || host === '::' || /^(?:f[cd][\da-f]{2}:|fe[89ab][\da-f]:)/i.test(host)) return true;
  const mapped = host.match(/^::ffff:([\da-f]{1,4}):([\da-f]{1,4})$/i);
  const ipv4 = mapped ? [parseInt(mapped[1], 16) >> 8, parseInt(mapped[1], 16) & 255,
    parseInt(mapped[2], 16) >> 8, parseInt(mapped[2], 16) & 255] : host.split('.').map(Number);
  return ipv4.length === 4 && ipv4.every(Number.isInteger) && (ipv4[0] === 0 || ipv4[0] === 10
    || ipv4[0] === 127 || (ipv4[0] === 169 && ipv4[1] === 254)
    || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31)
    || (ipv4[0] === 192 && ipv4[1] === 168) || (ipv4[0] === 100 && ipv4[1] >= 64 && ipv4[1] <= 127));
}

function siteUrl(input) {
  if (!input) throw new Error('Berikan URL lewat argumen atau DEPLOYED_SITE_URL.');
  let url;
  try { url = new URL(input); } catch { throw new Error('URL website tidak valid.'); }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('URL website harus tanpa kredensial, query, atau fragment.');
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopbackHosts.has(url.hostname))) {
    throw new Error('Gunakan HTTPS; HTTP hanya diizinkan untuk localhost, 127.0.0.1, atau ::1.');
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return { baseUrl: url.href, mode: localAddress(url.hostname) ? 'local' : 'public' };
}

function attemptsLimit() {
  const value = process.env.DEPLOYMENT_ATTEMPTS ?? '6';
  if (!/^[1-6]$/.test(value)) throw new Error('DEPLOYMENT_ATTEMPTS harus angka 1 sampai 6.');
  return Number(value);
}

function safeCode(error) {
  const code = error?.cause?.code || error?.code || error?.name;
  return typeof code === 'string' && /^[A-Za-z0-9_]+$/.test(code) ? code : 'ERROR';
}

async function checkAsset(baseUrl, asset) {
  const result = { path: asset.path, status: null, contentType: null,
    expectedSha256: asset.expectedSha256, actualSha256: null, success: false };
  try {
    const response = await fetch(new URL(asset.path, baseUrl), {
      // Each public asset must answer directly. Redirects are reported as HTTP
      // failures so they cannot bypass HTTPS/loopback validation.
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(10_000),
    });
    result.status = response.status;
    result.contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (response.status !== 200) {
      await response.body?.cancel();
      return { ...result, error: `HTTP ${response.status}; aset harus menjawab HTTP 200.`, retryable: true };
    }
    // Node fetch decodes transfer compression. Hash the decoded bytes, including
    // the entire body, while the same ten-second signal remains active.
    const bytes = Buffer.from(await response.arrayBuffer());
    result.actualSha256 = sha256(bytes);
    if (!asset.types.includes(result.contentType)) {
      return { ...result, error: 'Content-Type tidak sesuai jenis berkas.', retryable: false };
    }
    if (result.actualSha256 !== asset.expectedSha256) {
      return { ...result, error: 'SHA-256 berbeda dari checkout; deployment/cache belum memuat berkas terbaru.', retryable: true };
    }
    return { ...result, success: true };
  } catch (error) {
    return { ...result, error: `Permintaan belum dapat diverifikasi (${safeCode(error)}).`, retryable: false };
  }
}

async function main() {
  const { baseUrl, mode } = siteUrl(process.argv[2] || process.env.DEPLOYED_SITE_URL);
  const limit = attemptsLimit();
  const commitSha = process.env.COMMIT_SHA || null;
  if (commitSha && !/^[a-f0-9]{7,64}$/i.test(commitSha)) throw new Error('COMMIT_SHA harus berupa hash Git.');
  const expected = await Promise.all(assets.map(async ([path, types]) => ({
    path, types, expectedSha256: sha256(await readFile(resolve(root, path))),
  })));
  const manifestSha256 = sha256(expected.map(asset => `${asset.path}\0${asset.expectedSha256}\n`).join(''));
  let checks = [];
  let attempts = 0;
  for (let attempt = 1; attempt <= limit; attempt += 1) {
    attempts = attempt;
    checks = await Promise.all(expected.map(asset => checkAsset(baseUrl, asset)));
    const failed = checks.filter(check => !check.success);
    if (!failed.length || failed.some(check => !check.retryable) || attempt === limit) break;
    console.log(`Deployment belum cocok pada ${failed.length} aset (percobaan ${attempt}/${limit}); periksa lagi dalam 5 detik.`);
    await new Promise(resolve => setTimeout(resolve, 5_000));
  }
  const success = checks.every(check => check.success);
  const report = { checkedAt: new Date().toISOString(), baseUrl, mode, commitSha,
    missions: MISSIONS.length, stages: STAGES.length, assetCount: checks.length,
    manifestSha256, attempts, success,
    checks: checks.map(({ retryable, ...check }) => check) };
  if (process.env.DEPLOYMENT_REPORT_PATH) {
    const reportPath = resolve(process.env.DEPLOYMENT_REPORT_PATH);
    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  }
  if (!success) {
    for (const check of checks.filter(check => !check.success)) console.error(`${check.path}: ${check.error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Deployment ${mode} terverifikasi: ${baseUrl}`);
  console.log(`${checks.length} aset HTTP 200 cocok dengan SHA-256 checkout; ${MISSIONS.length} misi, ${STAGES.length} stage.`);
  console.log(`SHA-256 manifest: ${manifestSha256}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY,
      `\nDeployment ${mode} diperiksa pada ${report.checkedAt}: <${baseUrl}>.\n\n` +
      `${checks.length} aset menjawab HTTP 200 dan cocok dengan SHA-256 checkout (${MISSIONS.length} misi, ${STAGES.length} stage).\n` +
      `SHA-256 manifest: \`${manifestSha256}\`.\n` +
      (commitSha ? `Commit: \`${commitSha}\`.\n` : ''), 'utf8');
  }
}

main().catch(error => {
  // Validation errors contain no supplied URL; filesystem/network details are
  // reduced to their code so credentials or injected environment text stay private.
  const message = error?.code ? `Pemeriksaan gagal (${safeCode(error)}).` : error.message;
  console.error(message);
  process.exitCode = 1;
});
