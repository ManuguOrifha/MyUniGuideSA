// ============================================================
// APS CALCULATOR PAGE
// Uses the same subject-row design as details.js.
// Collects subjects & marks, validates, then saves to
// sessionStorage and redirects to aps-results.html
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ---------- Theme Toggle ----------
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

    // ---------- Toast Notifications ----------
    function showAppToast(message) {
        let el = document.getElementById('appToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'appToast';
            el.className = 'app-toast';
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add('show');
        clearTimeout(showAppToast._t);
        showAppToast._t = setTimeout(() => el.classList.remove('show'), 2800);
    }

    // ---------- Subject Lists ----------
    const HOME_LANGUAGES = [
        "Afrikaans Home Language", "English Home Language", "isiNdebele Home Language",
        "isiXhosa Home Language", "isiZulu Home Language", "Sepedi Home Language",
        "Sesotho Home Language", "Setswana Home Language", "siSwati Home Language",
        "Tshivenda Home Language", "Xitsonga Home Language"
    ];

    const FIRST_ADDITIONAL_LANGUAGES = [
        "Afrikaans First Additional Language", "English First Additional Language",
        "isiNdebele First Additional Language", "isiXhosa First Additional Language",
        "isiZulu First Additional Language", "Sepedi First Additional Language",
        "Sesotho First Additional Language", "Setswana First Additional Language",
        "siSwati First Additional Language", "Tshivenda First Additional Language",
        "Xitsonga First Additional Language"
    ];

    const OTHER_SUBJECTS = [
        "Accounting", "Agricultural Management Practices", "Agricultural Sciences",
        "Agricultural Technology", "Biblical Studies", "Business Studies",
        "Civil Technology", "Commerce", "Computer Applications Technology",
        "Consumer Studies", "Dance", "Design", "Dramatic Arts", "Economics",
        "Electrical Technology", "Engineering Graphics and Design", "Geography",
        "History", "Hospitality Studies", "Information Technology", "Life Sciences",
        "Marine Sciences", "Mathematical Literacy", "Mathematics",
        "Mechanical Technology", "Music", "Physical Sciences", "Religion Studies",
        "Sport and Exercise Science", "Technical Mathematics", "Technical Science",
        "Tourism", "Visual Arts"
    ];

    const MIN_SUBJECTS = 7;
    const MAX_SUBJECTS = 12;

    // ---------- DOM Elements ----------
    const subjectsContainer = document.getElementById('subjectList');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const calcBtn = document.getElementById('calcBtn');

    let homeLanguageSelect = null;
    let falSelect = null;

    // ---------- Initialize ----------
    function init() {
        if (!subjectsContainer) return;
        
        createHomeLanguageRow();
        createFALRow();
        createLifeOrientationRow();

        for (let i = 0; i < 4; i++) addSubjectRow();

        addSubjectBtn.addEventListener('click', () => {
            addSubjectRow();
        });

        calcBtn.addEventListener('click', handleCalculate);

        syncFALOptions();
    }

    // ---------- Row Creation ----------
    function createHomeLanguageRow() {
        const row = document.createElement('div');
        row.className = 'subject-row locked';
        row.dataset.role = 'homeLanguage';

        const select = document.createElement('select');
        select.className = 'subject-select';
        select.id = 'homeLanguageSelect';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Enter home language —';
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        HOME_LANGUAGES.forEach(subj => {
            const opt = document.createElement('option');
            opt.value = subj;
            opt.textContent = subj;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            syncFALOptions();
        });

        const markInput = document.createElement('input');
        markInput.type = 'number';
        markInput.className = 'subject-mark';
        markInput.placeholder = '%';
        markInput.min = 0;
        markInput.max = 100;

        const lockBadge = document.createElement('span');
        lockBadge.className = 'lock-badge';
        lockBadge.textContent = 'L';

        row.appendChild(select);
        row.appendChild(markInput);
        row.appendChild(lockBadge);
        subjectsContainer.appendChild(row);
        homeLanguageSelect = select;
    }

    function createFALRow() {
        const row = document.createElement('div');
        row.className = 'subject-row locked';
        row.dataset.role = 'firstAdditional';

        const select = document.createElement('select');
        select.className = 'subject-select';
        select.id = 'falSelect';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Enter FAL —';
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        const markInput = document.createElement('input');
        markInput.type = 'number';
        markInput.className = 'subject-mark';
        markInput.placeholder = '%';
        markInput.min = 0;
        markInput.max = 100;

        const lockBadge = document.createElement('span');
        lockBadge.className = 'lock-badge';
        lockBadge.textContent = 'L';

        row.appendChild(select);
        row.appendChild(markInput);
        row.appendChild(lockBadge);
        subjectsContainer.appendChild(row);
        falSelect = select;
    }

    function createLifeOrientationRow() {
        const row = document.createElement('div');
        row.className = 'subject-row locked';
        row.dataset.role = 'lifeOrientation';

        const select = document.createElement('select');
        select.className = 'subject-select';
        select.disabled = true;
        const opt = document.createElement('option');
        opt.value = 'Life Orientation';
        opt.textContent = 'Life Orientation';
        opt.selected = true;
        select.appendChild(opt);

        const markInput = document.createElement('input');
        markInput.type = 'number';
        markInput.className = 'subject-mark';
        markInput.placeholder = '%';
        markInput.min = 0;
        markInput.max = 100;

        const lockBadge = document.createElement('span');
        lockBadge.className = 'lock-badge';
        lockBadge.textContent = 'L';

        row.appendChild(select);
        row.appendChild(markInput);
        row.appendChild(lockBadge);
        subjectsContainer.appendChild(row);
    }

    function syncFALOptions() {
        if (!homeLanguageSelect || !falSelect) return;

        const chosenHL = homeLanguageSelect.value;
        const previousFAL = falSelect.value;

        falSelect.innerHTML = '';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Enter FAL —';
        placeholder.disabled = true;
        placeholder.selected = true;
        falSelect.appendChild(placeholder);

        if (!chosenHL) return;

        const allowed = FIRST_ADDITIONAL_LANGUAGES.filter(fal => {
            const langName = chosenHL.replace(' Home Language', '');
            return fal !== `${langName} First Additional Language`;
        });

        allowed.forEach(subj => {
            const opt = document.createElement('option');
            opt.value = subj;
            opt.textContent = subj;
            falSelect.appendChild(opt);
        });

        if (previousFAL && allowed.includes(previousFAL)) {
            falSelect.value = previousFAL;
        }
    }

    function getSelectedOptionalSubjects(exceptSelect = null) {
        const used = new Set();
        subjectsContainer.querySelectorAll('.subject-row:not(.locked) .subject-select').forEach(sel => {
            if (sel !== exceptSelect && sel.value) used.add(sel.value);
        });
        return used;
    }

    function fillOptionalSubjectOptions(select, preferred = '') {
        const used = getSelectedOptionalSubjects(select);
        const current = preferred || select.value;
        select.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '— Subject —';
        select.appendChild(defaultOption);

        OTHER_SUBJECTS.forEach(subj => {
            if (used.has(subj) && subj !== current) return; 
            const opt = document.createElement('option');
            opt.value = subj;
            opt.textContent = subj;
            select.appendChild(opt);
        });

        if (current && Array.from(select.options).some(o => o.value === current)) {
            select.value = current;
        } else {
            select.value = '';
        }
    }

    function refreshAllOptionalSubjectDropdowns() {
        subjectsContainer.querySelectorAll('.subject-row:not(.locked) .subject-select').forEach(sel => {
            fillOptionalSubjectOptions(sel, sel.value);
        });
    }

    function addSubjectRow(selectedSubject = '', mark = '') {
        if (subjectsContainer.children.length >= MAX_SUBJECTS) {
            showAppToast(`You can add up to ${MAX_SUBJECTS} subjects.`);
            return;
        }

        const row = document.createElement('div');
        row.className = 'subject-row';

        const select = document.createElement('select');
        select.className = 'subject-select';
        fillOptionalSubjectOptions(select, selectedSubject);

        select.addEventListener('change', () => {
            refreshAllOptionalSubjectDropdowns();
        });

        const markInput = document.createElement('input');
        markInput.type = 'number';
        markInput.className = 'subject-mark';
        markInput.placeholder = '%';
        markInput.min = 0;
        markInput.max = 100;
        markInput.value = mark;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
            const optionalRows = subjectsContainer.querySelectorAll('.subject-row:not(.locked)');
            if (optionalRows.length > 4) {
                row.remove();
                refreshAllOptionalSubjectDropdowns();
            } else {
                showAppToast('You need at least 4 optional subjects (7 total).');
            }
        });

        row.appendChild(select);
        row.appendChild(markInput);
        row.appendChild(removeBtn);
        subjectsContainer.appendChild(row);
        refreshAllOptionalSubjectDropdowns();
    }

    // ---------- Read & Validate ----------
    function getSubjectsAndMarks() {
        const rows = subjectsContainer.querySelectorAll('.subject-row');
        const subjects = [];

        rows.forEach(row => {
            const select = row.querySelector('.subject-select');
            const markInput = row.querySelector('.subject-mark');
            const subject = select.value;
            const mark = parseFloat(markInput.value);
            const role = row.dataset.role || null;

            if (subject && !isNaN(mark) && mark >= 0 && mark <= 100) {
                subjects.push({ subject, mark, role });
            }
        });

        return subjects;
    }

    function handleCalculate() {
        if (!homeLanguageSelect || !homeLanguageSelect.value) {
            showAppToast('Please select your Home Language.');
            if (homeLanguageSelect) homeLanguageSelect.focus();
            return;
        }
        if (!falSelect || !falSelect.value) {
            showAppToast('Please select your First Additional Language (FAL).');
            if (falSelect) falSelect.focus();
            return;
        }

        const lockedRows = subjectsContainer.querySelectorAll('.subject-row.locked');
        for (const row of lockedRows) {
            const markInput = row.querySelector('.subject-mark');
            const mark = parseFloat(markInput.value);
            const subject = row.querySelector('.subject-select').value || 'this subject';
            if (isNaN(mark) || mark < 0 || mark > 100) {
                showAppToast(`Please enter a valid mark (0–100) for: ${subject}`);
                markInput.focus();
                return;
            }
        }

        if (homeLanguageSelect && falSelect) {
            const hlLang = homeLanguageSelect.value.replace(' Home Language', '');
            const falLang = falSelect.value.replace(' First Additional Language', '');
            if (hlLang === falLang) {
                showAppToast('Home Language and First Additional Language cannot be the same language.');
                falSelect.focus();
                return;
            }
        }

        const subjects = getSubjectsAndMarks();

        if (subjects.length < MIN_SUBJECTS) {
            showAppToast(`Please enter at least ${MIN_SUBJECTS} subjects with valid marks. You have ${subjects.length}.`);
            return;
        }

        calcBtn.disabled = true;
        calcBtn.textContent = 'Calculating…';

        try {
            sessionStorage.setItem('aps_subjects', JSON.stringify(subjects));
        } catch (e) {
            console.warn('sessionStorage failed, using localStorage fallback', e);
            localStorage.setItem('aps_subjects', JSON.stringify(subjects));
        }

        window.location.href = 'aps-results.html';
    }

    // Run init
    init();
});