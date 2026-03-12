#!/usr/bin/env node
/**
 * Note RSSからサムネイルURLを抽出してJSONファイルを生成
 * GitHub Actionsで実行（CORS制限なし）
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const RSS_URL = 'https://note.com/wabitsuki_seitai/rss';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseThumbnails(xmlText) {
  const map = {};
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const linkMatch = block.match(/<link>([^<]+)<\/link>/);
    const thumbMatch = block.match(/<media:thumbnail>([^<]+)<\/media:thumbnail>/);
    if (linkMatch && thumbMatch) {
      map[linkMatch[1].trim()] = thumbMatch[1].trim();
    }
  }
  return map;
}

fetchUrl(RSS_URL)
  .then(parseThumbnails)
  .then((thumbnails) => {
    const outputPath = path.join(__dirname, '..', 'data', 'note-thumbnails.json');
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(thumbnails, null, 2), 'utf8');
    console.log('Saved', Object.keys(thumbnails).length, 'thumbnails to', outputPath);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
