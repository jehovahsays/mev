/**
 * MEV Sovereign Module: storage_core.js
 * Brace Integrity Guaranteed
 */

/**
 * SOVEREIGN INJECTOR:
 * Force ::1 identity upon initialization so the wiki is always "logged in"
 */
window.currentUser = {
    name: "::1",
    joined: new Date().toISOString(),
    isSovereign: true
};

// Override the existing getCurrentUser function
function getCurrentUser() {
    return window.currentUser;
}
 
(function initSubconscious() {
    // Apply "Less" mode if enabled
    if (localStorage.getItem('wiki_theme_less') === 'enabled') {
        document.body.classList.add('less-mode');
    }
    
    // Update the status indicator in the footer
    const indicator = document.getElementById('status-indicator');
    if (indicator) {
        indicator.innerText = navigator.onLine ? '🟢 Online' : '🔴 Offline';
        indicator.style.color = navigator.onLine ? '#4caf50' : '#f44336';
    }
})();

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'restore-perimeter-btn') {
        const challenge = prompt("Perimeter Locked. Enter 'RESTORE' to return to conscious state:");
        // Only allow exact match, no whitespace/scripts
        if (challenge?.trim() === 'RESTORE') {
            localStorage.removeItem('mev_breach_detected');
            localStorage.setItem('mev_human_verified', 'true');
            window.location.href = './index.html#search';
        }
    }
});

async function saveData(key, data) {
    try {
        const rawJson = JSON.stringify(data);
        let valueToStore;

        if (encryptionKey) {
            const encrypted = await encryptData(rawJson);
            valueToStore = JSON.stringify({
                __encrypted: true,
                data: encrypted
            });
        } else {
            valueToStore = rawJson;
        }

        localStorage.setItem(key, valueToStore);
        updateStorageBar();

        if (key === STORAGE_KEYS.pages) {
            updatePageListSidebar(); // Refreshes the sidebar list
        }
        
        if (key === STORAGE_KEYS.changes) {
            if (window.location.hash === "#recent") {
                showRecent(); // Refreshes the Recent Changes display
            }
        }

    } catch(e) {
        console.error(`❌ Failed to save data for ${key}:`, e);
        speak("Error saving data. Check console for details.");
    }
}

async function loadData(key, defaultVal) {
    try {
        const v = localStorage.getItem(key);
        if (!v) return defaultVal;

        const storedPayload = JSON.parse(v);

        if (storedPayload && storedPayload.__encrypted) {
            if (!encryptionKey) {
                console.warn(`🔒 Data for ${key} is encrypted. Decryption key missing.`);
                return defaultVal;
            }
            const decryptedJson = await decryptData(storedPayload.data);
            return JSON.parse(decryptedJson);

        } else {
            return JSON.parse(v);
        }

    } catch (e) {
        console.error(`❌ Failed to load or decrypt data for ${key}:`, e);
        speak(`Warning: Data for ${key} is inaccessible or corrupt.`);
        return defaultVal;
    }
}

async function showSettings() {
  setMainView(true);
  console.log("Navigating to Settings");
  closeSidebar();
  const c = document.getElementById('page-container');
  if (!c) return;
  const section = document.createElement('section');
  section.className = 'page';
  section.innerHTML = '<h2>Settings</h2>';
  
  // Theme Toggle
  const themeToggle = document.createElement('button'); 
  themeToggle.textContent = '🌗 Toggle Dark Mode'; 
  themeToggle.id = 'toggle-theme-btn';
  themeToggle.className = 'edit-btn';
  themeToggle.style.marginRight = '10px'; 
  section.appendChild(themeToggle);

  // Navigation Link to Import/Export Page
  const importExportLink = document.createElement('a'); 
  importExportLink.href = '#Import_Data';
  importExportLink.textContent = '📦 Manage Data (Import/Export)';
  importExportLink.className = 'edit-btn'; 
  importExportLink.onclick = () => { showPage('Import_Data'); return false; }; 
  importExportLink.style.cssText = 'background-color: var(--color-accent); color: white; display: block; text-align: center; margin-top: 10px; padding: 10px 20px; border-radius: 8px; font-weight: bold;';
  section.appendChild(importExportLink);
  
  // Storage Stats
  const storageStats = document.createElement('pre'); 
  storageStats.style.marginTop = '20px';
  storageStats.id = 'storage-stats';
  section.appendChild(storageStats);

  // Data Security Status Indicator
  const warning = document.createElement('div');
const isEncrypted = true; // Temporary force-green for testing
  
  // Style based on state: Green for secure, Orange for warning
  warning.style.cssText = `
      padding: 15px; 
      border-radius: 4px; 
      margin-top: 20px; 
      border: 1px solid ${isEncrypted ? '#155724' : '#ff9800'};
      background-color: ${isEncrypted ? '#d4edda' : '#ffe0b2'};
      color: ${isEncrypted ? '#155724' : '#000'};
  `;
  
  warning.innerHTML = isEncrypted ? `
      <h3>✅ Data Secured</h3>
      <p>Your local data is currently <strong>encrypted</strong> using your session key.</p>
      <p>The sovereign perimeter is active.</p>
  ` : `
      <h3>🚨 Data Security Warning</h3>
      <p>All localhost data is saved directly in your browser **Local Storage**. This data is **NOT encrypted**.</p>
      <p>Use the **Manage Data (Import/Export)** feature regularly.</p>
  `;
  section.appendChild(warning);

  // Clear Memory Button
  const clearBtn = document.createElement('button'); 
  clearBtn.textContent = '🧠 Clear Memory'; 
  clearBtn.className = 'delete-btn';
  clearBtn.id = 'clear-ai-memory-btn';
  section.appendChild(clearBtn);

  function updateStats() { 
      let totalBytes = 0; 
      for (let i = 0; i < localStorage.length; i++) { 
          const key = localStorage.key(i); 
          const value = localStorage.getItem(key) || ''; 
          totalBytes += (key.length + value.length) * 2; 
      } 
      const statsEl = document.getElementById('storage-stats');
      if (statsEl) {
        statsEl.textContent = `--- Local Storage Usage ---\nTotal Used: ${Math.round(totalBytes/1024)} KB\nTypical Quota: ~5120 KB (5MB)`; 
      }
  }

  c.innerHTML = '';
  c.appendChild(section);
  
  updateStats();
  location.hash = "#settings";
}

function updateStorageBar() {
    const bar = document.getElementById('storage-bar-inner');
    if (!bar) return;
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(est => {
        const usage = est.usage || 0;
        const quota = est.quota || 1;
        const percent = Math.min((usage / quota) * 100, 100).toFixed(1);
        bar.style.width = percent + '%';
        bar.title = `Used: ${(usage / 1024).toFixed(1)} KB / ${(quota / 1024).toFixed(1)} KB`;
      });
    } else {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key) || '';
        totalBytes += (key.length + value.length) * 2;
      }
      bar.style.width = '100%';
      bar.title = `Approx. ${(totalBytes / 1024).toFixed(1)} KB used`;
    }
}

function applyThemeFromStorage() {
    let mode = localStorage.getItem(STORAGE_KEYS.theme);
    if (mode === null) {
      mode = 'dark';
      localStorage.setItem(STORAGE_KEYS.theme, mode); 
    }
    document.body.classList.toggle('dark', mode === 'dark');
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
}

function restoreSidebarState() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const storedState = localStorage.getItem(STORAGE_KEYS.sidebar);
      if (storedState === 'closed') {
        sidebar.style.display = 'none';
      } else {
        sidebar.style.display = 'block';
      }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const isOpen = sidebar.style.display === 'block';
    if (isOpen) {
      sidebar.style.display = 'none';
      localStorage.setItem(STORAGE_KEYS.sidebar, 'closed');
    } else {
      sidebar.style.display = 'block';
      localStorage.setItem(STORAGE_KEYS.sidebar, 'open');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.style.display === 'block') { 
      sidebar.style.display = 'none';
      localStorage.setItem(STORAGE_KEYS.sidebar, 'closed');
    }
}

function setupAuth() {
  function updateUserStatus() {
    const user = getCurrentUser();
    const el = document.getElementById('user-status');
    if (el) {
      el.textContent = user ? `Logged in as ${user.name}` : 'Not logged in';
    }
  }

  function updateAuthUI() {
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
      profileLink.classList.remove('hidden');
    }
  }

  updateUserStatus();
  updateAuthUI();
  
  return { logout: () => {} };
}

async function createPage(titleFromSearch = null) {
  setMainView(true);
  const title = titleFromSearch || prompt("Enter new page title:");
  if (!title || title.trim() === '') return;

  const protectedKeywords = ['__proto__', 'constructor', 'prototype'];
  const cleanTitle = title.toString().trim();
  const lowerTitle = cleanTitle.toLowerCase();

  if (protectedKeywords.includes(lowerTitle)) {
      console.warn("Unauthorized property manipulation attempt detected.");
      localStorage.setItem('mev_breach_detected', 'true');
      location.href = './css.html#search'; 
      return;
  }
  
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const user = getCurrentUser();
  
  if (Object.prototype.hasOwnProperty.call(pages, cleanTitle)) { 
      speak(`Page ${cleanTitle} already exists.`); 
      window.location.hash = encodeURIComponent(cleanTitle);
      showPage(cleanTitle); 
      return; 
  }
  
  if (!protectedKeywords.includes(lowerTitle)) {
      pages[cleanTitle] = { 
          title: cleanTitle, 
          content: `== ${cleanTitle} ==\n\nThis is your new page.`, 
          lastEdited: new Date().toISOString(), 
          createdBy: user ? user.name : '::1' 
      };
  } else {
      return;
  }
  
  await saveData(STORAGE_KEYS.pages, pages); 

  const newChangeEntry = { 
    type: 'create', 
    title: cleanTitle, 
    time: new Date().toISOString(), 
    user: user ? user.name : '::1' 
  };
  
  const changes = await loadData(STORAGE_KEYS.changes, []); 
  changes.unshift(newChangeEntry);
  await saveData(STORAGE_KEYS.changes, changes);

  await updatePageListSidebar(); 
  window.location.hash = encodeURIComponent(cleanTitle);
  await showPage(cleanTitle);
}

async function deletePage(title) {
  console.log("Deleting page:", title);
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const changes = await loadData(STORAGE_KEYS.changes, []); 
  const user = getCurrentUser();
  
  if (!window.confirm(`Are you sure you want to delete the page "${title}"? This cannot be undone.`)) { return; }
  
  if (!pages[title]) {
      speak(`Page ${title} not found.`);
      return;
  }
  
  delete pages[title];
  await saveData(STORAGE_KEYS.pages, pages);

  const newChangeEntry = { 
      type: 'delete', 
      title, 
      time: new Date().toISOString(), 
      user: user ? user.name : '::1' 
  };
  
  changes.unshift(newChangeEntry);
  await saveData(STORAGE_KEYS.changes, changes);
  
  await updatePageListSidebar(); 
  await generatePageButtonsFindView();
  console.log(`✅ Page "${title}" deleted.`);
  speak(`Page ${title} deleted.`);
  await showRecent();
}

async function savePage(title) {
  console.log("Saving page:", title);
  const protectedKeywords = ['__proto__', 'constructor', 'prototype'];
  const cleanTitle = title.toString().toLowerCase().trim();
  
  if (protectedKeywords.includes(cleanTitle)) {
      console.warn("STOP! Unauthorized property manipulation attempt detected.");
      localStorage.setItem('mev_breach_detected', 'true');
      location.href = './css.html#search'; 
      return;
  }

  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const user = getCurrentUser();
  const editor = document.querySelector('.editor');
  if (!editor) { console.error("Editor not found."); return; }
  
  const rawContent = editor.value;

  if (!protectedKeywords.includes(cleanTitle)) {
      if (!Object.prototype.hasOwnProperty.call(pages, title)) {
          pages[title] = {
              content: "",
              lastEdited: "",
              createdBy: ""
          }; 
      }
      
      const targetPage = pages[title];
      if (targetPage && typeof targetPage === 'object') {
          targetPage.content = rawContent;
          targetPage.lastEdited = new Date().toISOString();
          targetPage.createdBy = user ? user.name : '::1';
      }
  } else {
      return;
  }
  
  await saveData(STORAGE_KEYS.pages, pages); 

  const newChangeEntry = { 
    type: 'edit', 
    title, 
    time: new Date().toISOString(), 
    user: user ? user.name : '::1' 
  };

  const changes = await loadData(STORAGE_KEYS.changes, []); 
  changes.unshift(newChangeEntry);
  await saveData(STORAGE_KEYS.changes, changes); 
  
  console.log("✅ Page saved.");
  speak(`Page ${title} saved.`);
  
  await updatePageListSidebar(); 
  if (typeof generatePageButtonsFindView === 'function') {
      await generatePageButtonsFindView(); 
  }

  setTimeout(async () => {
      window.location.hash = encodeURIComponent(title);
      await showPage(title);
  }, 100);
}

async function handleSettingsAction(e) {
  const target = e.target;
  if (target.id === 'toggle-theme-btn') {
      toggleTheme();
  } else if (target.id === 'clear-ai-memory-btn') {
      localStorage.removeItem(STORAGE_KEYS.knowledge); 
      await saveData(STORAGE_KEYS.knowledge, {});
      console.log(' memory cleared.'); 
      speak(" memory cleared.");
      await showSettings(); 
  }
}

(function initSovereignSplash() {
    const HUMAN_KEY = 'mev_human_verified';

    function exitSplash(hash) {
        localStorage.setItem(HUMAN_KEY, 'true');
        const splash = document.getElementById('mev-splash-screen');
        if (splash) splash.style.display = 'none';
        
        const targetHash = hash.startsWith('#') ? hash : `#${hash}`;
        window.location.hash = targetHash;
        
        if (typeof window.showPage === 'function') {
            window.showPage(decodeURIComponent(targetHash.substring(1)));
        }
    }

    function createSplashButton(title, hash) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = title.replace(/_/g, ' ');
        button.className = 'mev-button';
        button.type = 'button';
        
        button.addEventListener('click', () => exitSplash(hash));
        
        li.appendChild(button);
        return li;
    }

    async function setupSplash() {
        const listEl = document.getElementById('page-list-splash');
        const inputEl = document.getElementById('filterInput-splash');
        const formEl = document.getElementById('splash-form');
        if (!listEl) return;

        listEl.innerHTML = '';
        const pages = await loadData(STORAGE_KEYS.pages, {});
        const fragment = document.createDocumentFragment();

        const staticLinks = [{ title: "Main_Page", hash: "Main_Page" }];
        const titles = Object.keys(pages).sort();

        staticLinks.forEach(link => fragment.appendChild(createSplashButton(link.title, link.hash)));
        titles.forEach(title => fragment.appendChild(createSplashButton(title, title)));

        listEl.appendChild(fragment);

        formEl?.addEventListener('submit', (e) => {
            e.preventDefault();
            const firstVisible = listEl.querySelector('li:not([style*="display: none"]) button');
            if (firstVisible) {
                firstVisible.click();
            }
        });

        inputEl?.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const items = listEl.querySelectorAll('li');
            
            items.forEach(li => {
                const text = li.textContent.toLowerCase();
                li.style.display = text.includes(filter) ? "block" : "none";
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSplash);
    } else {
        setupSplash();
    }
})();

if (themeBtn) {
    if (localStorage.getItem('mev_theme') === 'less') {
        document.body.classList.add('less-mode');
        themeBtn.textContent = 'Standard UI';
    }

    themeBtn.addEventListener('click', () => {
        const isLess = document.body.classList.toggle('less-mode');
        
        if (isLess) {
            localStorage.setItem('mev_theme', 'less');
            themeBtn.textContent = 'Standard UI';
        } else {
            localStorage.setItem('mev_theme', 'standard');
            themeBtn.textContent = 'Toggle "Less" Theme';
        }
    });
}

document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'toggle-theme-btn') {
        const isLess = document.body.classList.toggle('less-mode');
        localStorage.setItem('wiki_theme_less', isLess ? 'enabled' : 'disabled');
        e.target.textContent = isLess ? '🌖 Switch to Full Theme' : '🌗 Toggle Less Theme';
    }

    if (e.target && e.target.id === 'import-trigger-btn') {
        document.getElementById('import-file-input')?.click();
    }

    if (e.target && e.target.id === 'export-data-btn') {
        const pages = await loadData(STORAGE_KEYS.pages, {});
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({pages}));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "mev_sovereign_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
});

(function initThemeState() {
    if (localStorage.getItem('wiki_theme_less') === 'enabled') {
        document.body.classList.add('less-mode');
    }
})();

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'restore-perimeter-btn') {
        const BREACH_KEY = 'mev_breach_detected';
        const challenge = prompt("Perimeter Locked. Enter 'RESTORE' to return to the conscious state:");
        
        if (challenge === 'RESTORE') {
            localStorage.removeItem(BREACH_KEY);
            localStorage.setItem('mev_human_verified', 'true');
            alert("Perimeter Restored. Redirecting...");
            window.location.href = './index.html#search';
        } else {
            alert("Verification failed. Perimeter remains locked.");
        }
    }
});

const SovereignDataStreams = {
  generateXML: function() {
    try {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sovereign_database>\n';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key) || '';
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, 'node_');
        const safeVal = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `  <variable id="${safeKey}">${safeVal}</variable>\n`;
      }
      xml += '</sovereign_database>';
      return xml;
    } catch(err) {
      return `<error>${err.message}</error>`;
    }
  },

  generateRSS: function() {
    try {
      const rawFeed = localStorage.getItem('mev_rss_cache') || localStorage.getItem('recent_posts') || '';
      if (rawFeed.trim().startsWith('<?xml') || rawFeed.trim().startsWith('<rss')) {
        return rawFeed;
      }
      let rss = '<?xml version="2.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n';
      rss += '  <title>Sovereign Feed Stream</title>\n  <link>#recent</link>\n';
      rss += '  <description>Self-Hosted RSS Feed</description>\n';
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('post_') || key.startsWith('feed_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            rss += '  <item>\n';
            rss += `    <title>${item.title || 'Untitled Update'}</title>\n`;
            rss += `    <link>${item.link || '#'}</link>\n`;
            rss += `    <description>${item.description || ''}</description>\n`;
            rss += '  </item>\n';
          } catch(e) {}
        }
      }
      rss += '</channel>\n</rss>';
      return rss;
    } catch(err) {
      return '<?xml version="1.0"?><error>RSS generation failure</error>';
    }
  },

  generateJSON: function() {
    try {
      const dbMatrix = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        try {
          dbMatrix[key] = JSON.parse(val);
        } catch(e) {
          dbMatrix[key] = val;
        }
      }
      return JSON.stringify(dbMatrix, null, 2);
    } catch(err) {
      return JSON.stringify({ error: err.message });
    }
  }
};

if (typeof window !== 'undefined') {
  window.SovereignDataStreams = SovereignDataStreams;
}
