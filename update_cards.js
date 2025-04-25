
const fs = require("fs");
const https = require("https");

// 1. Путь к файлам
const imageFolder = "image/";
const indexPath = "index.html";
const apiUrl = "https://script.google.com/macros/s/AKfycbysxY9hP1_gHHiVZNdZ3p3vmXJj79nfJ6E7XnOKJPQstd4L2C-XjcYNK-EsmB1T0SUv/exec";

// 2. Получить список картинок из папки image/
function getLocalImageNames() {
  return fs.readdirSync(imageFolder)
    .filter(file => file.endsWith(".png"))
    .map(file => file.replace(".png", ""));
}

// 3. Получить JSON из Google Таблицы
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", err => reject(err));
  });
}

// 4. Прочитать index.html и найти уже вставленные названия
function getExistingCardTitles(html) {
  const regex = /data-title="(.*?)"/g;
  const titles = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    titles.push(match[1]);
  }
  return titles;
}

// 5. Генерация карточки
function createCardBlock(name, pdf) {
  return `
  <div class="card" data-title="${name}" data-description="" data-image="image/${name}.png" data-pdf="${pdf}">
    <img src="image/${name}.png" alt="${name}">
  </div>`;
}

// 6. Основная функция
async function run() {
  const localImages = getLocalImageNames();
  const remoteData = await fetchJson(apiUrl);
  const html = fs.readFileSync(indexPath, "utf8");
  const existingTitles = getExistingCardTitles(html);

  const newCards = [];

  for (const item of remoteData) {
    if (localImages.includes(item.name) && !existingTitles.includes(item.name)) {
      newCards.push(createCardBlock(item.name, item.pdf));
    }
  }

  if (newCards.length === 0) {
    console.log("Новых карточек нет.");
    return;
  }

  const updatedHtml = html.replace(
    /<main id="gallery">(\s*<!-- Пример карточек -->)?/,
    `<main id="gallery">\n${newCards.join("\n")}`
  );

  fs.writeFileSync(indexPath, updatedHtml, "utf8");
  console.log(`✅ Добавлено ${newCards.length} карточек в ${indexPath}`);
}

run();
