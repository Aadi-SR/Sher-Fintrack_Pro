// Auth.js manages both login and register


// Login ========

const loginForm = document.getElementById('login-form');
if (loginForm) {
  // if already logged in, skip straight to the dashboard
  if (Storage.getCurrentUsername()) {
    // getCurrentUsername() is defined in storage.js, which is loaded before this file
    window.location.href = 'home.html';
  }

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      errorEl.textContent = 'Enter both a username and a password.';
      return;
    }

    // Storage is defined in storage.js, which is loaded before this file and is an object
    const user = Storage.findUser(username);
    if (!user || user.password !== password){
      errorEl.textContent = 'That username and password don\u2019t match our records.';
      return;
    }

    Storage.setCurrentUsername(user.username);
    window.location.href = 'home.html';
  });
}


// ======= Register ============

