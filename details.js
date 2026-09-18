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

// ============================================================
// DETAILS PAGE — collect learner info, save to localStorage + Firebase
// Home Language, First Additional Language and Life Orientation
// are COMPULSORY and locked. Starts blank each visit.
// ============================================================

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
    "Agricultural Sciences",
    "Agricultural Technology",
    "Biblical Studies",
    "Business Studies",
    "Civil Technology",
    "Computer Applications Technology",
    "Consumer Studies",
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
    "Tourism",
    "Visual Arts"
];

const MIN_SUBJECTS = 7;
const MAX_SUBJECTS = 12;

const fullNameInput = document.getElementById('fullName');
const gradeSelect = document.getElementById('grade');
const subjectsContainer = document.getElementById('subjectsContainer');
const addSubjectBtn = document.getElementById('addSubjectBtn');
const goBtn = document.getElementById('goBtn');
const apsLiveEl = document.getElementById('apsLive');

let homeLanguageSelect = null;
let falSelect = null;

function init() {
    createHomeLanguageRow();
    createFALRow();
    createLifeOrientationRow();

    for (let i = 0; i < 4; i++) addSubjectRow();

    addSubjectBtn.addEventListener('click', () => {
        addSubjectRow();
        updateLiveAPS();
    });
    goBtn.addEventListener('click', handleGo);

    // Live APS as marks change
    subjectsContainer.addEventListener('input', updateLiveAPS);
    subjectsContainer.addEventListener('change', updateLiveAPS);

    syncFALOptions();
    updateLiveAPS();
    // Intentionally do NOT restore previous details — form starts blank
}

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
        updateLiveAPS();
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

    // Ascending alphabetical order
    OTHER_SUBJECTS.forEach(subj => {
        if (used.has(subj) && subj !== current) return; // cannot pick same subject twice
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
        updateLiveAPS();
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
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
        const optionalRows = subjectsContainer.querySelectorAll('.subject-row:not(.locked)');
        if (optionalRows.length > 4) {
            row.remove();
            refreshAllOptionalSubjectDropdowns();
            updateLiveAPS();
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

// ---------- LIVE APS (best 6 academic subjects, LO excluded) ----------
function calculateAPS(subjects) {
    if (!subjects.length) return 0;
    const academic = subjects.filter(s => s.subject !== 'Life Orientation');
    if (!academic.length) return 0;
    const marks = academic.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
    let aps = 0;
    marks.forEach(mark => {
        if (mark >= 90) aps += 8;
        else if (mark >= 80) aps += 7;
        else if (mark >= 70) aps += 6;
        else if (mark >= 60) aps += 5;
        else if (mark >= 50) aps += 4;
        else if (mark >= 40) aps += 3;
        else if (mark >= 30) aps += 2;
        else aps += 1;
    });
    return aps;
}

function updateLiveAPS() {
    if (!apsLiveEl) return;
    const subjects = getSubjectsAndMarks();
    const aps = calculateAPS(subjects);
    const academicCount = subjects.filter(s => s.subject !== 'Life Orientation').length;
    apsLiveEl.innerHTML = `
        <span class="aps-live-label">Your APS</span>
        <span class="aps-live-value">${aps}</span>
        <span class="aps-live-hint">${academicCount < 6 ? `(enter ${6 - academicCount} more academic mark${6 - academicCount !== 1 ? 's' : ''})` : '(best 6 subjects · LO excluded)'}</span>
    `;
}

function makeDocIdFromName(name) {
    return name
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[\/#\[\]]/g, '-')
        .substring(0, 100);
}

async function saveLearner(name, grade, subjects) {
    localStorage.setItem('uniPath_name', name);
    localStorage.setItem('uniPath_grade', grade);
    localStorage.setItem('uniPath_subjects', JSON.stringify(subjects));

    if (typeof db === 'undefined' || typeof firebase === 'undefined') {
        console.warn('Firebase not loaded — saved to localStorage only.');
        return;
    }

    try {
        const docId = makeDocIdFromName(name);
        await db.collection('learners').doc(docId).set({
            name: name,
            grade: grade,
            subjects: subjects,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        localStorage.setItem('uniPath_learnerId', docId);
        console.log('Saved to Firebase:', docId);
    } catch (err) {
        console.error('Firebase save failed (data still in localStorage):', err);
    }
}

async function handleGo() {
    const name = fullNameInput.value.trim();
    const grade = gradeSelect.value;

    if (!name) { showAppToast('Please enter your full name.'); fullNameInput.focus(); return; }
    if (!grade) { showAppToast('Please select your grade.'); gradeSelect.focus(); return; }

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

    goBtn.disabled = true;
    goBtn.textContent = 'Saving…';

    try {
        await saveLearner(name, grade, subjects);
    } finally {
        goBtn.disabled = false;
        goBtn.textContent = 'Go — show my courses';
    }

    window.location.href = 'courses.html';
}

window.addEventListener('DOMContentLoaded', init);