// ============================================================
// HOME PAGE — side menu + theme toggle
// ============================================================

(function () {
    'use strict';

    // ---- Side menu ----
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('sideMenu');
    const backdrop = document.getElementById('menuBackdrop');

    function openMenu() {
        if (!menu || !backdrop) return;
        menu.hidden = false;
        backdrop.hidden = false;
        requestAnimationFrame(function () {
            menu.classList.add('open');
            backdrop.classList.add('open');
        });
    }
    function closeMenu() {
        if (!menu || !backdrop) return;
        menu.classList.remove('open');
        backdrop.classList.remove('open');
        setTimeout(function () {
            menu.hidden = true;
            backdrop.hidden = true;
        }, 200);
    }
    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            if (menu.classList.contains('open')) closeMenu();
            else openMenu();
        });
    }
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // ---- Theme toggle ----
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const iconEl = btn.querySelector('.theme-icon');
    const labelEl = btn.querySelector('.theme-label');

    function applyIcon() {
        const light = document.documentElement.classList.contains('light');
        if (iconEl) iconEl.textContent = light ? '🌙' : '☀️';
        if (labelEl) labelEl.textContent = light ? 'Dark mode' : 'Light mode';
    }
    applyIcon();

    btn.addEventListener('click', function () {
        document.documentElement.classList.toggle('light');
        const light = document.documentElement.classList.contains('light');
        localStorage.setItem('uniPath_theme', light ? 'light' : 'dark');
        applyIcon();
    });
})();