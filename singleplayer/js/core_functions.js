/**
 * MEV Sovereign Module: core_functions.js
 * Brace Integrity Guaranteed
 */

// 1. The Debounce Helper (The "Firewall" for rapid input)

function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        // If a new keystroke comes in before the delay is over, 
        // we kill the previous timer and start a new one.
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}

/**

 * Actual Wiki Filtering Logic

 * This is where the perimeter hands off the "Cleaned" input to the UI

 */

function performWikiSearch(query) {
    console.log(`🔍 Wiki is now searching for: ${query}`);
    // Add your logic here to filter through your page list or content
}

// 2. The Search Logic (Sanitized and Protected)

// 3. Attach with 300ms Cooldown

/* ====== MEV SOVEREIGN FIREWALL & CORE LOGIC ====== */

// 1. ACTIVE IMMUNE SYSTEM (Real-Time Scrubbing)

// 2. HARDENED DATA IMPORT (Firewall for External Files)

// 3. STORAGE & CRYPTO CONFIG

// 4. THEME & STATUS INITIALIZATION

// 5. RECOVERY PERIMETER (Verification)

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**

 * Derives a strong encryption key from a PIN using PBKDF2.

 */

async function deriveKey(pin, salt) {
    const pinBuffer = new TextEncoder().encode(pin);
    const keyMaterial = await crypto.subtle.importKey(
        'raw', pinBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: CRYPTO_CONFIG.iterations,
            hash: CRYPTO_CONFIG.hash
        },
        keyMaterial,
        { name: CRYPTO_CONFIG.algo, length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**

 * Encrypts plaintext using the session's encryption key.

 */

async function encryptData(plaintext) {
    if (!encryptionKey) throw new Error("Encryption key not set.");

    const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.ivLength));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: CRYPTO_CONFIG.algo, iv: iv },
        encryptionKey,
        encoded
    );

    return {
        ciphertext: arrayBufferToBase64(ciphertextBuffer),
        iv: arrayBufferToBase64(iv.buffer)
    };
}

/**

 * Decrypts ciphertext using the session's encryption key.

 */

async function decryptData(encryptedData) {
    if (!encryptionKey) throw new Error("Encryption key not set.");

    const ciphertextBuffer = base64ToArrayBuffer(encryptedData.ciphertext);
    const ivBuffer = base64ToArrayBuffer(encryptedData.iv);

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: CRYPTO_CONFIG.algo, iv: new Uint8Array(ivBuffer) },
        encryptionKey,
        ciphertextBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
}

// ==========================================================

// 👤 AUTHENTICATION UTILITIES

// ==========================================================

function speak(text) {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'en-US';
      msg.pitch = 1;
      msg.rate = 1;
      window.speechSynthesis.speak(msg);
    }
}

async function updatePageListSidebar(filter = '') {
    const listEl = document.getElementById('page-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    const pages = await loadData(STORAGE_KEYS.pages, {});
    const titles = Object.keys(pages)
      .filter(t => t !== "Formatting_Examples")
      .sort();
    const filterLower = filter.toLowerCase();

    let resultsCount = 0;

    titles.forEach(title => {
        if (filterLower === '' || title.toLowerCase().includes(filterLower)) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${encodeURIComponent(title)}`;
            link.textContent = title;
            // CSP-SAFE: Use data attributes for linking
            link.setAttribute('data-page-link', title);
            li.appendChild(link);
            listEl.appendChild(li);
            resultsCount++;
        }
    });

    if (filterLower !== '') {
      const statusLi = document.createElement('li');
      statusLi.style.cssText = 'font-size: 0.85rem; color: #666; padding: 5px;';
      statusLi.textContent = `(${resultsCount} pages found)`;
      listEl.prepend(statusLi);
    }
}

// Exposed for the filter input to call

function titleInputSidebar() {
    const input = document.getElementById('ai-input');
    updatePageListSidebar(input ? input.value : '');
}

async function showRecent() {
  setMainView(true);
  console.log("Navigating to Recent Changes");
  closeSidebar();
  let changes = await loadData(STORAGE_KEYS.changes, []); 
  const c = document.getElementById('page-container');
  if (!c) return;

  const section = document.createElement('section'); 
  section.className = 'page'; 
  section.innerHTML = '<h2>Recent Changes</h2>';
  const ul = document.createElement('ul');
  
  // FIX: Ensure changes is an array before sorting
  if (Array.isArray(changes)) {
      changes.sort((a, b) => new Date(b.time) - new Date(a.time));
  } else {
      console.warn("Changes data is not an array, resetting to empty.");
      changes = []; 
  }
  
  if (changes.length === 0) {
      ul.innerHTML = '<li>No recent changes found. Start editing pages!</li>';
  } else {
      changes.slice(0,50).forEach(ch => {
        const li = document.createElement('li');
        const link = document.createElement('a'); 
        link.href = `#${encodeURIComponent(ch.title)}`; 
        link.textContent = ch.title;
        // CSP-SAFE: Use data attributes for linking
        link.setAttribute('data-page-link', ch.title);
        
        let typeClass = ch.type === 'create' ? 'color: green;' : ch.type === 'delete' ? 'color: red;' : 'color: orange;';
        li.innerHTML = `<strong style="${typeClass}">${ch.type.toUpperCase()}</strong> — `;
        li.appendChild(link); 
        li.append(` by ${ch.user} at ${new Date(ch.time).toLocaleString()}`);
        ul.appendChild(li);
      });
  }
  
  section.appendChild(ul);
  c.innerHTML = ''; 
  c.appendChild(section);
  location.hash = "#recent";
}

// ----------------------------------------------------

// ✅ MODIFIED: showSettings function to use the dedicated Import_Data page

// ----------------------------------------------------

// ----------------------------------------------------

// ✅ FIX 2: Corrected showProfile function to ensure unique listener binding

// ----------------------------------------------------

/**

 * PLACEHOLDER FUNCTION FOR PROFILE PAGE

 */

async function showAbout() {
  setMainView(true);
  console.log("Navigating to About");
  closeSidebar();
  const c = document.getElementById('page-container');
  if (!c) return;
  c.innerHTML = `<section class="page"><h2>About</h2>
    <p><strong>localhost </strong> is an offline‑first encyclopedia powered by your browser. It uses your browser local storage to save the data. No tracking, no server needed.</p>
    <h3>Features</h3>
    <ul>
      <li>Offline Editing and Viewing</li>
      <li>**Encrypted Storage (PIN required to unlock data)**</li>
      <li>Full-text search (for page titles)</li>
      <li>Voice Search Filtering</li>
      <li>Basic  Markup (==Headers, ''Bold, ''Italics, [[Links]])</li>
    </ul>
    <p>Source Version: localhost v1.2.3</p>
    </section>`;
  location.hash = "#about";
}

// Ensure this remains safe for your CSP

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>\x22\x27\/]/g, match => htmlEscapes[match]);
}

function parseWiki(text) {
  if (!text) return '';

  let lines = text.split('\n');
  let finalHtml = '';
  let inUL = false;
  let inOL = false;

  lines.forEach(line => {
    // Check for Lists first
    if (/^\*\s+/.test(line)) {
      if (inOL) { finalHtml += '</ol>'; inOL = false; }
      if (!inUL) { finalHtml += '<ul>'; inUL = true; }
      finalHtml += `<li>${inlineParse(line.replace(/^\*\s+/, ''))}</li>`;
    } else if (/^\#\s+/.test(line)) {
      if (inUL) { finalHtml += '</ul>'; inUL = false; }
      if (!inOL) { finalHtml += '<ol>'; inOL = true; }
      finalHtml += `<li>${inlineParse(line.replace(/^\#\s+/, ''))}</li>`;
    } else {
      // Close open lists
      if (inUL) { finalHtml += '</ul>'; inUL = false; }
      if (inOL) { finalHtml += '</ol>'; inOL = false; }
      
      if (line.trim() !== '') {
        finalHtml += inlineParse(line) + '<br>';
      } else {
        finalHtml += '<br>';
      }
    }
  });

  if (inUL) finalHtml += '</ul>';
  if (inOL) finalHtml += '</ol>';
  return finalHtml;
}

// Sub-function to handle formatting inside lines

function inlineParse(str) {
  // Bold/Italic
  str = str.replace(/'''(.*?)'''/g, '<strong>$1</strong>');
  str = str.replace(/''(.*?)''/g, '<em>$1</em>');
  // Wiki Links - Escape display text, but keep attribute functional
  str = str.replace(/\[\[([^\]]+)\]\]/g, (_, t) => `<a href="#" data-page-link="${escapeHTML(t)}">${escapeHTML(t)}</a>`);
  // Inline Code
  str = str.replace(/`([^`]+)`/g, (m, p1) => `<code>${escapeHTML(p1)}</code>`);
  return str;
}

// Utility for Hashing (for PIN verification, not encryption key derivation)

async function hashPin(pin) {
  if (!crypto.subtle) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data); 
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================================

// 👤 HARDENED AUTHENTICATION UTILITIES

// ==========================================================

// Attach the Auth functions to the global scope for dynamic button binding (e.g., in showProfile)

setupAuth.getAuthFunctions = setupAuth;

function sanitizeContent(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return input; 
}

function setMainView(showMain) {
    const findView = document.getElementById('find-view');
    const pageContainer = document.getElementById('page-container');

    if (showMain) {
        if(findView) findView.style.display = 'none';
        if(pageContainer) pageContainer.style.display = 'block';
    } else {
        if(findView) findView.style.display = 'block';
        if(pageContainer) pageContainer.style.display = 'none';
    }
}

// --- NEW FUNCTION: Render the Import/Export UI as a  Page ---

function renderImportPage() {
    return `
        <section class="bg-white p-6 rounded-xl shadow-lg" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
            <h1 class="text-3xl font-extrabold mb-4" style="color: var(--text-primary);">Import/Export Data</h1>
            <p class="mb-6" style="color: var(--text-secondary);">This utility allows you to backup and restore your localhost content. The full backup includes your login details (hashed PIN), so be cautious when sharing.</p>
            
            <h2 class="text-xl font-semibold mt-6" style="color: var(--text-primary);">1. Import Data (Paste JSON)</h2>
            <p class="text-sm" style="color: var(--text-secondary);">Paste your localhost  JSON backup code below and click the green button to import pages.</p>
            
            <textarea 
                id="importDataInput" 
                placeholder="Paste your localhost JSON backup code here..." 
                rows="10" 
                style="width:100%; padding:10px; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-page); color: var(--text-primary); font-family: monospace; resize: vertical;"
            ></textarea>
            <button 
                onclick="runImport()" 
                class="block w-full text-center px-4 py-2 text-lg font-semibold rounded-lg text-white bg-green-500 hover:bg-green-600 mt-3"
            >
                Import Wiki Content
            </button>
            <p id="importStatus" class="mt-3 text-sm" style="color: var(--color-accent);"></p>
            
            <h2 class="text-xl font-semibold mt-6" style="color: var(--text-primary);">2. Export Data</h2>
            <button 
                onclick="exportData(true)" 
                class="block w-full text-center px-4 py-2 text-lg font-semibold rounded-lg text-white bg-green-500 hover:bg-green-600 mt-3"
            >
                Download Content-Only Backup (Safe to Share)
            </button>
            <button 
                onclick="exportData(false)" 
                class="block w-full text-center px-4 py-2 text-lg font-semibold rounded-lg text-white bg-blue-500 hover:bg-blue-600 mt-3"
            >
                Download Full Backup (Includes Users & Pins)
            </button>
        </section>
    `;
}

// ✅ UPDATED: Content for Formatting_Examples page.

async function createExampleWikiPage() {
  const title = "Formatting_Examples";
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  if (pages[title]) return;
  const content = `
==  Page Formatting_Examples ==

This localhost uses a simple, lightweight markup for fast and clean formatting.

=== Headings ===
Use the '=' symbol at the start and end of a line to create headings:
== Level 2 Header (Section) ==
=== Level 3 Header (Subsection) ===

=== Text Styles ===
* '''Bold:''' Use triple apostrophes. Example: '''word'''
* ''Italic:'' Use double apostrophes. Example: ''word''
* '''Bold & Italic:''' Combine them. Example: '''''word'''''

=== Lists ===
* Item One (Unordered List / Bullet)
* Item Two
# Step One (Ordered List / Numbered)
# Step Two
# Step Three

=== Internal Links ===
Link to another page in the localhost using double square brackets:
[[Main_Page]]


=== Code Blocks ===
Inline code: Use a backtick \` to wrap short code snippets. Example: \`const x = 5;\`

Block code uses three backticks:
\`\`\`
function exampleCode() {
  // Code block preserves spaces and new lines
  console.log("Hello World!");
}
\`\`\`
`;
  pages[title] = { title, content, createdBy:'System', lastEdited:new Date().toISOString() };
  await saveData(STORAGE_KEYS.pages, pages); 
  console.log("✅ Example localhost page created.");
}

// ✅ UPDATED: Content for Main_Page.

async function ensureMainPage() {
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  if (!pages["Main_Page"]) {
    pages["Main_Page"] = {
      title: "Main_Page",
      content: "== Welcome to localhost  ==\n\nAn offline‑first encyclopedia powered by your browser. No tracking, no server. You can search the localhost using the bar above, or check the [[Formatting_Examples]] page to learn more. You can also create a new page now!",
      lastEdited: new Date().toISOString(),
      createdBy: "System"
    };
    await saveData(STORAGE_KEYS.pages, pages); 
    console.log("✅ Main_Page created.");
  }
}

async function answerAI(query) {
  setMainView(true); 
  console.log("Search query:", query);
  const txt = query.trim();
  if (!txt) {
      await showPage("Main_Page"); 
      return;
  }
  
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const titles = Object.keys(pages);
  const queryLower = txt.toLowerCase();

  if (pages[txt]) {
      await showPage(txt); 
      return;
  }
  
  const suggestedTitles = titles.filter(t => t.toLowerCase().includes(queryLower));

  const c = document.getElementById('page-container');
  if (!c) return;

  if (suggestedTitles.length) {
    c.innerHTML = `<section class="page">
      <h2>Closest matches for "${escapeHTML(txt)}"</h2>
      <p>Found ${suggestedTitles.length} pages matching your query:</p>
      <ul>${suggestedTitles.map(t => `<li><a href="#" data-page-link="${t}">${escapeHTML(t)}</a></li>`).join('')}</ul>
      <p>Or you can create a new page.</p>
      <button class="edit-btn" data-create-page="${escapeHTML(txt)}">Create Page "${escapeHTML(txt)}"</button>
    </section>`;
    speak(`Found ${suggestedTitles.length} similar pages for ${txt}.`);
  } else {
    c.innerHTML = `<section class="page">
      <h2>No page found for "${escapeHTML(txt)}"</h2>
      <p>There are no existing pages that match your search query. Would you like to create this page?</p>
      <button class="edit-btn" data-create-page="${escapeHTML(txt)}">Create Page "${escapeHTML(txt)}"</button>
    </section>`;
    speak(`No local page found for ${txt}.`);
  }
  location.hash = "#search"; 
}

async function generatePageButtonsFindView() {
  const listEl = document.getElementById('page-list-find');
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  
  listEl.innerHTML = '';
  
  const staticLinks = [
      { title: "Main_Page", hash: "main" },
      { title: "Recent Changes", hash: "recent" },
      { title: "Settings", hash: "settings" },
      { title: "About", hash: "about" }
  ];

  staticLinks.forEach(link => {
      listEl.appendChild(createButtonElementFindView(link.title, link.hash, true));
  });

  const titles = Object.keys(pages).filter(t => t !== "Formatting_Examples").sort();
  
  titles.forEach(title => {
      listEl.appendChild(createButtonElementFindView(title, encodeURIComponent(title), false));
  });

  titleInputFindView();
}

function titleInputFindView() {
  const inputEl = document.getElementById('filterInput-find');
  const statusEl = document.getElementById('status-message-find');
  if (!inputEl) return;
  
  const input = inputEl.value.toLowerCase().trim();
  const items = document.querySelectorAll('#page-list-find .titleInput-find');
  let visibleCount = 0;

  items.forEach(li => {
      const buttonText = li.querySelector('button').textContent.toLowerCase();
      
      if (buttonText.includes(input)) {
          li.style.display = "list-item";
          visibleCount++;
      } else {
          li.style.display = "none";
      }
  });

  if (input) {
      statusEl.textContent = `Pages Matching "${input}": ${visibleCount}`;
  } else {
      statusEl.textContent = `Total  Pages Found: ${items.length}`;
  }
  
  document.getElementById('ai-input').value = inputEl.value;
}

function updateConnectionStatus() {
  const el = document.getElementById('status-indicator');
  const banner = document.getElementById('offline-message');
  const online = navigator.onLine;
  if (el) el.textContent = online ? '🟢 Online' : '🔴 Offline';
  if (banner) banner.style.display = online ? 'none' : 'block';
}

function resetHashAndScroll(hash = "#main") {
  history.replaceState(null, null, ' ');
  location.hash = hash;
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const main = document.getElementById("main-content-wrapper");
    if (main) main.scrollTop = 0;
  }, 50);
}

function createButtonElementFindView(title, hash, isStatic) {
      const li = document.createElement('li');
      li.className = 'titleInput-find'; 
      li.setAttribute('data-static', isStatic); 

      const button = document.createElement('button');
      button.textContent = title;
      
      // CSP-SAFE: Use data attributes for linking
      button.setAttribute('data-nav-target', hash);
      button.setAttribute('data-page-target', title);

      li.appendChild(button);
      return li;
  }

async function handleLinkClick(e) {
    e.preventDefault();
    const target = e.target.closest('[data-page-link], [data-page-target], [data-nav-target], [data-create-page]');
    if (!target) return;

    if (target.hasAttribute('data-page-link')) {
        await showPage(target.getAttribute('data-page-link'));
    } else if (target.hasAttribute('data-page-target')) {
        await showPage(target.getAttribute('data-page-target'));
    } else if (target.hasAttribute('data-nav-target')) {
        const hash = target.getAttribute('data-nav-target');
        if (hash === "recent") await showRecent();
        else if (hash === "settings") await showSettings();
        else if (hash === "about") await showAbout();
    } else if (target.hasAttribute('data-create-page')) {
        await createPage(target.getAttribute('data-create-page'));
    }
    
    // Clear search inputs after navigation
    document.getElementById('ai-input').value = ''; 
    document.getElementById('filterInput-find').value = '';
}

// --- START PR 1 FIX: Robust runImport() function (KEPT AS IS) ---

async function runImport() {
    const input = document.getElementById('importDataInput').value;
    const statusMsg = document.getElementById('importStatus');
    statusMsg.innerText = 'Processing...';

    if (!input) {
        statusMsg.innerText = 'Please paste the code first.';
        return;
    }

    try {
        // 1. Parse the JSON
        let importedData = JSON.parse(input);

        // 2. SANITIZATION: Strip out sensitive data before merging
        // This is VITAL to prevent overwriting the current session (currentUser) 
        // and deleting the Admin user's pinHash, which would break login.
        delete importedData.users;
        delete importedData.currentUser;
        // Also ensure no stray pinHash keys at the root level are imported
        delete importedData.pinHash; 

        // 3. Fix the specific encoding glitch in page content
        if (importedData.pages) {
            for (const key in importedData.pages) {
                let page = importedData.pages[key];
                if (page.content) {
                    // Replaces the broken 'â€‘' with a standard hyphen '-'
                    page.content = page.content.replace(/â€‘/g, "-");
                }
            }
        }

        // 4. MERGE DATA (Pages)
        // Load existing pages and merge the imported ones on top (overwriting conflicts)
        const currentPages = await loadData(STORAGE_KEYS.pages, {});
        const newPages = { ...currentPages, ...importedData.pages };
        await saveData(STORAGE_KEYS.pages, newPages);

        // 5. MERGE DATA (Changes/History - optional, but good for completeness)
        if (importedData.changes) {
            const currentChanges = await loadData(STORAGE_KEYS.changes, []);
            // Concatenate the imported changes with the current history
            await saveData(STORAGE_KEYS.changes, [...importedData.changes, ...currentChanges]);
        }
        
        // 6. Final success state
        statusMsg.innerText = "Import successful! Reloading to apply changes...";
        
        // Reload the page to refresh the navigation and current view
        setTimeout(() => {
            location.reload();
        }, 1000);

    } catch (e) {
        // Handle malformed JSON errors gracefully
        console.error('Import Error:', e);
        statusMsg.innerText = `❌ Error importing data: ${e.message}. Check your JSON syntax.`;
    }
}

// --- END PR 1 FIX ---

// --- START PR 2 FIX: Safe Export Function (KEPT AS IS) ---

async function exportData(isContentOnly) {
    // 1. Load the full application state
    const appState = {
        pages: await loadData(STORAGE_KEYS.pages, {}),
        users: await loadData(STORAGE_KEYS.users, []),
        currentUser: getCurrentUser(), // Get the active user object
        changes: await loadData(STORAGE_KEYS.changes, []),
        knowledge: await loadData(STORAGE_KEYS.knowledge, {}),
    };

    let exportData = { ...appState };
    let fileName = `localhost-wiki-backup-${new Date().toISOString().slice(0, 10)}`;

    if (isContentOnly) {
        // 2. SANITIZE: Keep only content and public history
        delete exportData.users;
        delete exportData.currentUser;
        // Do not delete 'changes' as that is often useful historical context
        
        fileName += '-content-only.json';
    } else {
        // 3. FULL BACKUP: Include everything (users, pinHash, etc.)
        fileName += '-full.json';
    }

    // 4. Create the JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 5. Trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    speak(`Exported data to ${fileName}`);
}

// --- END PR 2 FIX ---

// ==========================================================

// 🚀 INITIALIZATION & EVENT BINDING (CSP-SAFE)

// ==========================================================

// Request persistent storage to prevent browser 'eviction'

if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then(granted => {
    if (granted) {
      console.log("✅ Sovereign Data Status: Persistent (Browser will not auto-delete).");
    } else {
      console.log("⚠️ Sovereign Data Status: Best-effort (Browser might delete if space is critical).");
    }
  });
}

// ====== SPLASH SCREEN & SEARCH INITIALIZATION (CSP-SAFE) ======

	// --- Theme Toggle Logic --- feb 28 1030 pm

// ====== SOVEREIGN CONTROLLER: THEME & DATA (CSP-SAFE) ======

// 4. Handle File Processing for Import

// 5. Apply Theme State on Startup

// ====== RECOVERY PERIMETER CONTROLLER (HARDENED) ======

// Ensure your existing Debounce and DOMPurify logic remains below or above this!

 // three js video game mobile browser touch screen

// Dynamic View Switching Module for XML, RSS, and JSON streams
function switchSovereignView(targetPanel) {
    // Force kill splash if it exists
    const splash = document.getElementById('mev-splash-screen');
    if (splash) splash.style.display = 'none';

    // Toggle visibility of main wrapper
    const mainWrapper = document.getElementById('main-content-wrapper');
    if (mainWrapper) mainWrapper.style.display = 'none';
    // Hide standard template elements safely
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    const activePanel = document.getElementById(targetPanel);
    if (!activePanel) return;
    
    activePanel.style.display = 'block';

    // Synchronize storage cache data streams on demand
    if (typeof window.SovereignDataStreams !== 'undefined') {
        if (targetPanel === 'xml') {
            const xmlDisplay = document.getElementById('xml-display');
            if (xmlDisplay) xmlDisplay.value = window.SovereignDataStreams.generateXML();
        } else if (targetPanel === 'json') {
            const jsonOutput = document.getElementById('json-output');
            if (jsonOutput) jsonOutput.textContent = window.SovereignDataStreams.generateJSON();
        } else if (targetPanel === 'rss') {
            const container = document.getElementById('recent-feed-container');
            if (container) {
                const rawRss = window.SovereignDataStreams.generateRSS();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(rawRss, 'text/xml');
                const items = xmlDoc.getElementsByTagName('item');
                let htmlFeed = '';
                for (let i = 0; i < items.length; i++) {
                    const title = items[i].getElementsByTagName('title')[0]?.textContent || 'Untitled Update';
                    const link = items[i].getElementsByTagName('link')[0]?.textContent || '#';
                    const desc = items[i].getElementsByTagName('description')[0]?.textContent || '';
                    htmlFeed += `<div class="feed-item"><h4><a href="${link}">${title}</a></h4><p>${desc}</p></div>`;
                }
                container.innerHTML = htmlFeed || '<p>Empty RSS pipeline.</p>';
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.switchSovereignView = switchSovereignView;
}
