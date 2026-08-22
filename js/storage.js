const STORAGE_KEYS = {
  USERS: 'financeApp_users',
  CURRENT_USER: 'financeApp_currentUser',
  DARK_MODE: 'financeApp_darkMode',
  TRANSACTIONS_PREFIX: 'financeApp_transactions_'
};


const Storage = {
  // private methd to get the value of a key from localStorage, or return a fallback if it doesn't exist
  _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error(`Storage read failed for ${key}`, e);
      return fallback;
    } 
  },
  // private method to set the value of a key in localStorage
  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Storage write failed for ${key}`, e);
      return false;
    }
  },

  /* ---------- users ---------- */
  //calling those above private methods
  // getUsers() returns an array of all users stored in localStorage, or an empty array if no users are found
  getUsers() {
    return this._get(STORAGE_KEYS.USERS, []);
  },
  saveUsers(users) {
    return this._set(STORAGE_KEYS.USERS, users);
  },
  findUser(username) {
    return this.getUsers().find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
  },
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    return this.saveUsers(users);
  },

  // updates evdn verunn
  updateUser(username, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return users[idx];
  },

  /* ======= user  session ======= */

  getCurrentUsername() {
    return this._get(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUsername(username) {
    return this._set(STORAGE_KEYS.CURRENT_USER, username);
  },
  clearCurrentUsername() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // returns user object
  getCurrentUser() {
    const username = this.getCurrentUsername();
    if (!username) return null;
    return this.findUser(username) || null;
  },

  /* ==========transactions ======== */

  // _txKey() returns the localStorage key for a given user's transactions, e.g. "financeApp_transactions_johndoe"
  // for each user transaction history data will be saved in a seperate key
  _txKey(username) {
    return `${STORAGE_KEYS.TRANSACTIONS_PREFIX}${username.toLowerCase()}`;
  },

  getTransactions(username) {
    return this._get(this._txKey(username), []);
  },
  
  saveTransactions(username, transactions) {
    return this._set(this._txKey(username), transactions);
  },
  addTransaction(username, transaction) {
    const txs = this.getTransactions(username);
    txs.unshift(transaction);
    this.saveTransactions(username, txs);
    return txs;
  },
  deleteTransaction(username, id) {
    const txs = this.getTransactions(username).filter(t => t.id !== id);
    this.saveTransactions(username, txs);
    return txs;
  },
  
  /* ===== theme mode ========= */
  getDarkMode() {
    return this._get(STORAGE_KEYS.DARK_MODE, false); // defaults to light mode
  },
  setDarkMode(isDark) {
    return this._set(STORAGE_KEYS.DARK_MODE, isDark);
  },

  /*  Reset all =============== */
  resetAll() {
    const users = this.getUsers();
    users.forEach(u => localStorage.removeItem(this._txKey(u.username)));
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.DARK_MODE);
  }
};



// to generate unique id for transactions
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}