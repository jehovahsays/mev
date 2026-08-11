/**
 * MEV Sovereign Module: event_listeners.js
 * Brace Integrity Guaranteed
 */

if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}

(function secureClientApp() {
    const sanitize = (el) => {
        if (el && el.value) {
            // Check against the HTML pattern attribute first for a "fast fail"
            if (el.pattern && !new RegExp(el.pattern).test(el.value)) {
                console.warn("⚠️ MEV Firewall: Regex Pattern Mismatch.");
            }
            
            // Real-time scrubbing using DOMPurify
            const clean = DOMPurify.sanitize(el.value, {
                ALLOWED_TAGS: [], // In the subconscious search/auth, we allow NO tags
                ALLOWED_ATTR: []
            });

            if (el.value !== clean) {
                el.value = clean;
                console.warn("⚠️ MEV Firewall: Blocked potential script injection.");
            }
        }
    };

    document.addEventListener("input", (e) => sanitize(e.target));
    document.addEventListener("blur", (e) => sanitize(e.target));

    // Disable invasive browser behaviors to protect the "Subconscious" UI
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("dragstart", e => e.preventDefault());
})();

// Data Import Handling
document.getElementById('import-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            await saveData(STORAGE_KEYS.pages, data.pages || {});
            alert("Data Imported Successfully into the Subconscious.");
            window.location.reload();
        } catch (err) {
            console.error("Import Error:", err);
            alert("Error: Invalid Backup File or Data Format.");
        }
    };
    reader.readAsText(file);
});

async function showProfile() {
    setMainView(true);
    console.log("Navigating to Profile");
    closeSidebar();
    const c = document.getElementById('page-container');
    if (!c) return;

    const user = getCurrentUser();

    const section = document.createElement('section');
    section.className = 'page';
    section.innerHTML = `<h2>User Profile: ${user ? user.name : '::1'}</h2>`;

    section.innerHTML += `
        <p><strong>Status:</strong> Logged in and **${encryptionKey ? 'encrypted' : 'unencrypted'}** session active.</p>
        <p><strong>Joined:</strong> ${new Date(user.joined).toLocaleDateString()}</p>
        <p><strong>Total Edits:</strong> (Not tracked yet)</p>
        <p>This page will be expanded to show user-specific statistics and history.</p>
    `;
    
    c.innerHTML = '';
    c.appendChild(section);
    location.hash = "#profile";
}

async function showPage(title) {
  if (title === "find-view") {
    setMainView(false);
    return;
  }
  setMainView(true);
  console.log("Showing page:", title);
  closeSidebar();
  
  // --- START MODIFICATION: Add return statement for custom pages ---
  if (title === 'Import_Data') {
      document.getElementById('page-container').innerHTML = renderImportPage();
      document.title = 'Import/Export Data – localhost ';
      location.hash = '#Import_Data';
      return; // <-- CRITICAL FIX: Stop execution here
  }
  // --- END MODIFICATION ---

  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const page = pages[title];
  const c = document.getElementById('page-container');
  if (!c) return;
  
  if (!page) {
    const all = Object.keys(pages);
    const suggest = all.filter(t => t.toLowerCase().includes(title.toLowerCase()));
    let html = `<section class="page"><h2>No page found for "${escapeHTML(title)}"</h2>`;
    if (suggest.length) {
      html += `<p>Did you mean: ${suggest.map(t => `<a href="#" data-page-link="${t}">${escapeHTML(t)}</a>`).join(', ')}</p>`;
    }
    html += `<p>Would you like to create it?</p><button class="edit-btn" data-create-page="${escapeHTML(title)}">Create Page "${escapeHTML(title)}"</button></section>`;
    c.innerHTML = html;
    speak(`No page found for ${title}.`);
    location.hash = "#notfound";
    return;
  }
  
  const finalSafeHTML = parseWiki(page.content); 
  // IMPORTANT: For the single file, the URL will always be index.html.
  const pageUrl = `${location.origin}#${encodeURIComponent(page.title)}`; 
  const dateMod = new Date(page.lastEdited).toISOString();
  const authorName = escapeHTML(page.createdBy || '::1');

  // SCHEMA FIX: Injected fully compliant Article schema
  c.innerHTML = `
    <article class="page" 
             itemscope 
             itemtype="https://schema.org/Article"
             itemid="${pageUrl}"
    >
      <meta itemprop="mainEntityOfPage" content="${pageUrl}">
      <h2 itemprop="headline">${escapeHTML(page.title)}</h2>
      
      <div class="meta-info" style="font-size: 0.85rem; color: #555555; margin-bottom: 10px;">
        Last edited: <time itemprop="dateModified" datetime="${dateMod}">${new Date(page.lastEdited).toLocaleString()}</time> 
        by <span itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">${authorName}</span></span>
      </div>

      <meta itemprop="image" content="${location.origin}/icon-512.png">
      
      <div class="content" itemprop="articleBody">${finalSafeHTML}</div>
      
      <hr style="margin-top:20px; border-top: 1px solid #ccc;">
      <button class="edit-btn" id="edit-btn">Edit</button>
      <button class="delete-btn" id="delete-btn">Delete Page</button>
      <div class="semantic-status">✔️ Semantic HTML Loaded</div>
    </article>
  `;

  document.getElementById('edit-btn')?.addEventListener('click', () => editPage(title));
  document.getElementById('delete-btn')?.addEventListener('click', () => deletePage(title));
  
  if (title === "Main_Page") {
      location.hash = "#main";
  } else {
      location.hash = `#${encodeURIComponent(title)}`;
  }
}

async function editPage(title) {
  setMainView(true);
  console.log("Editing page:", title);
  
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const page = pages[title];
  const c = document.getElementById('page-container');
  if (!c) return;
  
  c.innerHTML = `<section class="page">
    <h2>Editing: ${escapeHTML(title)}</h2>
    <p style="font-size: 0.85rem; color: #6c757d;">Using simple localhost markup. See Formatting_Examples for help.</p>
    <textarea class="editor">${escapeHTML(page.content)}</textarea>
    <button class="edit-btn" id="save-page-btn">Save Changes</button>
    <button class="delete-btn" id="cancel-edit-btn">Cancel</button>
  </section>`;
  
  // CSP-SAFE: Attaching listeners to the newly created buttons
  document.getElementById('save-page-btn')?.addEventListener('click', () => savePage(title));
  document.getElementById('cancel-edit-btn')?.addEventListener('click', () => showPage(title));
  document.querySelector('.editor')?.focus();
}

document.addEventListener('DOMContentLoaded', async () => {
  applyThemeFromStorage();
  setupAuth();
  updateConnectionStatus();
  updateStorageBar();

  // Create/Ensure essential localhost pages
  await createExampleWikiPage(); 
  await ensureMainPage(); 
  
  await updatePageListSidebar(); 
  await generatePageButtonsFindView(); 
  
  restoreSidebarState(); 

  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  
  // Hash Change Listener (remains functional)
  window.addEventListener('hashchange', async () => { 
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash === "main") await showPage("Main_Page");
    else if (hash === "settings") await showSettings();
    else if (hash === "about") await showAbout();
    else if (hash === "recent") await showRecent();
    else if (hash === "profile") showProfile();
    else if (hash === "Import_Data") await showPage("Import_Data"); // Added for hash nav
    else if (hash === "search" || hash === "notfound") {}
    else if (hash) { 
        await showPage(hash); 
    } else {
        await showPage("Main_Page"); 
    }
  });

// 1. Menu and Search Controls
document.getElementById('menu-btn')?.addEventListener('click', toggleSidebar);

const searchInput = document.getElementById('ai-input');
if (searchInput) {
    // A. Original sidebar filtering logic
    searchInput.addEventListener('input', titleInputSidebar); 

    // B. Hardened Underscore Logic (moved from index.html)
    searchInput.addEventListener('input', function(e) {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const originalValue = this.value;
        const newValue = originalValue.replace(/\s+/g, '_');

        if (originalValue !== newValue) {
            this.value = newValue;
            this.setSelectionRange(start, end);
        }
    });

    // C. Handle "Paste" events
    searchInput.addEventListener('paste', function(e) {
        setTimeout(() => {
            this.value = this.value.replace(/\s+/g, '_');
        }, 0);
    });
}

document.getElementById('filterInput-find')?.addEventListener('input', titleInputFindView);
  
  // 2. Search Button Action
  document.getElementById('ai-button')?.addEventListener('click', async () => {
    const inp = document.getElementById('ai-input');
    const findInp = document.getElementById('filterInput-find');
    const query = (inp?.value.trim() || findInp?.value.trim() || "");
    
    if (inp) inp.value = query;
    if (findInp) findInp.value = query;

    if (query) {
      await answerAI(query);
    } else {
      await showPage("Main_Page");
    }
    
    // Clear search inputs after submission
    if (inp) inp.value = '';
    if (findInp) findInp.value = '';
  });

  // 3. Enter Key Submission (Combined for both search inputs)
  const searchHandler = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('ai-button')?.click();
    }
  };
  document.getElementById('ai-input')?.addEventListener('keydown', searchHandler);
  document.getElementById('filterInput-find')?.addEventListener('keydown', searchHandler);
  
  // 4. Create Page Button
  document.getElementById('create-page-btn')?.addEventListener('click', e => {
    e.preventDefault();
    createPage();
  });
  
  // 5. Global Link/Button Handler (Delegated for dynamically created links)
  document.getElementById('main-content-wrapper')?.addEventListener('click', handleLinkClick);
  document.getElementById('sidebar')?.addEventListener('click', handleLinkClick);

  // 6. Profile Link
  document.getElementById('profile-link')?.addEventListener('click', e => { e.preventDefault(); showProfile(); });
  
  // 7. Settings Action Handler (Delegated)
  document.getElementById('page-container')?.addEventListener('click', handleSettingsAction);


// SW Registration (Hardened Physical File)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Points to the physical sw.js file with correct scope
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then(reg => {
                console.log('✅ Service Worker registered via Physical File. Scope:', reg.scope);
            })
            .catch(err => {
                console.error('❌ SW registration failed (Physical File):', err);
                console.warn('Check if sw.js exists at the root of the ./ directory.');
            });
    });
}

  // SW Update Fix for SPA Stale Content 
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log("New Service Worker activated. Forcing page reload for fresh content.");
          window.location.reload();
      }, { once: true }); 
  }
});

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'import-file-input') {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                await saveData(STORAGE_KEYS.pages, data.pages || {});
                alert("Data Imported Successfully into the Subconscious.");
                window.location.reload();
            } catch (err) {
                alert("Error: Invalid Backup File.");
            }
        };
        reader.readAsText(file);
    }
});

// Sovereign Hash Routing and Stream Link Listeners
if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
        const currentHash = window.location.hash.replace('#', '');
        if (['xml', 'rss', 'json'].includes(currentHash)) {
            if (typeof window.switchSovereignView === 'function') {
                window.switchSovereignView(currentHash);
            }
        }
    });

    // Run verification on initial engine load if deep-linked
    window.addEventListener('load', () => {
        const initialHash = window.location.hash.replace('#', '');
        if (['xml', 'rss', 'json'].includes(initialHash)) {
            if (typeof window.switchSovereignView === 'function') {
                window.switchSovereignView(initialHash);
            }
        }
    });
}
