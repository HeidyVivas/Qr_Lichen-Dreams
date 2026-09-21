#!/usr/bin/env node
/**
 * generate-versions.js
 * Genera docs/js/versions.js a partir de GitHub Releases.
 * Fuente de datos: GitHub API + assets APK.
 * Salida: archivo JS con array VERSIONS y objeto VersionService idéntico al actual.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const REPO = process.env.REPOSITORY || 'HeidyVivas/Qr_Lichen-Dreams';
const TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'js', 'versions.js');
const EXISTING_FILE = OUTPUT_FILE;

const APK_PATTERN = /^Lichen_Dreams_v.+\.apk$/i;

function log(level, msg) {
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`[generate-versions] ${prefix} ${msg}`);
}

function ghRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${REPO}${endpoint}`;
    const options = {
      headers: {
        'User-Agent': 'generate-versions-script',
        'Accept': 'application/vnd.github+json',
        ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {})
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'generate-versions-script' } }, (res) => {
      if (res.statusCode >= 400) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    }).on('error', reject);
  });
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function extractVersionCode(apkPath) {
  try {
    const result = execSync(`aapt dump badging "${apkPath}" 2>/dev/null | grep -oP "versionCode='\\K[^']+"`, { encoding: 'utf8', timeout: 30000 });
    const versionCode = result.trim();
    if (/^\d+$/.test(versionCode)) {
      return parseInt(versionCode, 10);
    }
  } catch (e) {
    log('warn', `No se pudo extraer versionCode del APK: ${e.message}`);
  }
  return null;
}

function parseChangelog(body) {
  if (!body || !body.trim()) return [];
  const lines = body.split('\n');
  const changelog = [];
  let inSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,3}\s/.test(trimmed)) {
      inSection = /cambios|changes|changelog|novedades|features?|fixes?/i.test(trimmed);
      continue;
    }
    if (inSection && /^[-*•]\s+/.test(trimmed)) {
      const item = trimmed.replace(/^[-*•]\s+/, '').trim();
      if (item) changelog.push(item);
    }
  }
  return changelog;
}

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(iso) {
  return iso.split('T')[0];
}

function semverCompare(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pb[i] - pa[i];
  }
  return 0;
}

function loadExistingVersions() {
  try {
    const content = fs.readFileSync(EXISTING_FILE, 'utf8');
    const match = content.match(/const VERSIONS = (\[[\s\S]*?\]);/);
    if (match) {
      return eval('(' + match[1] + ')');
    }
  } catch (e) {
    log('warn', `No se pudo leer versions.js existente: ${e.message}`);
  }
  return [];
}

function mergeWithExisting(generated, existing) {
  const existingMap = new Map(existing.map(v => [v.version, v]));
  return generated.map(gen => {
    const existing = existingMap.get(gen.version);
    if (existing) {
      return {
        ...gen,
        build: gen.build !== null ? gen.build : existing.build,
        sha256: gen.sha256 || existing.sha256,
        size: gen.size || existing.size,
        changelog: gen.changelog.length ? gen.changelog : existing.changelog,
      };
    }
    return gen;
  });
}

function generateVersionsJS(versions) {
  const header = `/**
 * Versions Data Layer
 * ====================
 * Fuente de datos centralizada. Generado automáticamente desde GitHub Releases.
 * Para cambiar la fuente (JSON local, GitHub Releases API),
 * solo modifica las funciones dentro de VersionService.
 * La UI nunca accede directamente a VERSIONS.
 */

`;

  const versionsStr = JSON.stringify(versions, null, 2)
    .replace(/"version"/g, 'version')
    .replace(/"build"/g, 'build')
    .replace(/"date"/g, 'date')
    .replace(/"size"/g, 'size')
    .replace(/"sha256"/g, 'sha256')
    .replace(/"url"/g, 'url')
    .replace(/"changelog"/g, 'changelog');

  const service = `
const VersionService = {
  async getVersions() { return VERSIONS; },
  async getLatest() { return VERSIONS.length > 0 ? VERSIONS[0] : null; },
  async getByVersion(name) { return VERSIONS.find(v => v.version === name) || null; },
  async getPrevious() { return VERSIONS.slice(1); },
  async getDownloadUrl(name) { const v = await this.getByVersion(name); return v ? v.url : null; }
};`;

  return header + 'const VERSIONS = ' + versionsStr + ';\n\n' + service + '\n';
}

async function main() {
  log('info', `Iniciando sincronización para ${REPO}`);

  const existingVersions = loadExistingVersions();
  log('info', `Versiones existentes cargadas: ${existingVersions.length}`);

  const releases = await ghRequest('/releases?per_page=100');
  log('info', `Releases obtenidos: ${releases.length}`);

  const publishedReleases = releases.filter(r => !r.draft && !r.prerelease);
  log('info', `Releases publicados (no draft/prerelease): ${publishedReleases.length}`);

  const generatedVersions = [];

  for (const release of publishedReleases) {
    const tag = release.tag_name;
    const version = tag.startsWith('v') ? tag.slice(1) : tag;
    const date = formatDate(release.published_at);
    const changelog = parseChangelog(release.body);

    const apkAssets = release.assets.filter(a => APK_PATTERN.test(a.name));
    if (apkAssets.length === 0) {
      log('warn', `Release ${tag}: sin APK válido (assets: ${release.assets.map(a => a.name).join(', ') || 'ninguno'})`);
      continue;
    }

    let selectedAsset = apkAssets[0];
    if (apkAssets.length > 1) {
      const exactMatch = apkAssets.find(a => a.name === `Lichen_Dreams_v${version}.apk`);
      if (exactMatch) selectedAsset = exactMatch;
      else {
        log('warn', `Release ${tag}: múltiples APK (${apkAssets.map(a => a.name).join(', ')}), usando ${selectedAsset.name}`);
      }
    }

    log('info', `Procesando ${tag} → APK: ${selectedAsset.name}`);

    const tempApk = path.join('/tmp', selectedAsset.name);
    try {
      await downloadFile(selectedAsset.browser_download_url, tempApk);
    } catch (e) {
      log('error', `Release ${tag}: error descargando APK: ${e.message}`);
      continue;
    }

    let sha256 = '';
    try {
      sha256 = await sha256File(tempApk);
      log('info', `Release ${tag}: SHA-256 calculado`);
    } catch (e) {
      log('error', `Release ${tag}: error calculando SHA-256: ${e.message}`);
      fs.unlinkSync(tempApk);
      continue;
    }

    let build = null;
    try {
      build = extractVersionCode(tempApk);
      if (build !== null) log('info', `Release ${tag}: versionCode=${build}`);
    } catch (e) {
      log('warn', `Release ${tag}: error extrayendo versionCode: ${e.message}`);
    }

    fs.unlinkSync(tempApk);

    generatedVersions.push({
      version,
      build,
      date,
      size: formatSize(selectedAsset.size),
      sha256,
      url: selectedAsset.browser_download_url,
      changelog
    });
  }

  generatedVersions.sort((a, b) => semverCompare(a.version, b.version));

  const mergedVersions = mergeWithExisting(generatedVersions, existingVersions);

  const content = generateVersionsJS(mergedVersions);

  const currentContent = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : '';
  const changed = currentContent !== content;

  if (changed) {
    fs.writeFileSync(OUTPUT_FILE, content);
    log('info', `versions.js actualizado (${mergedVersions.length} versiones)`);
  } else {
    log('info', 'versions.js sin cambios');
  }

  console.log(`changed=${changed}`);
  console.log(`count=${mergedVersions.length}`);
  console.log(`latest=${mergedVersions[0]?.version || 'none'}`);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `count=${mergedVersions.length}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `latest=${mergedVersions[0]?.version || 'none'}\n`);
  }
}

main().catch(err => {
  log('error', `Fallo crítico: ${err.message}`);
  process.exit(1);
});