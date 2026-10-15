// ============================================================
// APS CALCULATOR PAGE
// Collects subjects & marks, validates, then saves to
// sessionStorage and redirects to aps-results.html
// ============================================================

(function () {
    'use strict';

    // ---------- Back button ----------
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // ---------- Theme ----------
    const btn = document.getElementById('themeToggle');
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

    // ---------- Menu ----------
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('sideMenu');
    const backdrop = document.getElementById('menuBackdrop');
    function openMenu() {
        menu.hidden = false; backdrop.hidden = false;
        requestAnimationFrame(function () {
            menu.classList.add('open'); backdrop.classList.add('open');
        });
    }
    function closeMenu() {
        menu.classList.remove('open'); backdrop.classList.remove('open');
        setTimeout(function () { menu.hidden = true; backdrop.hidden = true; }, 200);
    }
    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            if (menu.classList.contains('open')) closeMenu(); else openMenu();
        });
    }
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // ---------- Subject lists ----------
    const HOME_LANGUAGES = [
        "Afrikaans Home Language",
        "English Home Language",
        "isiNdebele Home Language",
        "isiXhosa Home Language",
        "isiZulu Home Language",
        "Sepedi Home Language",
        "Sesotho Home Language",
        "Setswana Home Language",
        "siSwati Home Language",
        "Tshivenda Home Language",
        "Xitsonga Home Language"
    ];

    const FIRST_ADDITIONAL_LANGUAGES = [
        "Afrikaans First Additional Language",
        "English First Additional Language",
        "isiNdebele First Additional Language",
        "isiXhosa First Additional Language",
        "isiZulu First Additional Language",
        "Sepedi First Additional Language",
        "Sesotho First Additional Language",
        "Setswana First Additional Language",
        "siSwati First Additional Language",
        "Tshivenda First Additional Language",
        "Xitsonga First Additional Language"
    ];

    const OTHER_SUBJECTS = [
        "Accounting",
        "Agricultural Management Practices",
        "Agricultural Sciences",
        "Agricultural Technology",
        "Business Studies",
        "Civil Technology",
        "Computer Applications Technology",
        "Consumer Studies",
        "Dance",
        "Design",
        "Dramatic Arts",
        "Economics",
        "Electrical Technology",
        "Engineering Graphics and Design",
        "Geography",
        "History",
        "Hospitality Studies",
        "Information Technology",
        "Life Sciences",
        "Marine Sciences",
        "Mathematical Literacy",
        "Mathematics",
        "Mechanical Technology",
        "Music",
        "Physical Sciences",
        "Religion Studies",
        "Sport and Exercise Science",
        "Technical Mathematics",
        "Technical Science",
        "Tourism",
        "Visual Arts"
    ];

    const list = document.getElementById('subjectList');
    const addBtn = document.getElementById('addSubjectBtn');
    const calcBtn = document.getElementById('calcBtn');

    // Helper: build a <select> with the given subjects and a placeholder
    function buildSelect(subjects, placeholderText) {
        const sel = document.createElement('select');
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderText;
        placeholder.selected = true;
        sel.appendChild(placeholder);
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            sel.appendChild(opt);
        });
        return sel;
    }

    // Row: locked Life Orientation
    function makeLifeOrientationRow() {
        const row = document.createElement('div');
        row.className = 'subject-row locked';
        row.dataset.role = 'lifeOrientation';

        const sel = document.createElement('select');
        sel.disabled = true;
        const opt = document.createElement('option');
        opt.value = 'Life Orientation';
        opt.textContent = 'Life Orientation';
        opt.selected = true;
        sel.appendChild(opt);

        const mark = document.createElement('input');
        mark.type = 'number';
        mark.min = 0; mark.max = 100;
        mark.placeholder = '%';
        mark.value = '';

        const lock = document.createElement('span');
        lock.className = 'lock-badge';
        lock.textContent = 'L';
        lock.title = 'Life Orientation is compulsory';

        row.appendChild(sel);
        row.appendChild(mark);
        row.appendChild(lock);
        return row;
    }

    // Row: Home Language only
    function makeHomeLanguageRow() {
        const row = document.createElement('div');
        row.className = 'subject-row';
        row.dataset.role = 'homeLanguage';

        const sel = buildSelect(HOME_LANGUAGES, '— Choose home language —');
        const mark = document.createElement('input');
        mark.type = 'number';
        mark.min = 0; mark.max = 100;
        mark.placeholder = '%';
        mark.value = '';

        const lock = document.createElement('span');
        lock.className = 'lock-badge';
        lock.textContent = 'L';
        lock.title = 'Home Language is compulsory';

        row.appendChild(sel);
        row.appendChild(mark);
        row.appendChild(lock);
        return row;
    }

    // Row: First Additional Language only
    function makeFALRow() {
        const row = document.createElement('div');
        row.className = 'subject-row';
        row.dataset.role = 'firstAdditional';

        const sel = buildSelect(FIRST_ADDITIONAL_LANGUAGES, '— Choose additional language —');
        const mark = document.createElement('input');
        mark.type = 'number';
        mark.min = 0; mark.max = 100;
        mark.placeholder = '%';
        mark.value = '';

        const lock = document.createElement('span');
        lock.className = 'lock-badge';
        lock.textContent = 'L';
        lock.title = 'First Additional Language is compulsory';

        row.appendChild(sel);
        row.appendChild(mark);
        row.appendChild(lock);
        return row;
    }

    // Row: free-choice optional subject
    function makeOptionalRow() {
        const row = document.createElement('div');
        row.className = 'subject-row';

        const sel = buildSelect(OTHER_SUBJECTS, '— Choose subject —');
        const mark = document.createElement('input');
        mark.type = 'number';
        mark.min = 0; mark.max = 100;
        mark.placeholder = '%';
        mark.value = '';

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove';
        remove.textContent = '×';
        remove.addEventListener('click', () => {
            if (list.querySelectorAll('.subject-row').length > 7) row.remove();
        });

        row.appendChild(sel);
        row.appendChild(mark);
        row.appendChild(remove);
        return row;
    }

    // Build the initial form
    function initRows() {
        list.innerHTML = '';
        list.appendChild(makeLifeOrientationRow());
        list.appendChild(makeHomeLanguageRow());
        list.appendChild(makeFALRow());
        for (let i = 0; i < 4; i++) list.appendChild(makeOptionalRow());
    }

    addBtn.addEventListener('click', () => {
        if (list.querySelectorAll('.subject-row').length >= 12) return;
        list.appendChild(makeOptionalRow());
    });

    // ---------- Read subjects ----------
    function readSubjects() {
        const rows = list.querySelectorAll('.subject-row');
        const out = [];
        rows.forEach(r => {
            const sel = r.querySelector('select');
            const mark = r.querySelector('input');
            const s = sel.value;
            const m = parseFloat(mark.value);
            if (s && !isNaN(m) && m >= 0 && m <= 100) {
                out.push({ subject: s, mark: m });
            }
        });
        return out;
    }

    // ---------- Validate ----------
    function validateForm() {
        const rows = list.querySelectorAll('.subject-row');

        // LO must have a valid mark
        const loRow = list.querySelector('.subject-row.locked');
        if (loRow) {
            const loMark = parseFloat(loRow.querySelector('input').value);
            if (isNaN(loMark) || loMark < 0 || loMark > 100) {
                return 'Please enter a valid Life Orientation mark (0–100).';
            }
        }

        // Home Language must be chosen with a mark
        const hlRow = list.querySelector('.subject-row[data-role="homeLanguage"]');
        if (hlRow) {
            const hlSubject = hlRow.querySelector('select').value;
            const hlMark = parseFloat(hlRow.querySelector('input').value);
            if (!hlSubject) return 'Please choose your Home Language.';
            if (isNaN(hlMark) || hlMark < 0 || hlMark > 100) {
                return 'Please enter a valid Home Language mark (0–100).';
            }
        }

        // First Additional Language must be chosen with a mark
        const falRow = list.querySelector('.subject-row[data-role="firstAdditional"]');
        if (falRow) {
            const falSubject = falRow.querySelector('select').value;
            const falMark = parseFloat(falRow.querySelector('input').value);
            if (!falSubject) return 'Please choose your First Additional Language.';
            if (isNaN(falMark) || falMark < 0 || falMark > 100) {
                return 'Please enter a valid First Additional Language mark (0–100).';
            }
        }

        // Every optional row that has a subject must have a mark (and vice versa)
        let filled = 0;
        for (const r of rows) {
            if (r.classList.contains('locked')) { filled++; continue; }
            if (r.dataset.role === 'homeLanguage' || r.dataset.role === 'firstAdditional') {
                const s = r.querySelector('select').value;
                const m = parseFloat(r.querySelector('input').value);
                if (s && !isNaN(m)) filled++;
                continue;
            }
            const subject = r.querySelector('select').value;
            const markStr = r.querySelector('input').value.trim();
            const mark = parseFloat(markStr);
            const hasSubject = !!subject;
            const hasMark = markStr !== '' && !isNaN(mark) && mark >= 0 && mark <= 100;
            if (hasSubject && !hasMark) return 'Please enter a valid mark (0–100) for: ' + subject;
            if (!hasSubject && hasMark) return 'Please choose a subject for every mark you entered.';
            if (hasSubject && hasMark) filled++;
        }

        if (filled < 7) return 'Please enter at least 7 subjects with valid marks. You have ' + filled + '.';

        // Duplicate check
        const seen = new Set();
        for (const r of rows) {
            const s = r.querySelector('select').value;
            if (!s) continue;
            if (seen.has(s)) return 'You have "' + s + '" more than once. Please remove the duplicate.';
            seen.add(s);
        }

        return null;
    }

    // ---------- Handle Calculate ----------
    calcBtn.addEventListener('click', function () {
        const error = validateForm();
        if (error) {
            showToast('⚠️ ' + error);
            return;
        }
        const subjects = readSubjects();
        try {
            sessionStorage.setItem('aps_subjects', JSON.stringify(subjects));
        } catch (e) {
            console.warn('sessionStorage failed, using localStorage fallback', e);
            localStorage.setItem('aps_subjects', JSON.stringify(subjects));
        }
        window.location.href = 'aps-results.html';
    });

    // ---------- Toast ----------
    function showToast(msg) {
        let el = document.getElementById('apsToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'apsToast';
            el.className = 'aps-toast';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => el.classList.remove('show'), 2600);
    }

    initRows();
})();