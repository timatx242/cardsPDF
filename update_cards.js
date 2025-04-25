
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Настройки ===
const SHEET_API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgrZHEq-8_2yEq4s5evI1JU6DOoku_ZqP_WkJMvcizs8lh3uoTzJlpdZYLfPGGbIt5FX7ljSgoBL1hiPLdS1IrZzm9nDBntlAKjZ1iEerssYdDt_xqDuH27Rioa3-WXikcC9iQlw1dhn2pxcHDHnsRinQAYXCr5GfYPmf4RT-0faMWXEJ15S7-tff9c76XS3QYE9-3r1NJ16dnV14MKKy8oBpIlq8FkkFKE1mxPOaykID9w82xtJtjC3-CJsdkB-HziwDuiJeoH6jlsdeBViFc_MYO-9A&lib=MHmJqwpiaLfj-qElDyyzwJ-7_LOrhYMhx'; // вставь свою ссылку
const IMAGE_DIR = path.join(__dirname, 'image');
const OUTPUT_FILE = path.join(__dirname, 'index.html');

// === Получить список PNG из папки ===
function getImageFiles() {
  return fs.readdirSync(IMAGE_DIR).filter(file => file.endsWith('.png'));
}

// === Получить данные из Google Sheets ===
async function fetchSheetData() {
  const res = await fetch(SHEET_API_URL);
  const data = await res.json();
  return data;
}

// === Сгенерировать HTML-карточки ===
function generateCards(images, sheetData) {
  const cards = [];

  images.forEach(filename => {
    const name = filename.replace('.png', '');
    const match = sheetData.find(item => item.name === name);
    const pdf = match?.pdf || '#';

    cards.push(`
      <div class="card" data-title="${name}" data-description="" data-image="image/${filename}" data-pdf="${pdf}">
        <img src="image/${filename}" alt="${name}">
      </div>
    `);
  });

  return cards.reverse().join('\n');
}

// === Вставить карточки в index.html ===
function updateHTML(cardsHTML) {
  const html = fs.readFileSync(OUTPUT_FILE, 'utf8');
  const $ = cheerio.load(html);
  $('#gallery').html(cardsHTML);
  fs.writeFileSync(OUTPUT_FILE, $.html(), 'utf8');
  console.log('✅ index.html обновлён');
}

// === Выполнить обновление ===
async function main() {
  const images = getImageFiles();
  const sheetData = await fetchSheetData();
  const cardsHTML = generateCards(images, sheetData);
  updateHTML(cardsHTML);
}

main().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
