
// ==================== МОДАЛЬНОЕ ОКНО ====================
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const downloadBtn = document.getElementById('downloadBtn');
const closeModal = document.getElementById('closeModal');

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const image = card.getAttribute('data-image');
    const title = card.getAttribute('data-title');
    const description = card.getAttribute('data-description');
    const pdf = card.getAttribute('data-pdf');

    modalImage.src = image;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    if (pdf && pdf !== '#') {
      downloadBtn.setAttribute('href', pdf);
      downloadBtn.setAttribute('download', '');
    } else {
      downloadBtn.setAttribute('href', '#');
      downloadBtn.removeAttribute('download');
    }

    modal.classList.add('show');
    const hash = title.replace(/\s+/g, '-');
    history.replaceState(null, "", `#${hash}`);
  });
});

closeModal.addEventListener('click', () => {
  modal.classList.remove('show');
  history.replaceState(null, "", location.pathname);
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    history.replaceState(null, "", location.pathname);
  }
});

// ==================== ПОИСК ====================
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const searchForm = document.querySelector('.search-wrapper');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput.value.trim().toLowerCase();
  let found = false;

  document.querySelectorAll('.card').forEach(card => {
    const title = card.getAttribute('data-title')?.toLowerCase() || '';
    const description = card.getAttribute('data-description')?.toLowerCase() || '';
    const pdf = card.getAttribute('data-pdf')?.toLowerCase() || '';

    const match = title.includes(query) || description.includes(query) || pdf.includes(query);
    card.style.display = match ? 'block' : 'none';

    if (match) found = true;
  });

  noResults.style.display = found ? 'none' : 'block';
});

// ==================== УСЛОВИЯ ПОЛЬЗОВАНИЯ ====================
document.getElementById("termsBtn").addEventListener("click", () => {
  document.getElementById("termsModal").classList.add("show");
});
document.getElementById("closeTerms").addEventListener("click", () => {
  document.getElementById("termsModal").classList.remove("show");
});
document.getElementById("termsModal").addEventListener("click", (e) => {
  const modalContent = document.querySelector("#termsModal .modal-content");
  if (!modalContent.contains(e.target)) {
    document.getElementById("termsModal").classList.remove("show");
  }
});

// ==================== ЗАЩИТА ОТ ПРОСМОТРА КОДА ====================
/*
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F12') e.preventDefault();
  if (e.ctrlKey && ['u', 's'].includes(e.key.toLowerCase())) e.preventDefault();
  if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) e.preventDefault();
});
*/

// ==================== ПОДСТАВИТЬ PDF ИЗ GOOGLE SHEETS ====================
fetch("https://script.google.com/macros/s/AKfycbysxY9hP1_gHHiVZNdZ3p3vmXJj79nfJ6E7XnOKJPQstd4L2C-XjcYNK-EsmB1T0SUv/exec")
  .then(res => res.json())
  .then(data => {
    const allCards = document.querySelectorAll(".card");
    allCards.forEach(card => {
      const title = card.getAttribute("data-title");
      const match = data.find(item => item.name === title);
      if (match) {
        card.setAttribute("data-pdf", match.pdf);
      }
    });

    // Открыть модалку если есть hash
    const urlHash = decodeURIComponent(location.hash.slice(1)).replace(/-/g, ' ').toLowerCase();
    const targetCard = [...allCards].find(card => card.getAttribute("data-title").toLowerCase() === urlHash);
    if (targetCard) targetCard.click();
  });

  // ==================== ОТКРЫТИЕ КАРТОЧКИ ПО ЯКОРЮ ====================
window.addEventListener('DOMContentLoaded', () => {
  const hash = decodeURIComponent(window.location.hash.substring(1));
  if (!hash) return;

  const cards = document.querySelectorAll('.card');
  for (const card of cards) {
    const title = card.getAttribute('data-title') || '';
    const anchor = title.replace(/\s+/g, '-');
    if (anchor === hash) {
      card.click();
      break;
    }
  }
});
