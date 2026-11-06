// ============================================================
// PROSPECTUS PAGE
// Theme toggle, side menu, university card grid, search,
// province filter, and PDF open/download handling.
// ============================================================

(function () {
    'use strict';

    // ---------- Theme ----------
    const btn = document.getElementById('themeToggle');
    function applyIcon() {
        if (!btn) return;
        const light = document.documentElement.classList.contains('light');
        const icon = btn.querySelector('.theme-icon');
        const label = btn.querySelector('.theme-label');
        if (icon) icon.textContent = light ? '🌙' : '☀️';
        if (label) label.textContent = light ? 'Dark mode' : 'Light mode';
    }
    applyIcon();
    if (btn) {
        btn.addEventListener('click', function () {
            document.documentElement.classList.toggle('light');
            const light = document.documentElement.classList.contains('light');
            localStorage.setItem('uniPath_theme', light ? 'light' : 'dark');
            applyIcon();
        });
    }

    // ---------- Side menu ----------
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

    // ---------- Prospectus data ----------
    const universities = [
        { name: "University of Cape Town", province: "Western Cape", short: "UCT", pdf: "prospectus/UCT2027.pdf" },
        { name: "University of the Witwatersrand", province: "Gauteng", short: "Wits", pdf: "prospectus/WITS2027.pdf" },
        { name: "Stellenbosch University", province: "Western Cape", short: "SU", pdf: "prospectus/SU2027.pdf" },
        { name: "University of Pretoria", province: "Gauteng", short: "UP", pdf: "prospectus/UP2027.pdf" },
        { name: "University of Johannesburg", province: "Gauteng", short: "UJ", pdf: "prospectus/UJ2027.pdf" },
        { name: "North-West University", province: "North West", short: "NWU", pdf: "prospectus/NWU2027.pdf" },
        { name: "University of KwaZulu-Natal", province: "KwaZulu-Natal", short: "UKZN", pdf: "prospectus/UKZN2027.pdf" },
        { name: "Rhodes University", province: "Eastern Cape", short: "RU", pdf: "prospectus/RU2027.pdf" },
        { name: "University of the Free State", province: "Free State", short: "UFS", pdf: "prospectus/UFS2027.pdf" },
        { name: "University of the Western Cape", province: "Western Cape", short: "UWC", pdf: "prospectus/UWC2027.pdf" },
        { name: "Nelson Mandela University", province: "Eastern Cape", short: "NMU", pdf: "prospectus/NMU2027.pdf" },
        { name: "University of Fort Hare", province: "Eastern Cape", short: "UFH", pdf: "prospectus/UFH2027.pdf" },
        { name: "University of Limpopo", province: "Limpopo", short: "UL", pdf: "prospectus/UL2027.pdf" },
        { name: "University of Venda", province: "Limpopo", short: "Univen", pdf: "prospectus/UNIVEN2027.pdf" },
        { name: "University of Zululand", province: "KwaZulu-Natal", short: "Unizulu", pdf: "prospectus/UNIZULU2027.pdf" },
        { name: "Walter Sisulu University", province: "Eastern Cape", short: "WSU", pdf: "prospectus/WSU2027.pdf" },
        { name: "University of South Africa", province: "Distance", short: "UNISA", pdf: "prospectus/unisa.pdf" },
        { name: "Tshwane University of Technology", province: "Gauteng", short: "TUT", pdf: "prospectus/TUT2027.pdf" },
        { name: "Cape Peninsula University of Technology", province: "Western Cape", short: "CPUT", pdf: "prospectus/CPUT2027.pdf" },
        { name: "Durban University of Technology", province: "KwaZulu-Natal", short: "DUT", pdf: "prospectus/DUT2027.pdf" },
        { name: "Vaal University of Technology", province: "Gauteng", short: "VUT", pdf: "prospectus/VUT2027.pdf" },
        { name: "Central University of Technology", province: "Free State", short: "CUT", pdf: "prospectus/CUT2027.pdf" },
        { name: "Mangosuthu University of Technology", province: "KwaZulu-Natal", short: "MUT", pdf: "prospectus/MUT2027.pdf" },
        { name: "Sol Plaatje University", province: "Northern Cape", short: "SPU", pdf: "prospectus/SPU2027.pdf" },
        { name: "University of Mpumalanga", province: "Mpumalanga", short: "UMP", pdf: "prospectus/UMP2027.pdf" },
        { name: "Sefako Makgatho Health Sciences University", province: "Gauteng", short: "SMU", pdf: "prospectus/SMU2027.pdf" }
    ];

    function uniLogoFile(name) {
        const map = {
            'University of Cape Town': 'uct',
            'University of the Witwatersrand': 'wits',
            'Stellenbosch University': 'stellenbosch',
            'University of Pretoria': 'up',
            'University of Johannesburg': 'uj',
            'North-West University': 'nwu',
            'University of KwaZulu-Natal': 'ukzn',
            'Rhodes University': 'rhodes',
            'University of the Free State': 'ufs',
            'University of the Western Cape': 'uwc',
            'Nelson Mandela University': 'nmu',
            'University of Fort Hare': 'ufh',
            'University of Limpopo': 'ul',
            'University of Venda': 'univen',
            'University of Zululand': 'unizulu',
            'Walter Sisulu University': 'wsu',
            'University of South Africa': 'unisa',
            'Tshwane University of Technology': 'tut',
            'Cape Peninsula University of Technology': 'cput',
            'Durban University of Technology': 'dut',
            'Vaal University of Technology': 'vut',
            'Central University of Technology': 'cut',
            'Mangosuthu University of Technology': 'mut',
            'Sol Plaatje University': 'spu',
            'University of Mpumalanga': 'ump',
            'Sefako Makgatho Health Sciences University': 'smu'
        };
        return map[name] || null;
    }

    function uniLogoShort(name) {
        if (name === 'University of South Africa') return 'UNISA';
        if (name === 'University of the Witwatersrand') return 'Wits';
        if (name === 'Stellenbosch University') return 'SU';
        if (name === 'North-West University') return 'NWU';
        if (name === 'University of KwaZulu-Natal') return 'UKZN';
        if (name === 'Nelson Mandela University') return 'NMU';
        if (name === 'University of Fort Hare') return 'UFH';
        if (name === 'University of Limpopo') return 'UL';
        if (name === 'University of Venda') return 'Univen';
        if (name === 'University of Zululand') return 'Unizulu';
        if (name === 'Walter Sisulu University') return 'WSU';
        if (name === 'Tshwane University of Technology') return 'TUT';
        if (name === 'Cape Peninsula University of Technology') return 'CPUT';
        if (name === 'Durban University of Technology') return 'DUT';
        if (name === 'Vaal University of Technology') return 'VUT';
        if (name === 'Central University of Technology') return 'CUT';
        if (name === 'Mangosuthu University of Technology') return 'MUT';
        if (name === 'Sol Plaatje University') return 'SPU';
        if (name === 'University of Mpumalanga') return 'UMP';
        if (name === 'Sefako Makgatho Health Sciences University') return 'SMU';
        const short = name.replace(/^University of (the )?/i, '').replace(/^University Of (the )?/i, '');
        if (short.length <= 6) return short;
        return short.split(/\s+/).map(w => w[0] || '').join('').slice(0, 4).toUpperCase();
    }

    function uniLogoHtml(name) {
        const letters = uniLogoShort(name);
        const colors = ['#1d4ed8','#0f766e','#b45309','#7c3aed','#be123c','#0369a1','#15803d','#c2410c'];
        let h = 0;
        for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
        const bg = colors[h % colors.length];
        const file = uniLogoFile(name);
        if (file) {
            return '<span class="uni-logo-wrap" title="' + name + '">' +
                '<img class="uni-logo-img" src="logos/' + file + '.jpeg" alt="' + letters + '" ' +
                'data-base="logos/' + file + '" ' +
                'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-flex\'" />' +
                '<span class="uni-logo uni-logo-fallback" style="background:' + bg + ';display:none">' + letters + '</span>' +
                '</span>';
        }
        return '<span class="uni-logo" style="background:' + bg + '" title="' + name + '">' + letters + '</span>';
    }

    const toast = document.getElementById('downloadToast');
    let toastTimer = null;
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    const grid = document.getElementById('prospectusGrid');
    const searchInput = document.getElementById('prospectusSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';
    let currentSearch = '';

    function renderCards() {
        if (!grid) return;
        const filtered = universities.filter(u => {
            const matchesFilter = currentFilter === 'all' || u.province === currentFilter;
            const matchesSearch = !currentSearch
                || u.name.toLowerCase().includes(currentSearch.toLowerCase())
                || u.short.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        if (!filtered.length) {
            grid.innerHTML = '<div class="no-prospectus">No universities match your search.</div>';
            return;
        }

        grid.innerHTML = filtered.map(u => `
            <div class="prospectus-card" data-province="${u.province}">
              ${uniLogoHtml(u.name)}
              <h3>${u.name}</h3>
              <span class="province-tag">${u.province}</span>
              <p>Read the official prospectus for admission requirements, APS scales, and programme offerings.</p>
              <div class="card-actions">
                <a class="btn-open" href="${u.pdf}" target="_blank" rel="noopener noreferrer">
                  <span class="ico" aria-hidden="true">↗</span> Open prospectus
                </a>
                <button type="button" class="btn-download" data-pdf="${u.pdf}" data-name="${u.name}">
                  <span class="ico" aria-hidden="true">⬇</span> Download PDF
                </button>
              </div>
            </div>
        `).join('');

        grid.querySelectorAll('.btn-download').forEach(b => {
            b.addEventListener('click', () => {
                const url = b.getAttribute('data-pdf');
                const name = b.getAttribute('data-name') || 'prospectus';
                triggerDownload(url, name);
            });
        });
    }

    async function triggerDownload(url, name) {
        const safeName = name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'prospectus';
        const filename = safeName + '_prospectus.pdf';
        showToast('Downloading ' + name + ' prospectus…');

        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const blob = await response.blob();

            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
            showToast('Saved: ' + filename);
        } catch (err) {
            console.warn('Fetch download failed, falling back to direct download:', err);
            try {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast('Opening PDF — use your browser’s save option.');
            } catch (e2) {
                window.open(url, '_blank', 'noopener,noreferrer');
                showToast('Opening PDF in a new tab.');
            }
        }
    }

    if (filterButtons.length) {
        filterButtons.forEach(b => {
            b.addEventListener('click', () => {
                filterButtons.forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                currentFilter = b.getAttribute('data-filter');
                renderCards();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.trim();
            renderCards();
        });
    }

    renderCards();
})();