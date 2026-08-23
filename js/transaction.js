/* ============================================================
   transactions.js — everything about transactions: add, delete,
   filter, and rendering the table + summary cards.
   ============================================================ */


const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥'
};

let currentFilter = 'all';
// will be used later to filter between all type, income only and expense only....

function currentSymbol() {
  const user = Storage.getCurrentUser();
  return CURRENCY_SYMBOLS[user?.currency] || '$';
}

function formatAmount(amount) {
  return `${currentSymbol()}${Number(amount).toFixed(2)}`;
}



// rendertransaction ll vilikkum
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}


/*=============== add =========== */
const txForm = document.getElementById('tx-form');
if (txForm) {
  document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
  // toISoString() returns a string in the format YYYY-MM-DDTHH:mm:ss.sssZ, so we slice to get just the date part

  txForm.addEventListener('submit', e => {
    e.preventDefault();
    const errorEl = document.getElementById('tx-error');
    errorEl.textContent = '';

    const type = document.getElementById('tx-type').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const description = document.getElementById('tx-description').value.trim();
    const category = document.getElementById('tx-category').value;
    const date = document.getElementById('tx-date').value;

    if (!description) {
      errorEl.textContent = 'Add a short description for this transaction.';
      return;
    }
    if (!amount || amount <= 0) {
      errorEl.textContent = 'Enter an amount greater than zero.';
      return;
    }
    if (!date) {
      errorEl.textContent = 'Pick a date for this transaction.';
      return;
    }

    const user = Storage.getCurrentUser();
    Storage.addTransaction(user.username, {
      id: generateId(),
      // generateId() is defined in storage.js,   is a function that generates a unique ID for each transaction  using date

      type, amount, description, category, date
    });

    txForm.reset();
    document.getElementById('tx-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('tx-type').value = 'expense';

    refreshAll();
    if (typeof closeTxModal === 'function') closeTxModal();
    // defensive check before calling the function
  });
}



// ========= Filter =============

//1st ryn the function attaches an add event listener to each button.

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    // this removes the 'active' class from all filter buttons, so that only the clicked button will have the 'active' class
    btn.classList.add('active');
    // btn remembers the specific btn , when clicked that button would grt the active class
    currentFilter = btn.dataset.filter;
    renderTransactionTable();
  });
});



/* ================== delete (event delegation)============= */
const txTableBody = document.getElementById('tx-table-body');
if (txTableBody) {
  txTableBody.addEventListener('click', e => {
    const btn = e.target.closest('.tx-delete');
    if (!btn) return;
    const user = Storage.getCurrentUser();
    Storage.deleteTransaction(user.username, btn.dataset.id);
    refreshAll();
  });
}



// ============= Rendering ================


function getAllTransactions() {
  const user = Storage.getCurrentUser();
  if (!user) return [];
  return Storage.getTransactions(user.username);
  // getTransactions() internally calls _txKey() to get the localStorage key for the user's transactions, and then retrieves the transactions from localStorage
}

function getFilteredTransactions() {
  const all = getAllTransactions();
  if (currentFilter === 'all') return all;
  return all.filter(t => t.type === currentFilter);
}

function renderTransactionTable() {
  const list = getFilteredTransactions();
  const bodyEl = document.getElementById('tx-table-body');
  const emptyEl = document.getElementById('tx-empty');
  if (!bodyEl) return;

  bodyEl.innerHTML = '';

  if (list.length === 0) {
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  // hidse the empty message if there are transactions to show - p tag

  list.forEach(tx => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(tx.date)}</td>
      <td class="tx-desc">${escapeHtml(tx.description)}</td>
      <td><span class="category-pill">${escapeHtml(tx.category)}</span></td>
      <td class="amount-cell ${tx.type}">${tx.type === 'income' ? '+' : '−'}${formatAmount(tx.amount)}</td>
      <td><button class="tx-delete" data-id="${tx.id}" aria-label="Delete transaction">✕</button></td>
    `;
    bodyEl.appendChild(row);
  });
}



function renderSummary() {
  const all = getAllTransactions();

  const income = all.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  document.getElementById('stat-balance').textContent = formatAmount(balance);
  document.getElementById('stat-income').textContent = formatAmount(income);
  document.getElementById('stat-expense').textContent = formatAmount(expense);
  document.getElementById('stat-count').textContent = all.length;
}



function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
// to escape HTML special characters in the description and category fields, preventing XSS attacks (cross site scripting)



/* called any time the underlying data changes — the golden rule:
   one master refresh keeps cards, table, and chart in sync */
function refreshAll() {
  renderSummary();
  renderTransactionTable();
  if (typeof renderChart === 'function') renderChart();
}
