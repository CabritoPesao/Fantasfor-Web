const form = document.getElementById('siteSearch');
const input = document.getElementById('q');
const clearBtn = document.getElementById('clear');

clearBtn.addEventListener('click', () => {
  input.value = '';
  input.focus();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value.trim();
  if (!val) { input.focus(); return; }

  const base = form.dataset.searchUrl || '/search';
  const url = `${base}?q=${encodeURIComponent(val)}`;
  window.location.href = url;
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    input.value = '';
    input.blur();
  }
});
