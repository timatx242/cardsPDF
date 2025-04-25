import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === URL до скрипта Google Apps Script ===
const SHEET_API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgrZHEq-8_2yEq4s5evI1JU6DOoku_ZqP_WkJMvcizs8lh3uoTzJlpdZYLfPGGbIt5FX7ljSgoBL1hiPLdS1IrZzm9nDBntlAKjZ1iEerssYdDt_xqDuH27Rioa3-WXikcC9iQlw1dhn2pxcHDHnsRinQAYXCr5GfYPmf4RT-0faMWXEJ15S7-tff9c76XS3QYE9-3r1NJ16dnV14MKKy8oBpIlq8FkkFKE1mxPOaykID9w82xtJtjC3-CJsdkB-HziwDuiJeoH6jlsdeBViFc_MYO-9A&lib=MHmJqwpiaLfj-qElDyyzwJ-7_LOrhYMhx"; // ← вставь сюда свой

// === Пути ===
const IMAGES_DIR = path.join(__dirname, "image");
const HTML_FILE = path.join(__dirname, "index.html");

(async () => {
  const res = await fetch(SHEET_API_URL);
  const pdfData = await res.json();

  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(file => file.endsWith(".png"));

  const cards = imageFiles.map(img => {
    const baseName = path.basename(img, ".png");
    const pdfEntry = pdfData.find(item => item.name === baseName);

    return {
      name: baseName,
      pdf: pdfEntry ? pdfEntry.pdf : "#",
      imgPath: `image/${img}`
    };
  });

  const generatedHTML = cards.map(card => `
    <div class="card" data-title="${card.name}" data-description="" data-image="${card.imgPath}" data-pdf="${card.pdf}">
      <img src="${card.imgPath}" alt="${card.name}">
    </div>
  `).join("\n");

  let html = fs.readFileSync(HTML_FILE, "utf8");
  html = html.replace(
    /<main id="gallery">([\s\S]*?)<\/main>/,
    `<main id="gallery">\n${generatedHTML}\n</main>`
  );

  fs.writeFileSync(HTML_FILE, html, "utf8");
  console.log("✅ Готово! Файл index.html обновлён.");
})();
