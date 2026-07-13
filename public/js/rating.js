document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stability-rating').forEach(el => {
    const rating = Math.max(0, Math.min(5, parseFloat(el.dataset.rating) || 0));
    const percent = (rating / 5) * 100;
    const fill = el.querySelector('.fill');
    if (fill) fill.style.width = percent + '%';

    // mark whole stars
    const stars = el.querySelectorAll('.stability-star');
    stars.forEach((s, i) => {
      if (i < Math.floor(rating)) s.classList.add('filled'); else s.classList.remove('filled');
    });

    // update numeric value if present
    const val = el.querySelector('.stability-value');
    if (val) val.textContent = rating.toFixed(1);
  });
});
