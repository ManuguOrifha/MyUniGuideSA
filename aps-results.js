// ============================================================
// APS RESULTS PAGE
// Reads subjects from sessionStorage (fallback: localStorage),
// computes each university's APS, and renders result cards.
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
                window.location.href = 'aps.html';
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

    const resultsArea = document.getElementById('resultsArea');

    // ---------- Load subjects ----------
    function loadSubjects() {
        let raw = sessionStorage.getItem('aps_subjects');
        if (!raw) raw = localStorage.getItem('aps_subjects');
        if (!raw) return null;
        try {
            const arr = JSON.parse(raw);
            return Array.isArray(arr) && arr.length ? arr : null;
        } catch (e) {
            return null;
        }
    }

    // ---------- APS helpers ----------
    function nscLevel(mark) {
        if (mark >= 80) return 7;
        if (mark >= 70) return 6;
        if (mark >= 60) return 5;
        if (mark >= 50) return 4;
        if (mark >= 40) return 3;
        if (mark >= 30) return 2;
        if (mark >= 0) return 1;
        return 0;
    }
    function nscLevel8(mark) {
        if (mark >= 90) return 8;
        if (mark >= 80) return 7;
        if (mark >= 70) return 6;
        if (mark >= 60) return 5;
        if (mark >= 50) return 4;
        if (mark >= 40) return 3;
        if (mark >= 30) return 2;
        if (mark >= 0) return 1;
        return 0;
    }
    function standardAPS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation');
        const top6 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
        return top6.reduce((sum, m) => sum + nscLevel(m), 0);
    }
    function uctFPS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation' && s.mark >= 40);
        const top6 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
        return top6.reduce((sum, m) => sum + m, 0);
    }
    function witsAPS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation');
        const top6 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
        let total = top6.reduce((sum, m) => sum + nscLevel(m), 0);
        const lo = subjects.find(s => s.subject === 'Life Orientation');
        if (lo && lo.mark >= 60) total += Math.min(nscLevel(lo.mark), 4);
        const eng = subjects.find(s => /^english/i.test(s.subject));
        if (eng && eng.mark >= 60) total += 2;
        const maths = subjects.find(s => s.subject === 'Mathematics');
        if (maths && maths.mark >= 60) total += 2;
        return total;
    }
    function uwcPoints(subjects) {
        function pts(mark, type) {
            if (mark >= 90) return type === 'lang' || type === 'maths' ? 15 : type === 'lo' ? 3 : 8;
            if (mark >= 80) return type === 'lang' || type === 'maths' ? 13 : type === 'lo' ? 3 : 7;
            if (mark >= 70) return type === 'lang' || type === 'maths' ? 11 : type === 'lo' ? 2 : 6;
            if (mark >= 60) return type === 'lang' || type === 'maths' ? 9 : type === 'lo' ? 2 : 5;
            if (mark >= 50) return type === 'lang' || type === 'maths' ? 7 : type === 'lo' ? 1 : 4;
            if (mark >= 40) return type === 'lang' || type === 'maths' ? 5 : type === 'lo' ? 1 : 3;
            if (mark >= 30) return type === 'lang' || type === 'maths' ? 3 : type === 'lo' ? 0 : 2;
            if (mark >= 20) return type === 'lang' || type === 'maths' ? 1 : type === 'lo' ? 0 : 1;
            return 0;
        }
        const eng = subjects.find(s => /^english/i.test(s.subject));
        const maths = subjects.find(s => /^mathematics$/i.test(s.subject)) || subjects.find(s => /mathematical literacy/i.test(s.subject));
        const lo = subjects.find(s => s.subject === 'Life Orientation');
        const others = subjects
            .filter(s => s !== eng && s !== maths && s !== lo)
            .map(s => s.mark).sort((a, b) => b - a).slice(0, 3);
        let total = 0;
        if (eng) total += pts(eng.mark, 'lang');
        if (maths) total += pts(maths.mark, 'maths');
        if (lo) total += pts(lo.mark, 'lo');
        others.forEach(m => { total += pts(m, 'other'); });
        return total;
    }
    function ufsCutAPS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation');
        const top5 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 5);
        let total = top5.reduce((sum, m) => sum + nscLevel(m), 0);
        const lo = subjects.find(s => s.subject === 'Life Orientation');
        if (lo) total += Math.min(nscLevel(lo.mark), 1);
        return total;
    }
    function aps8(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation');
        const top6 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
        return top6.reduce((sum, m) => sum + nscLevel8(m), 0);
    }
    function rhodesAPS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation' && s.mark >= 40);
        const top6 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
        const sum = top6.reduce((s, m) => s + m, 0);
        return Math.round((sum / 10) * 10) / 10;
    }
    function stellenboschTPT(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation');
        if (!acad.length) return 0;
        let lang = acad.filter(s => /(home language|first additional language)/i.test(s.subject));
        lang.sort((a, b) => b.mark - a.mark);
        const langMark = lang.length ? lang[0].mark : acad.map(s => s.mark).sort((a, b) => b - a)[0];
        const others = acad.filter(s => !(lang.length && s === lang[0])).map(s => s.mark).sort((a, b) => b - a).slice(0, 5);
        const all = [langMark, ...others];
        const avg = all.reduce((s, m) => s + m, 0) / all.length;
        return Math.round(avg * 10) / 10;
    }
    function nmuAS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation' && s.mark >= 40);
        const top6 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
        let total = top6.reduce((sum, m) => sum + m, 0);
        const lo = subjects.find(s => s.subject === 'Life Orientation');
        if (lo && lo.mark >= 50) total += 7;
        return total;
    }
    function univenAPS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation' && s.mark >= 40);
        const top7 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 7);
        return top7.reduce((sum, m) => sum + nscLevel(m), 0);
    }
    function cputAPS(subjects) {
        const acad = subjects.filter(s => s.subject !== 'Life Orientation');
        const top6 = acad.map(s => s.mark).sort((a, b) => b - a).slice(0, 6);
        const sum = top6.reduce((s, m) => s + m, 0);
        return Math.round((sum / 10) * 10) / 10;
    }
    function spuAPS(subjects) {
        function pts(mark) {
            if (mark >= 90) return 8;
            if (mark >= 80) return 7;
            if (mark >= 70) return 6;
            if (mark >= 60) return 5;
            if (mark >= 50) return 4;
            if (mark >= 40) return 3;
            if (mark >= 30) return 2;
            if (mark >= 10) return 1;
            return 0;
        }
        function bonus(mark) {
            if (mark >= 70) return 2;
            if (mark >= 60) return 1;
            return 0;
        }
        const homeLang = subjects.find(s => /home language/i.test(s.subject));
        const maths = subjects.find(s => /^mathematics$/i.test(s.subject));
        const scored = subjects.map(s => {
            let p = pts(s.mark);
            let b = 0;
            if (s === homeLang || s === maths) b = bonus(s.mark);
            if (s.subject === 'Life Orientation') { p = Math.min(p, 4); b = 0; }
            return { total: p + b };
        });
        return scored.sort((a, b) => b.total - a.total).slice(0, 6)
            .reduce((sum, s) => sum + s.total, 0);
    }

    // ---------- Logos ----------
    function uniLogoShort(name) {
        const map = {
            'University of Cape Town': 'UCT','University of the Witwatersrand': 'Wits','Stellenbosch University': 'SU','University of Pretoria': 'UP','University of Johannesburg': 'UJ','North-West University': 'NWU','University of KwaZulu-Natal': 'UKZN','Rhodes University': 'RU','University of the Free State': 'UFS','University of the Western Cape': 'UWC','Nelson Mandela University': 'NMU','University of Fort Hare': 'UFH','University of Limpopo': 'UL','University of Venda': 'Univen','University of Zululand': 'Unizulu','Walter Sisulu University': 'WSU','University of South Africa': 'UNISA','Tshwane University of Technology': 'TUT','Cape Peninsula University of Technology': 'CPUT','Durban University of Technology': 'DUT','Vaal University of Technology': 'VUT','Central University of Technology': 'CUT','Mangosuthu University of Technology': 'MUT','Sol Plaatje University': 'SPU','University of Mpumalanga': 'UMP','Sefako Makgatho Health Sciences University': 'SMU'
        };
        if (map[name]) return map[name];
        return name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 4).toUpperCase();
    }
    function uniLogoFile(name) {
        const map = {
            'University of Cape Town': 'uct','University of the Witwatersrand': 'wits','Stellenbosch University': 'stellenbosch','University of Pretoria': 'up','University of Johannesburg': 'uj','North-West University': 'nwu','University of KwaZulu-Natal': 'ukzn','Rhodes University': 'rhodes','University of the Free State': 'ufs','University of the Western Cape': 'uwc','Nelson Mandela University': 'nmu','University of Fort Hare': 'ufh','University of Limpopo': 'ul','University of Venda': 'univen','University of Zululand': 'unizulu','Walter Sisulu University': 'wsu','University of South Africa': 'unisa','Tshwane University of Technology': 'tut','Cape Peninsula University of Technology': 'cput','Durban University of Technology': 'dut','Vaal University of Technology': 'vut','Central University of Technology': 'cut','Mangosuthu University of Technology': 'mut','Sol Plaatje University': 'spu','University of Mpumalanga': 'ump','Sefako Makgatho Health Sciences University': 'smu'
        };
        return map[name] || null;
    }
    function uniLogoHtml(name) {
        const letters = uniLogoShort(name);
        const colors = ['#1d4ed8','#0f766e','#b45309','#7c3aed','#be123c','#0369a1','#15803d','#c2410c'];
        let h = 0;
        for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
        const bg = colors[h % colors.length];
        const file = uniLogoFile(name);
        const safeName = name.replace(/"/g, '&quot;');
        const safeLetters = letters.replace(/"/g, '&quot;');
        if (file) {
            return (
                '<div class="urc-logo-wrap" title="' + safeName + '">' +
                    '<img class="urc-logo-img" src="logos/' + file + '.jpeg" alt="' + safeLetters + '" ' +
                        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
                    '<span class="urc-logo-fallback" style="background:' + bg + '">' + safeLetters + '</span>' +
                '</div>'
            );
        }
        return '<div class="urc-logo-wrap"><span class="urc-logo-fallback" style="display:flex;background:' + bg + '">' + safeLetters + '</span></div>';
    }

    // ---------- University definitions ----------
    const UNIVERSITIES = [
        { name: "University of Johannesburg",                 score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "University of Pretoria",                     score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "North-West University",                      score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Tshwane University of Technology",           score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Vaal University of Technology",              score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "University of Venda",                        score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Mangosuthu University of Technology",        score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "University of South Africa",                 score: standardAPS,     label: "Standard APS",        note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Cape Peninsula University of Technology",    score: cputAPS,         label: "CPUT APS",            note: "Best 6 % ÷ 10, LO excluded.",           formula: "Sum of top 6 percentages ÷ 10" },
        { name: "University of the Witwatersrand",            score: witsAPS,         label: "Wits APS",            note: "Best 6 + LO (max 4) + Eng/Maths bonus.", formula: "Top 6 + LO (≤4) + 2 Eng (≥60) + 2 Maths (≥60)" },
        { name: "University of the Western Cape",             score: uwcPoints,       label: "UWC Points",          note: "English & Maths weighted, LO included.", formula: "Eng (≤15) + Maths (≤15) + LO (≤3) + best 3 others (≤8 each)" },
        { name: "University of Cape Town",                    score: uctFPS,          label: "UCT FPS",             note: "Direct % sum, LO excluded, max 600.",   formula: "Sum of top 6 percentages (excl LO)" },
        { name: "Nelson Mandela University",                  score: nmuAS,           label: "NMU Applicant Score", note: "Best 6 % sum, LO excluded, max 600.",   formula: "Top 6 % + 7 bonus if LO ≥ 50%" },
        { name: "Stellenbosch University",                    score: stellenboschTPT, label: "Stellenbosch TPT",    note: "Average % of best language + 5 others.", formula: "Avg % of best language + best 5 other subjects" },
        { name: "Rhodes University",                          score: rhodesAPS,       label: "Rhodes APS",          note: "Sum of top 6 % ÷ 10, max 60.",          formula: "Top 6 percentage sum ÷ 10" },
        { name: "University of KwaZulu-Natal",                score: aps8,            label: "UKZN APS (1–8)",      note: "1–8 scale, best 6, LO excluded.",       formula: "Sum of best 6 on 1–8 scale (90%+ = 8)" },
        { name: "University of the Free State",               score: ufsCutAPS,       label: "UFS APS",             note: "Best 5 + LO capped at 1.",              formula: "Top 5 + LO (max 1 pt)" },
        { name: "Central University of Technology",           score: ufsCutAPS,       label: "CUT APS",             note: "Best 5 + LO capped at 1.",              formula: "Top 5 + LO (max 1 pt)" },
        { name: "University of Fort Hare",                    score: standardAPS,     label: "UFH APS",             note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "University of Limpopo",                      score: standardAPS,     label: "UL APS",              note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "University of Zululand",                     score: standardAPS,     label: "Unizulu APS",         note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Walter Sisulu University",                   score: standardAPS,     label: "WSU APS",             note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Durban University of Technology",            score: standardAPS,     label: "DUT APS",             note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Sol Plaatje University",                     score: spuAPS,          label: "SPU APS",             note: "Best 6 incl. LO, +Maths/HL bonus.",     formula: "Top 6 (incl. LO ≤4) + bonus for Maths/HL" },
        { name: "University of Mpumalanga",                   score: standardAPS,     label: "UMP APS",             note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" },
        { name: "Sefako Makgatho Health Sciences University", score: standardAPS,     label: "SMU APS",             note: "Best 6 subjects, LO excluded.",        formula: "Sum of level points for top 6 (excl LO)" }
    ];

    // ---------- Render ----------
    function renderResults(subjects) {
        const cards = UNIVERSITIES.map(u => {
            const s = u.score(subjects);
            return `<div class="uni-result-card">
              <div class="urc-head">
                ${uniLogoHtml(u.name)}
                <h4 class="urc-name">${u.name}</h4>
              </div>
              <div class="urc-score">${s}</div>
              <div class="urc-label">${u.label}</div>
              <div class="urc-note">${u.note}</div>
              <div class="urc-formula">${u.formula}</div>
            </div>`;
        }).join('');
        resultsArea.innerHTML = `<div class="uni-results-grid">${cards}</div>`;
    }

    // ---------- Init ----------
    const subjects = loadSubjects();
    if (!subjects) {
        resultsArea.innerHTML = `
            <div class="result-error">
                ⚠️ No subjects found. Please enter your subjects on the APS Calculator page.
            </div>
            <div style="text-align:center; margin-top:1rem;">
                <a href="aps.html" class="btn-secondary" style="text-decoration:none;">Go to APS Calculator</a>
            </div>
        `;
        return;
    }

    renderResults(subjects);
})();