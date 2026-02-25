/* =============================================
   FLEX GYM — Utility helpers (not auto-loaded)
   ============================================= */

// Sidebar toggle helpers (also defined in scripts.js for pages that load it)
function openSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebar-overlay');
    if (s) s.classList.add('open');
    if (o) o.classList.add('active');
}

function closeSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebar-overlay');
    if (s) s.classList.remove('open');
    if (o) o.classList.remove('active');
}

// Workout details modal
function openWorkoutDetails(workout) {
    if (typeof showToast === 'function') {
        showToast(`${workout}: Full body, 60 mins, high intensity.`, 'info');
    }
}

// Class details
function openClassDetails(className) {
    if (typeof showToast === 'function') {
        showToast(`${className}: Expert-guided session. Book on the Classes page.`, 'info');
    }
}

// Create new workout plan placeholder
function createNewPlan() {
    if (typeof showToast === 'function') {
        showToast('Custom workout plan builder coming soon!', 'info');
    }
}
