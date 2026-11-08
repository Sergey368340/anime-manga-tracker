(function() {
    const startTime = performance.now();

    window.addEventListener('load', function() {
        const endTime = performance.now();

        const loadTime = (endTime - startTime).toFixed(2);

        const footer = document.querySelector('footer p');

        if (footer) {
            footer.insertAdjacentHTML(
                'beforeend',
                `<br><span class="load-time">Время загрузки: ${loadTime} мс</span>`
            );
        }

        console.log(`Время загрузки страницы: ${loadTime} мс`);
    });
})();

(function () {
  window.addEventListener('DOMContentLoaded', function () {
    const currentPath = normalizePath(window.location.pathname);

    const nav = document.querySelector('header nav');
    if (!nav) return;

    const navLinks = nav.querySelectorAll('a');

    navLinks.forEach(link => {
      const linkPath = normalizePath(
        new URL(link.href, window.location.origin).pathname
      );

      if (linkPath === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });

  function normalizePath(path) {
    if (path === '/' || path === '/index.html') return '';
    if (path.endsWith('/')) return path.slice(0, -1);
    return path;
  }
})();
