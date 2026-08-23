/* ============================================================
   main.js — boots the dashboard: guards the route, wires up
   page switching, the add-transaction modal, theme, and logout.
   ============================================================ */


(function init() {
    const user = Storage.getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('greeting-name').textContent = user.name;
    document.getElementById('settings-name').value = user.name;
    document.getElementById('settings-currency').value = user.currency;

    applyTheme(Storage.getDarkMode());

    refreshAll();
    // refreshAll() is defined in transactions.js, which is loaded after this file and is a function that re-renders the dashboard with the current user's transactions and balances
})();



/* ======== Theme togglr =============== */
function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
}

// ========== Dashboard - Setting ========= toggle ===========//

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
    document.getElementById(`page-${pageName}`).classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${pageName}`).classList.add('active');

    if (pageName === 'dashboard' && typeof renderChart === 'function') {
        // Chart.js needs a redraw after being hidden/shown to size correctly
        setTimeout(renderChart, 0);
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => showPage(link.dataset.page));
    // data-page is a custom attribute on the nav links that indicates which page to show when clicked. defined on nav-links buttons
});


// ========== Transaction modeel ==============

function openTxModal() {
    document.getElementById('tx-error').textContent = '';
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeTxModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}



const addTxBtn = document.getElementById('add-tx-btn');
if (addTxBtn) addTxBtn.addEventListener('click', openTxModal);
// button to open the form modal to add a new transaction.

const modalClose = document.getElementById('modal-close');
if (modalClose) modalClose.addEventListener('click', closeTxModal);

const modalCancel = document.getElementById('modal-cancel');
if (modalCancel) modalCancel.addEventListener('click', closeTxModal);

const modalOverlay = document.getElementById('modal-overlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeTxModal();
    });
}



/* ====== logout ============ */
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    Storage.clearCurrentUsername();
    window.location.href = 'index.html';
  });
}