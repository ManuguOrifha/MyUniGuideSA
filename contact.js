// ============================================================
// CONTACT PAGE — theme toggle + copy-to-clipboard
// ============================================================

(function () {
    'use strict';

    // ---- Theme toggle ----
    const btn = document.getElementById('themeToggle');
    if (btn) {
        function applyIcon() {
            const light = document.documentElement.classList.contains('light');
            const icon = btn.querySelector('.theme-icon');
            const label = btn.querySelector('.theme-label');
            if (icon) icon.textContent = light ? '🌙' : '☀️';
            if (label) label.textContent = light ? 'Dark mode' : 'Light mode';
        }
        applyIcon();

        btn.addEventListener('click', function () {
            document.documentElement.classList.toggle('light');
            const light = document.documentElement.classList.contains('light');
            localStorage.setItem('uniPath_theme', light ? 'light' : 'dark');
            applyIcon();
        });
    }

    // ---- Copy to clipboard ----
    const toast = document.getElementById('copyToast');
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 1600);
    }

    document.querySelectorAll('[data-copy]').forEach(function (el) {
        el.addEventListener('click', function () {
            const text = el.getAttribute('data-copy');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () { showToast('Copied'); });
            } else {
                showToast(text);
            }
        });
    });
})();