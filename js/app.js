import { dbOps } from './db.js';

// State
let allBookmarks = [];
let currentFilter = 'all'; // 'all' or specific tag
let searchQuery = '';

// DOM Elements
const grid = document.getElementById('bookmarks-grid');
const addBtn = document.getElementById('add-btn');
const modalOverlay = document.getElementById('bookmark-modal');
const closeModalBtn = document.getElementById('close-modal');
const form = document.getElementById('bookmark-form');
const searchInput = document.getElementById('search-input');
const filterChips = document.getElementById('filter-chips');
const themeToggle = document.getElementById('theme-toggle');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-file');
const deleteAllBtn = document.getElementById('delete-all-btn');

// --- Initialization ---

async function init() {
    try {
        allBookmarks = await dbOps.getAll();
        renderTags();
        renderGrid();

        // Check for Share Target
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');
        const text = urlParams.get('text');
        const url = urlParams.get('url');

        if (title || text || url) {
            // Clean up history
            window.history.replaceState({}, document.title, window.location.pathname);

            setTimeout(() => {
                openModal();
                if (title) document.getElementById('title').value = title;
                if (url) document.getElementById('url').value = url;
                if (text && !url) document.getElementById('url').value = text; // sometimes text is the url
            }, 500);
        }

    } catch (err) {
        console.error('Failed to load bookmarks', err);
    }
}

// --- Rendering ---

function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
        return 'icons/default.png'; // Fallback
    }
}

function createCard(bookmark) {
    const card = document.createElement('a');
    card.className = 'bookmark-card';
    card.href = bookmark.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // Prevent navigation when clicking actions
    card.addEventListener('click', (e) => {
        if (e.target.closest('.card-actions')) {
            e.preventDefault();
        }
    });

    const favicon = getFaviconUrl(bookmark.url);

    card.innerHTML = `
        <div class="card-actions">
            ${navigator.share ? `
            <button class="action-btn share-btn" data-id="${bookmark.id}" title="Partager">
                <i class="ph ph-share-network"></i>
            </button>` : ''}
            <button class="action-btn copy-btn" data-url="${bookmark.url}" title="Copier le lien">
                <i class="ph ph-copy"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${bookmark.id}" title="Supprimer">
                <i class="ph ph-trash"></i>
            </button>
        </div>
        <div class="card-icon">
            <img src="${favicon}" alt="Icon" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCc+PHBhdGggZmlsbD0nI2ZmZicgZD0nTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01em0wIDlsLTEwLTUgMTAgNSAxMCA1LTEwIDV6Jy8+PC9zdmc+'">
        </div>
        <div class="card-info">
            <h3>${bookmark.title}</h3>
            <p>${bookmark.description || new URL(bookmark.url).hostname}</p>
        </div>
        <div class="card-tags">
             ${(bookmark.tags || []).map(tag => `<span style="font-size: 0.75rem; color: var(--text-muted); margin-right: 4px;">#${tag}</span>`).join('')}
        </div>
    `;

    // Delete Event
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopImmediatePropagation();
            if (confirm('Supprimer ce favori ?')) {
                await dbOps.delete(bookmark.id);
                allBookmarks = allBookmarks.filter(b => b.id !== bookmark.id);
                renderGrid();
                renderTags();
            }
        });
    }

    // Copy Event
    const copyBtn = card.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async (e) => {
            e.stopImmediatePropagation();
            try {
                await navigator.clipboard.writeText(bookmark.url);
                const icon = copyBtn.querySelector('i');
                icon.classList.replace('ph-copy', 'ph-check');
                setTimeout(() => icon.classList.replace('ph-check', 'ph-copy'), 2000);
            } catch (err) {
                console.error('Copy failed', err);
            }
        });
    }

    // Share Event
    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async (e) => {
            e.stopImmediatePropagation();
            try {
                await navigator.share({
                    title: bookmark.title,
                    text: bookmark.description,
                    url: bookmark.url
                });
            } catch (err) {
                console.log('Share canceled');
            }
        });
    }

    return card;
}

function renderGrid() {
    grid.innerHTML = '';

    let filtered = allBookmarks;

    // Apply Search
    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filtered = filtered.filter(b =>
            b.title.toLowerCase().includes(lowerQ) ||
            b.url.toLowerCase().includes(lowerQ) ||
            (b.tags && b.tags.some(t => t.toLowerCase().includes(lowerQ)))
        );
    }

    // Apply Tag Filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(b => b.tags && b.tags.includes(currentFilter));
    }

    // Sort by Date Descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    filtered.forEach((b, index) => {
        const card = createCard(b);
        card.classList.add('animate-in');
        card.style.animationDelay = `${index * 0.05}s`;
        grid.appendChild(card);
    });
}

function renderTags() {
    const tags = new Set();
    allBookmarks.forEach(b => {
        if (b.tags) b.tags.forEach(t => tags.add(t));
    });

    // Keep 'Tous'
    filterChips.innerHTML = `<button class="chip ${currentFilter === 'all' ? 'active' : ''}" data-tag="all">Tous</button>`;

    Array.from(tags).sort().forEach(tag => {
        const btn = document.createElement('button');
        btn.className = `chip ${currentFilter === tag ? 'active' : ''}`;
        btn.textContent = tag;
        btn.dataset.tag = tag;
        btn.onclick = () => {
            currentFilter = tag;
            renderTags(); // Re-render to update active class
            renderGrid();
        };
        filterChips.appendChild(btn);
    });

    // Re-attach listener for 'Tous'
    filterChips.firstElementChild.onclick = () => {
        currentFilter = 'all';
        renderTags();
        renderGrid();
    };
}

// --- Event Handlers ---

// Modal
function openModal() {
    form.reset();
    document.getElementById('bookmark-id').value = '';
    modalOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => document.getElementById('url').focus(), 100);
}

function closeModal() {
    modalOverlay.setAttribute('aria-hidden', 'true');
}

addBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Form Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('bookmark-id').value;
    const url = document.getElementById('url').value;
    const title = document.getElementById('title').value;
    const tagsStr = document.getElementById('tags').value;

    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const bookmark = {
        url,
        title,
        tags,
        description: '', // You could fetch meta description here if you want
        createdAt: new Date().toISOString()
    };

    if (id) {
        bookmark.id = Number(id);
        await dbOps.update(bookmark);
        // Update local state
        const idx = allBookmarks.findIndex(b => b.id === bookmark.id);
        if (idx !== -1) allBookmarks[idx] = bookmark;
    } else {
        const newB = await dbOps.add(bookmark);
        allBookmarks.push(newB);
    }

    closeModal();
    renderGrid();
    renderTags();
});

// Search
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderGrid();
});

// Theme Toggle
// Check system pref
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    const icon = themeToggle.querySelector('i');
    if (isDark) {
        icon.classList.replace('ph-sun', 'ph-moon');
    } else {
        icon.classList.replace('ph-moon', 'ph-sun');
    }
});

// --- Settings ---

function openSettings() {
    settingsModal.setAttribute('aria-hidden', 'false');
}

function closeSettings() {
    settingsModal.setAttribute('aria-hidden', 'true');
}

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
});

// Export
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(allBookmarks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `fav-link-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Import
importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const items = JSON.parse(event.target.result);
            if (Array.isArray(items)) {
                for (const item of items) {
                    // Basic validation
                    if (item.url && item.title) {
                        try {
                            await dbOps.add(item);
                        } catch (e) {
                            console.warn('Skipping duplicate or invalid item', item);
                        }
                    }
                }
                const newItems = await dbOps.getAll();
                allBookmarks = newItems;
                renderGrid();
                renderTags();
                alert('Import terminé !');
                closeSettings();
            } else {
                alert('Format de fichier invalide');
            }
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'import');
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
});

// Delete All
deleteAllBtn.addEventListener('click', async () => {
    if (confirm('ÊTES-VOUS SÛR ? Cela effacera tous vos favoris irrémédiablement.')) {
        // Naive delete all: clear store? DB ops doesn't have clear(), so fetch all ids and delete.
        // Better: implement clear() in db.js or loop.
        // Let's loop for now as we have the IDs in memory
        for (const b of allBookmarks) {
            await dbOps.delete(b.id);
        }
        allBookmarks = [];
        renderGrid();
        renderTags();
        closeSettings();
    }
});

// Start
init();
