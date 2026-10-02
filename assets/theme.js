// Restore before styles load to avoid flashing the default palette.
(() => {
  try {
    const saved = localStorage.getItem('terminal-theme');
    if (['cyan', 'lime', 'amber'].includes(saved)) {
      document.documentElement.dataset.theme = saved;
    }
  } catch {
    // Storage may be unavailable; the default cyan theme remains usable.
  }
})();
