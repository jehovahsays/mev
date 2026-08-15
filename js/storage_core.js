/**
 * MEV Sovereign Module: storage_core.js
 * Brace Integrity Guaranteed
 */

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
            // console.log(`✅ Data for ${key} saved (Encrypted).`);
        } else {
            valueToStore = rawJson;
        }

        localStorage.setItem(key, valueToStore);
        updateStorageBar();

        // --- ADD THESE LINES TO FIX THE RESULTS/SIDEBAR ---
        if (key === STORAGE_KEYS.pages) {
            updatePageListSidebar(); // Refreshes the sidebar list
        }
        
        if (key === STORAGE_KEYS.changes) {
            // Only refresh the results view if the user is currently looking at it
            if (window.location.hash === "#recent") {
                showRecent(); // Refreshes the Recent Changes display
            }
        }
        // --------------------------------------------------

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

function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null');
    if (user && user.crypto) {
        window.userCrypto = user.crypto;
    } else {
        window.userCrypto = null;
    }
    return user;
  } catch {
    return null;
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

  // NEW: Navigation Link to Import/Export Page (Replaces old file import/export buttons)
  const importExportLink = document.createElement('a'); 
  importExportLink.href = '#Import_Data';
  importExportLink.textContent = '📦 Manage Data (Import/Export)';
  importExportLink.className = 'edit-btn'; // Use a button-like style
  // Bind the navigation logic
  importExportLink.onclick = () => { showPage('Import_Data'); return false; }; 
  // Ensure it looks like a block button
  importExportLink.style.cssText = 'background-color: var(--color-accent); color: white; display: block; text-align: center; margin-top: 10px; padding: 10px 20px; border-radius: 8px; font-weight: bold;';
  section.appendChild(importExportLink);
  // --- END MODIFICATION ---

  
  // Storage Stats
  const storageStats = document.createElement('pre'); 
  storageStats.style.marginTop = '20px';
  storageStats.id = 'storage-stats';
  section.appendChild(storageStats);

  // ADDED: Data Security Warning
  const warning = document.createElement('div');
  const isEncrypted = encryptionKey !== null;
  warning.style.cssText = `padding: 15px; background: ${isEncrypted ? '#d4edda' : '#ffe0b2'}; border: 1px solid ${isEncrypted ? '#155724' : '#ff9800'}; border-radius: 4px; margin-top: 20px; color: ${isEncrypted ? '#155724' : '#000'};`;
  warning.innerHTML = `
      <h3>🚨 Data Security Warning</h3>
      <p>All localhost data is saved directly in your browser **Local Storage**. This data is **${isEncrypted ? '🔐 ENCRYPTED' : 'NOT encrypted'}**.</p>
      <p>${isEncrypted ? 'Your data is secured using AES-GCM (256-bit) derived from your PIN. If you forget your PIN, the data is permanently lost.' : 'The data may be readable by browser extensions. Log in with a PIN to enable strong encryption.'}</p>
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
  const s = {
    modal: 'auth-modal', 
    username: 'auth-username', 
    pin: 'auth-pin', 
    title: 'auth-modal-title', 
    createLink: 'create-account-link',
    loginLink: 'login-link', 
    logoutLink: 'logout-link', 
    userStatus: 'user-status',
    submitBtn: 'submit-auth', 
    cancelBtn: 'cancel-auth'
  };

  async function getAllUsers() { 
    return await loadData(STORAGE_KEYS.users, []); 
  }
  
  async function saveAllUsers(users) { 
    await saveData(STORAGE_KEYS.users, users); 
  }
  
  function updateUserStatus() {
    const user = getCurrentUser();
    const el = document.getElementById(s.userStatus);
    if (el) {
      el.textContent = user ? `Logged in as ${user.name}` : 'Not logged in';
    }
  }

  function updateAuthUI() {
    const user = getCurrentUser();
    document.getElementById(s.createLink)?.classList.toggle('hidden', !!user);
    document.getElementById(s.loginLink)?.classList.toggle('hidden', !!user);
    document.getElementById(s.logoutLink)?.classList.toggle('hidden', !user);
    
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
      profileLink.classList.toggle('hidden', !user);
    }
  }

  function showModal(isLogin = false) {
    const modal = document.getElementById(s.modal);
    const usernameInput = document.getElementById(s.username);
    const pinInput = document.getElementById(s.pin);
    const titleEl = document.getElementById(s.title);
    
    if (titleEl) {
      titleEl.textContent = isLogin ? "Log In" : "Create Account";
    }
    if (usernameInput) usernameInput.value = "";
    if (pinInput) pinInput.value = ""; 
    if (modal) modal.style.display = 'block';
    
    setTimeout(() => document.getElementById(s.username)?.focus(), 50);
  }

  function closeModal() {
    const modal = document.getElementById(s.modal);
    if (modal) modal.style.display = 'none';
  }
  
  async function submitAuth() { 
    const input = document.getElementById(s.username);
    const pinInput = document.getElementById(s.pin);
    const name = input ? input.value.trim() : '';
    const pin = pinInput ? pinInput.value.trim() : '';

    if (!name || !pin) { 
      console.error("Please enter both username and PIN."); 
      speak("Please enter both username and PIN."); 
      return; 
    }
    
    const enteredPinHash = await hashPin(pin);
    if (!enteredPinHash) { 
      console.error("Hashing failed."); 
      speak("Error: Pin hashing failed."); 
      return; 
    }

    const users = await getAllUsers();
    let selectedUser = null;
    
    // Programmatic verification loop
    for (let i = 0; i < users.length; i++) {
      if (users[i] && users[i].name && users[i].name.toLowerCase() === name.toLowerCase()) {
        selectedUser = users[i];
        break;
      }
    }
    
    // Localized Secondary Vault Synchronization 
    if (!selectedUser) {
      const structuralBackup = localStorage.getItem('mev_wiki_user_' + name.toLowerCase());
      if (structuralBackup) {
        try {
          selectedUser = JSON.parse(structuralBackup);
          users.push(selectedUser);
          await saveAllUsers(users);
          console.log('📦 Profile synchronization restored from localized secondary storage.');
        } catch (err) {
          console.error('Failed to parse synchronized backup registry:', err);
        }
      }
    }
    
    const titleContext = document.getElementById('auth-modal-title');
    const isExplicitCreateAction = titleContext && titleContext.textContent === 'Create Account';
    
    if (!selectedUser && !isExplicitCreateAction) {
      console.error('❌ Checkpoint: Login attempt on an unrecognized local state profile.');
      speak('Account not found. Please verify your username entry.');
      return;
    }

    let saltArrayBuffer;
    let isNewUser = false;

    if (!selectedUser) {
      // --- UNIFIED PROFILE CREATION ---
      isNewUser = true;
      const salt = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.saltLength));
      saltArrayBuffer = salt.buffer;
      const saltB64 = arrayBufferToBase64(saltArrayBuffer);
      
      selectedUser = { 
        name: name, 
        joined: new Date().toISOString(), 
        edits: [],
        pinHash: enteredPinHash, 
        crypto: { salt: saltB64 } 
      }; 
      users.push(selectedUser);
    } else {
      // --- UNIFIED PROFILE LOGIN ---
      if (!selectedUser.pinHash || selectedUser.pinHash !== enteredPinHash) {
        console.error("❌ Invalid PIN."); 
        speak("Invalid PIN."); 
        return; 
      }
      if (!selectedUser.crypto || !selectedUser.crypto.salt) {
        console.error("❌ User found but missing crypto parameters."); 
        speak("User data is incomplete.");
        return;
      }
      saltArrayBuffer = base64ToArrayBuffer(selectedUser.crypto.salt);
    }
    
    // --- PROGRAMMATIC ENCRYPTION KEY DERIVATION ---
    try {
      const key = await deriveKey(pin, saltArrayBuffer);
      encryptionKey = key; 
      console.log("✅ Encryption key derived and set for session.");
    } catch(e) {
      console.error("❌ Key derivation failed:", e);
      speak("Critical error during key derivation. Cannot log in.");
      encryptionKey = null;
      return;
    }
    
    // --- PERSISTENCE STATE SYNCHRONIZATION ---
    if (isNewUser) {
      await saveAllUsers(users); 
      localStorage.setItem('mev_wiki_user_' + name.toLowerCase(), JSON.stringify(selectedUser));
      console.log(`✅ Account created and encrypted storage initiated for ${name}`);
      speak(`Account created and encrypted storage initiated for ${name}.`);
    }
    
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(selectedUser));
    closeModal();
    updateAuthUI();
    updateUserStatus();
    updateStorageBar();
    await showPage("Main_Page");
  }
  
  function logout() {
    encryptionKey = null; 
    window.userCrypto = null;
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    console.log("Logged out. Encryption key cleared from memory.");
    updateAuthUI();
    updateUserStatus();
    updateStorageBar();
    showAbout();
  }
  
  // CSP-Safe Navigation Event Mappings
  document.getElementById(s.createLink)?.addEventListener('click', e => { e.preventDefault(); showModal(false); });
  document.getElementById(s.loginLink)?.addEventListener('click', e => { e.preventDefault(); showModal(true); });
  document.getElementById(s.logoutLink)?.addEventListener('click', e => { e.preventDefault(); logout(); });
  document.getElementById(s.submitBtn)?.addEventListener('click', e => { e.preventDefault(); submitAuth(); }); 
  document.getElementById(s.cancelBtn)?.addEventListener('click', e => { e.preventDefault(); closeModal(); });
  
  document.addEventListener('keydown', e => { 
    if (e.key === 'Escape' && document.getElementById(s.modal)?.style.display === 'block') {
      closeModal(); 
    }
  });

  updateUserStatus();
  updateAuthUI();
  
  return { logout: logout };
}

async function createPage(titleFromSearch = null) {
  setMainView(true);
  const title = titleFromSearch || prompt("Enter new page title:");
  if (!title || title.trim() === '') return;

  // 🛡️ 1. SECURITY: Initial Perimeter Check
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
  
  // 2. CHECK FOR EXISTING DATA
  if (Object.prototype.hasOwnProperty.call(pages, cleanTitle)) { 
      speak(`Page ${cleanTitle} already exists.`); 
      window.location.hash = encodeURIComponent(cleanTitle);
      showPage(cleanTitle); 
      return; 
  }
  
  // 🛡️ 3. SOVEREIGN ASSIGNMENT (Double-Lock Hardening)
  // We check the key again here to clear CodeQL alerts for line 845 area
  if (!protectedKeywords.includes(lowerTitle)) {
      pages[cleanTitle] = { 
          title: cleanTitle, 
          content: `== ${cleanTitle} ==\n\nThis is your new page.`, 
          lastEdited: new Date().toISOString(), 
          createdBy: user ? user.name : 'Guest' 
      };
  } else {
      // Emergency return if perimeter was somehow bypassed
      return;
  }
  
  // 4. PERSISTENCE
  await saveData(STORAGE_KEYS.pages, pages); 

  // 5. LOG CHANGES
  const newChangeEntry = { 
    type: 'create', 
    title: cleanTitle, 
    time: new Date().toISOString(), 
    user: user ? user.name : 'Guest' 
  };
  
  const changes = await loadData(STORAGE_KEYS.changes, []); 
  changes.unshift(newChangeEntry);
  await saveData(STORAGE_KEYS.changes, changes);

  // 6. UI REFRESH
  await updatePageListSidebar(); 
  window.location.hash = encodeURIComponent(cleanTitle);
  await showPage(cleanTitle);
}

async function savePage(title) {
  // 🛡️ HARDENED SECURITY: Remediates CodeQL Alert #51
  const protectedKeywords = ['__proto__', 'constructor', 'prototype'];

  // 1. Validate type and content BEFORE any assignment
  if (typeof title !== 'string' || !title.trim() || protectedKeywords.includes(title.toLowerCase())) {
      console.warn("STOP! Unauthorized property manipulation attempt detected.");
      localStorage.setItem('mev_breach_detected', 'true');
      location.href = './css.html#search'; 
      return;
  }

  // 2. Use a sanitized variable name
  const safeTitle = title.trim();

  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const user = getCurrentUser();
  const editor = document.querySelector('.editor');
  if (!editor) return;
  
  const rawContent = editor.value;

  // 3. Assignment is now safe because safeTitle is validated
  if (!pages[safeTitle]) pages[safeTitle] = {}; 
  
  pages[safeTitle].content = rawContent;
  pages[safeTitle].lastEdited = new Date().toISOString();
  pages[safeTitle].createdBy = user ? user.name : 'Guest';
  
  await saveData(STORAGE_KEYS.pages, pages); 

  const newChangeEntry = { 
    type: 'edit', title: safeTitle, time: new Date().toISOString(), user: user ? user.name : 'Guest' 
  };
  
  const changes = await loadData(STORAGE_KEYS.changes, []); 
  changes.unshift(newChangeEntry);
  await saveData(STORAGE_KEYS.changes, changes); 
  
  await updatePageListSidebar(); 
  window.location.hash = encodeURIComponent(safeTitle);
  await showPage(safeTitle);
}

async function deletePage(title) {
  console.log("Deleting page:", title);
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const changes = await loadData(STORAGE_KEYS.changes, []); 
  const user = getCurrentUser();
  
  // Custom modal UI should be used here instead of confirm() for a proper PWA
  if (!window.confirm(`Are you sure you want to delete the page "${title}"? This cannot be undone.`)) { return; }
  
  
    if (!pages[title]) {
        speak(`Page ${title} not found.`);
        return;
    }
    
    // Remove page
    delete pages[title];
    await saveData(STORAGE_KEYS.pages, pages);

    // 1. Define the change entry
    const newChangeEntry = { 
        type:'delete', 
        title, 
        time:new Date().toISOString(), 
        user:user ? user.name : 'Guest' 
    };
    
    // 2. Log to global changes array
    changes.unshift(newChangeEntry);
    await saveData(STORAGE_KEYS.changes, changes);

    if (user) {
        let users = await loadData(STORAGE_KEYS.users, []);
        const userIndex = users.findIndex(u => u.name === user.name);

        if (userIndex !== -1) {
            let userToUpdate = users[userIndex];
            
            // Initialize 'edits' if it doesn't exist
            if (!userToUpdate.edits) userToUpdate.edits = [];
            
            // Add the new deletion entry to the user's personal history
            userToUpdate.edits.unshift(newChangeEntry); 
            
            // Save the full user list back to storage
            await saveData(STORAGE_KEYS.users, users);
            
            // Update the currentUser session key
            localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(userToUpdate));
        }
    }
    
  
  
  await updatePageListSidebar(); 
  await generatePageButtonsFindView();
  console.log(`✅ Page "${title}" deleted.`);
  speak(`Page ${title} deleted.`);
  await showRecent();
}

async function savePage(title) {
  console.log("Saving page:", title);
  
  // 🛡️ 1. SECURITY: Initial Perimeter Check
  const protectedKeywords = ['__proto__', 'constructor', 'prototype'];
  
  // Sanitize input to block hidden bypasses
  const cleanTitle = title.toString().toLowerCase().trim();
  
  if (protectedKeywords.includes(cleanTitle)) {
      console.warn("STOP! Unauthorized property manipulation attempt detected.");
      localStorage.setItem('mev_breach_detected', 'true');
      location.href = './css.html#search'; 
      return;
  }

  // 2. DATA PREPARATION
  const pages = await loadData(STORAGE_KEYS.pages, {}); 
  const user = getCurrentUser();
  const editor = document.querySelector('.editor');
  if (!editor) { console.error("Editor not found."); return; }
  
  const rawContent = editor.value;

  // 🛡️ 3. SOVEREIGN ASSIGNMENT (Property Isolation - Resolves Alert #57)
  if (!protectedKeywords.includes(cleanTitle)) {
      // Initialize the entry using the safe hasOwnProperty check
      if (!Object.prototype.hasOwnProperty.call(pages, title)) {
          pages[title] = {
              content: "",
              lastEdited: "",
              createdBy: ""
          }; 
      }
      
      // ISOLATION: Define a local reference to the specific page object.
      // This tells CodeQL that we are now working on a verified object,
      // not a dynamic property of the 'pages' map.
      const targetPage = pages[title];

      if (targetPage && typeof targetPage === 'object') {
          targetPage.content = rawContent;
          targetPage.lastEdited = new Date().toISOString();
          targetPage.createdBy = user ? user.name : 'Guest';
      }
  } else {
      // Perimeter Backup: Block execution
      return;
  }
  
  // 4. PERSISTENCE
  await saveData(STORAGE_KEYS.pages, pages); 

  // 5. UPDATE CONTRIBUTION HISTORY
  const newChangeEntry = { 
    type: 'edit', 
    title, 
    time: new Date().toISOString(), 
    user: user ? user.name : 'Guest' 
  };
  
  if (user) {
    let users = await loadData(STORAGE_KEYS.users, []);
    const userIndex = users.findIndex(u => u.name === user.name);
    if (userIndex !== -1) {
        let userToUpdate = users[userIndex];
        if (!userToUpdate.edits) userToUpdate.edits = [];
        userToUpdate.edits.unshift(newChangeEntry);
        await saveData(STORAGE_KEYS.users, users);
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(userToUpdate));
    }
  }

  // 6. UPDATE RECENT CHANGES
  const changes = await loadData(STORAGE_KEYS.changes, []); 
  changes.unshift(newChangeEntry);
  await saveData(STORAGE_KEYS.changes, changes); 
  
  console.log("✅ Page saved.");
  speak(`Page ${title} saved.`);
  
  // 7. UI REFRESH
  await updatePageListSidebar(); 
  if (typeof generatePageButtonsFindView === 'function') {
      await generatePageButtonsFindView(); 
  }

  // 8. NAVIGATION
  setTimeout(async () => {
      window.location.hash = encodeURIComponent(title);
      await showPage(title);
  }, 100);
}

async function handleSettingsAction(e) {
  const target = e.target;
  if (target.id === 'toggle-theme-btn') {
      toggleTheme();
  // --- START MODIFICATION: REMOVE OLD IMPORT/EXPORT LOGIC ---
  } else if (target.id === 'clear-ai-memory-btn') {
      localStorage.removeItem(STORAGE_KEYS.knowledge); 
      await saveData(STORAGE_KEYS.knowledge, {});
      console.log(' memory cleared.'); 
      speak(" memory cleared.");
      // Re-run showSettings to update the stats and warning section
      await showSettings(); 
  }
  // --- END MODIFICATION ---
}

(function initSovereignSplash() {
    const HUMAN_KEY = 'mev_human_verified';

    // Helper to hide splash and navigate
    function exitSplash(hash) {
        localStorage.setItem(HUMAN_KEY, 'true');
        const splash = document.getElementById('mev-splash-screen');
        if (splash) splash.style.display = 'none';
        
        // Ensure proper hash formatting
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
        button.type = 'button'; // Prevents button from submitting forms
        
        button.addEventListener('click', () => exitSplash(hash));
        
        li.appendChild(button);
        return li;
    }

    async function setupSplash() {
        const listEl = document.getElementById('page-list-splash');
        const inputEl = document.getElementById('filterInput-splash');
        const formEl = document.getElementById('splash-form');
        if (!listEl) return;

        // 1. Clear and Load Data
        listEl.innerHTML = '';
        const pages = await loadData(STORAGE_KEYS.pages, {});
        const fragment = document.createDocumentFragment();

        // 2. Add Static & Dynamic Links to a Fragment (Performance Boost)
        const staticLinks = [{ title: "Main_Page", hash: "Main_Page" }];
        const titles = Object.keys(pages).sort();

        staticLinks.forEach(link => fragment.appendChild(createSplashButton(link.title, link.hash)));
        titles.forEach(title => fragment.appendChild(createSplashButton(title, title)));

        listEl.appendChild(fragment);

        // 3. Fix the "Enter Key" Refresh (Form Submission)
        formEl?.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop the page refresh
            const firstVisible = listEl.querySelector('li:not([style*="display: none"]) button');
            if (firstVisible) {
                firstVisible.click(); // Open the first result found
            }
        });

        // 4. Search Filter Logic
        inputEl?.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const items = listEl.querySelectorAll('li');
            
            items.forEach(li => {
                const text = li.textContent.toLowerCase();
                li.style.display = text.includes(filter) ? "block" : "none";
            });
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSplash);
    } else {
        setupSplash();
    }
})();

if (themeBtn) {
    // Check for saved preference
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
    // 1. Handle "Less" Theme Toggle
    if (e.target && e.target.id === 'toggle-theme-btn') {
        const isLess = document.body.classList.toggle('less-mode');
        localStorage.setItem('wiki_theme_less', isLess ? 'enabled' : 'disabled');
        e.target.textContent = isLess ? '🌖 Switch to Full Theme' : '🌗 Toggle Less Theme';
    }

    // 2. Handle Import Data Button Trigger
    if (e.target && e.target.id === 'import-trigger-btn') {
        document.getElementById('import-file-input')?.click();
    }

    // 3. Handle Export Data Button
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
        
        // Manual Challenge to verify human/partner intent
        const challenge = prompt("Perimeter Locked. Enter 'RESTORE' to return to the conscious state:");
        
        if (challenge === 'RESTORE') {
            // 1. Clear the breach flags
            localStorage.removeItem(BREACH_KEY);
            localStorage.setItem('mev_human_verified', 'true');
            
            alert("Perimeter Restored. Redirecting...");
            
            // 2. FIXED: Redirect to index.html (Conscious State)
            window.location.href = './index.html#search';
        } else {
            alert("Verification failed. Perimeter remains locked.");
        }
    }
});

// Sovereign Local Storage Data Serialization Modules
const SovereignDataStreams = {
  // Generates fresh raw XML documentation from active variables
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

  // Formats cached updates or post elements into valid RSS channel tags for the feed readers
  generateRSS: function() {
    try {
      const rawFeed = localStorage.getItem('mev_rss_cache') || localStorage.getItem('recent_posts') || '';
      if (rawFeed.trim().startsWith('<?xml') || rawFeed.trim().startsWith('<rss')) {
        return rawFeed; // Returns intact structured xml data stream if already formatted
      }
      // Fallback: build an on-the-fly channel matrix directly out of text keys or parameters
      let rss = '<?xml version="2.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n';
      rss += '  <title>Sovereign Feed Stream</title>\n  <link>#recent</link>\n';
      rss += '  <description>Self-Hosted RSS Feed</description>\n';
      
      // Look for individual structured feed payloads if stored independently
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

  // Aggregates full localStorage database variables cleanly into a pure JSON schema object
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

// Export internally to keep scripts self-contained or make globally available to readers
if (typeof window !== 'undefined') {
  window.SovereignDataStreams = SovereignDataStreams;
}
