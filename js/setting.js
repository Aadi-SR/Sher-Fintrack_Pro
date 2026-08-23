/* ============================================================
   settings.js — profile edits (name, currency), dark mode
   toggle, and full data reset.
   ============================================================ */



const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', e => {
        e.preventDefault();
        const user = Storage.getCurrentUser();
        if (!user) return;

        const name = document.getElementById('settings-name').value.trim();
        const currency = document.getElementById('settings-currency').value;
        if (!name) return;

        // updateUsr take username and update
        Storage.updateUser(user.username, { name, currency });

        document.getElementById('greeting-name').textContent = name;
        refreshAll();
        // amounts re-render with  new currency symbol
    });
}



/* dark mode applies immediately, independent of the Save button,
   and is remembered for next visit */
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
  darkModeToggle.checked = Storage.getDarkMode();
  darkModeToggle.addEventListener('change', () => {
    Storage.setDarkMode(darkModeToggle.checked);
    // darkModeToggle.checked returns true or false depending on whether the checkbox is checked or not
    applyTheme(darkModeToggle.checked);
    window.dispatchEvent(new Event('themechange'));
    // dispatchEvent() is a method that triggers an event on the window object, which can be listened for by other parts of the code 
    // In this case, it triggers a custom 'themechange' event that can be used to update other parts of the UI that depend on the theme
  });
}


const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    const confirmed = confirm(
      'This clears every account and every transaction saved in this browser. This cannot be undone. Continue?'
    );
    if (!confirmed) return;
    Storage.resetAll();
    window.location.href = 'index.html';
  });
}
