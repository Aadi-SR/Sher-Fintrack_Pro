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
        if (!user || user.password !== password) {
            errorEl.textContent = 'That username and password don\u2019t match our records.';
            return;
        }

        Storage.setCurrentUsername(user.username);
        window.location.href = 'home.html';
    });
}


// ======= Register ============

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        const errorEl = document.getElementById('register-error');
        errorEl.textContent = '';

        const name = document.getElementById('name').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const currency = document.getElementById('currency').value;

        if (!name || !username || !password) {
            errorEl.textContent = 'Fill in every field to open your account.';
            return;
        }
        if (password.length < 4) {
            errorEl.textContent = 'Password should be at least 4 characters.';
            return;
        }
        // findUser() is defined in storage.js, which is loaded before this file and is a function that returns a user object if the username exists, or undefined if it doesn't
        // findUser() calls getUsers() which returns an array of all users stored in localStorage, or an empty array if no users are found
        if (Storage.findUser(username)) {
            errorEl.textContent = 'That username is already taken.';
            return;
        }

        Storage.addUser({
            name,
            username,
            password,
            currency
        });

        Storage.setCurrentUsername(username);
        window.location.href = 'home.html';
    });
}

