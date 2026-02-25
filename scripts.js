/* =============================================
   FLEX GYM — Main Application Logic
   ============================================= */

// Apply saved theme immediately (before DOM ready)
(function () {
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light-mode');
        document.body && document.body.classList.add('light-mode');
    }
})();

// ---- Toast Notification System ----
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-feather="${icons[type] || 'info'}" style="width:16px;height:16px;flex-shrink:0;color:${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--info)'}"></i><span>${message}</span>`;
    container.appendChild(toast);
    if (typeof feather !== 'undefined') feather.replace();
    setTimeout(() => {
        toast.style.animation = 'toast-slide-out 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ---- Mobile Sidebar ----
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close-btn');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    if (closeBtn) closeBtn.style.display = 'flex';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close-btn');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (closeBtn) closeBtn.style.display = 'none';
}

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }

    feather.replace();
    loadDashboardStats();
    loadNutritionData();
    loadProgressData();
    loadCommunityPosts();
    loadWorkoutHistory();
    loadMembershipStatus();
    loadAchievements();
    loadClassSchedule();
    updateAISuggestion();
    generateNutritionPlan();
    loadEquipmentBooking();
    loadTrainerSchedule();
    loadClassLeaderboard();
    loadMyBookings();
    loadGoalProgress();

    if (document.getElementById('meal-form')) hideMealForm();
    if (document.getElementById('progress-form')) hideProgressForm();

    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }

    initProgressChart();

    if (document.getElementById('chatbot-messages')) {
        addChatbotMessage("Hi! I'm your AI Trainer. Ask me anything about workouts, nutrition, or classes.", true);
    }

    if ('DeviceMotionEvent' in window && document.getElementById('rep-count')) {
        window.addEventListener('devicemotion', handleMotion);
    }

    // Inject header UI (notification bell + profile button)
    injectHeaderUI();

    // Inject global modals into body
    injectModals();

    // Handle URL params (e.g. trainers.html?book=John+Smith)
    handleURLParams();

    // Close notification dropdown when clicking outside
    document.addEventListener('click', function (e) {
        const wrapper = document.getElementById('notif-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            const dd = document.getElementById('notif-dropdown');
            if (dd) dd.classList.remove('open');
        }
    });
});

// ---- Theme ----
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isLight = document.body.classList.contains('light-mode');
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.setAttribute('data-feather', isLight ? 'sun' : 'moon');
        feather.replace();
    }
}

// ---- Dynamic Header UI Injection ----
function injectHeaderUI() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle || document.getElementById('notif-wrapper')) return;

    // Notification bell
    const bellWrapper = document.createElement('div');
    bellWrapper.id = 'notif-wrapper';
    bellWrapper.innerHTML = `
        <button id="notif-btn" onclick="toggleNotifications()" title="Notifications">
            <i data-feather="bell" style="width:18px;height:18px"></i>
            <span id="notif-badge"></span>
        </button>
        <div id="notif-dropdown">
            <div style="padding:0.875rem 1rem;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:0.875rem;font-weight:700">Notifications</span>
                <button onclick="markAllRead()" style="font-size:0.72rem;color:var(--accent);background:none;border:none;cursor:pointer;font-family:inherit">Mark all read</button>
            </div>
            <div id="notif-list" style="max-height:300px;overflow-y:auto"></div>
        </div>
    `;
    themeToggle.parentNode.insertBefore(bellWrapper, themeToggle);

    // Profile button
    const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const displayName = (profile.name || 'John Doe').split(' ')[0];
    const profileBtn = document.createElement('button');
    profileBtn.id = 'profile-btn';
    profileBtn.title = 'Edit Profile';
    profileBtn.onclick = openProfileModal;
    profileBtn.innerHTML = `<i data-feather="user" style="width:15px;height:15px"></i> <span id="header-username">${displayName}</span>`;
    themeToggle.parentNode.insertBefore(profileBtn, themeToggle);

    feather.replace();
    updateNotifBadge();
}

// ---- Global Modals Injection ----
function injectModals() {
    if (document.getElementById('booking-modal')) return;

    // Booking confirmation modal (classes)
    const bookingModal = document.createElement('div');
    bookingModal.id = 'booking-modal';
    bookingModal.className = 'modal-overlay hidden';
    bookingModal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h4 id="modal-title">Confirm Booking</h4>
                <button class="modal-close-btn" onclick="closeBookingModal()"><i data-feather="x" style="width:18px;height:18px"></i></button>
            </div>
            <div class="modal-body" id="modal-body"></div>
            <div class="modal-footer">
                <button class="btn-outline" style="padding:0.55rem 1.25rem;border-radius:8px" onclick="closeBookingModal()">Cancel</button>
                <button class="btn-primary" style="border-radius:8px;padding:0.6rem 1.5rem" onclick="confirmBooking()">
                    <i data-feather="check" style="width:15px;height:15px"></i> Confirm
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(bookingModal);

    // Trainer booking modal
    const trainerModal = document.createElement('div');
    trainerModal.id = 'trainer-modal';
    trainerModal.className = 'modal-overlay hidden';
    trainerModal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h4>Book a Session</h4>
                <button class="modal-close-btn" onclick="closeTrainerModal()"><i data-feather="x" style="width:18px;height:18px"></i></button>
            </div>
            <div class="modal-body">
                <div style="display:flex;align-items:center;gap:0.875rem;padding:1rem;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:10px;margin-bottom:1.25rem">
                    <div style="width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                        <i data-feather="user" style="width:20px;height:20px;color:var(--accent)"></i>
                    </div>
                    <div>
                        <p style="font-size:0.82rem;color:var(--text-secondary);margin:0">Trainer</p>
                        <p style="font-size:1rem;font-weight:700;margin:0" id="tmodal-name"></p>
                    </div>
                </div>
                <div style="margin-bottom:1rem">
                    <label>Select Time Slot</label>
                    <select id="tmodal-time"></select>
                </div>
                <div>
                    <label>Notes (optional)</label>
                    <textarea id="tmodal-notes" placeholder="Any goals or areas to focus on..." rows="2" style="resize:none"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-outline" style="padding:0.55rem 1.25rem;border-radius:8px" onclick="closeTrainerModal()">Cancel</button>
                <button class="btn-primary" style="border-radius:8px;padding:0.6rem 1.5rem" onclick="confirmTrainerBooking()">
                    <i data-feather="calendar" style="width:15px;height:15px"></i> Book Session
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(trainerModal);

    // Profile modal
    const profileModal = document.createElement('div');
    profileModal.id = 'profile-modal';
    profileModal.className = 'modal-overlay hidden';
    const prof = JSON.parse(localStorage.getItem('userProfile')) || { name: 'John Doe', age: 28, height: 70, weight: 180, goal: 'muscle-gain' };
    profileModal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h4>Edit Profile</h4>
                <button class="modal-close-btn" onclick="closeProfileModal()"><i data-feather="x" style="width:18px;height:18px"></i></button>
            </div>
            <form onsubmit="saveProfile(event)">
            <div class="modal-body" style="display:flex;flex-direction:column;gap:0.875rem">
                <div>
                    <label>Full Name</label>
                    <input type="text" id="profile-name-input" value="${prof.name}" required>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label>Age</label>
                        <input type="number" id="profile-age-input" value="${prof.age}" min="10" max="100">
                    </div>
                    <div>
                        <label>Height (in)</label>
                        <input type="number" id="profile-height-input" value="${prof.height}" min="36" max="96" step="0.5">
                    </div>
                </div>
                <div>
                    <label>Current Weight (lbs)</label>
                    <input type="number" id="profile-weight-input" value="${prof.weight}" min="50" max="500" step="0.1">
                </div>
                <div>
                    <label>Primary Goal</label>
                    <select id="profile-goal-input">
                        <option value="fat-loss" ${prof.goal === 'fat-loss' ? 'selected' : ''}>Fat Loss</option>
                        <option value="muscle-gain" ${prof.goal === 'muscle-gain' ? 'selected' : ''}>Muscle Gain</option>
                        <option value="maintenance" ${prof.goal === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="endurance" ${prof.goal === 'endurance' ? 'selected' : ''}>Endurance</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-outline" style="padding:0.55rem 1.25rem;border-radius:8px" onclick="closeProfileModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="border-radius:8px;padding:0.6rem 1.5rem">
                    <i data-feather="save" style="width:15px;height:15px"></i> Save Profile
                </button>
            </div>
            </form>
        </div>
    `;
    document.body.appendChild(profileModal);

    feather.replace();
}

// ---- URL Params Handler ----
function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const bookName = params.get('book');
    if (bookName) {
        const name = decodeURIComponent(bookName);
        setTimeout(() => showTrainerProfile(name), 400);
    }
}

// ---- Notification System ----
function addNotification(message, type = 'info') {
    let notifs = JSON.parse(localStorage.getItem('notifications')) || [];
    notifs.unshift({ id: Date.now(), message, type, read: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (notifs.length > 25) notifs = notifs.slice(0, 25);
    localStorage.setItem('notifications', JSON.stringify(notifs));
    updateNotifBadge();
}

function loadNotifications() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    const notifs = JSON.parse(localStorage.getItem('notifications')) || [];

    if (!notifs.length) {
        list.innerHTML = '<p style="padding:1.25rem;font-size:0.82rem;color:var(--text-secondary);text-align:center">No notifications yet</p>';
        return;
    }

    const icons = { success: 'check-circle', error: 'x-circle', info: 'bell', booking: 'calendar' };
    const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--info)', booking: 'var(--accent)' };

    list.innerHTML = notifs.map(n => `
        <div class="notif-item" style="${!n.read ? 'background:rgba(245,158,11,0.03)' : ''}">
            <i data-feather="${icons[n.type] || 'bell'}" style="width:14px;height:14px;color:${colors[n.type] || 'var(--accent)'};flex-shrink:0;margin-top:2px"></i>
            <div style="flex:1;min-width:0">
                <p style="font-size:0.8rem;margin:0;line-height:1.45;color:var(--text-primary)">${n.message}</p>
                <p style="font-size:0.7rem;color:var(--text-secondary);margin:0.2rem 0 0">${n.time}</p>
            </div>
            ${!n.read ? '<span style="width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:5px"></span>' : ''}
        </div>
    `).join('');
    feather.replace();
    updateNotifBadge();
}

function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    const notifs = JSON.parse(localStorage.getItem('notifications')) || [];
    const unread = notifs.filter(n => !n.read).length;
    badge.textContent = unread > 9 ? '9+' : unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
}

function toggleNotifications() {
    const dd = document.getElementById('notif-dropdown');
    if (!dd) return;
    const isOpen = dd.classList.contains('open');
    dd.classList.toggle('open', !isOpen);
    if (!isOpen) loadNotifications();
}

function markAllRead() {
    let notifs = JSON.parse(localStorage.getItem('notifications')) || [];
    notifs = notifs.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(notifs));
    updateNotifBadge();
    loadNotifications();
}

// ---- Booking Modal (Classes) ----
let pendingBooking = null;

function openBookingModal(className) {
    pendingBooking = { type: 'class', name: className };
    const modal = document.getElementById('booking-modal');
    if (!modal) { bookClassDirect(className); return; }

    document.getElementById('modal-title').textContent = 'Confirm Class Booking';
    document.getElementById('modal-body').innerHTML = `
        <div style="display:flex;align-items:center;gap:0.875rem;padding:1rem;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.12);border-radius:10px;margin-bottom:1rem">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <i data-feather="users" style="width:18px;height:18px;color:var(--accent)"></i>
            </div>
            <div>
                <p style="font-size:0.78rem;color:var(--text-secondary);margin:0">Class</p>
                <p style="font-size:0.95rem;font-weight:700;margin:0">${className}</p>
            </div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;line-height:1.6">You are about to book <strong style="color:var(--text-primary)">${className}</strong>. One class credit will be used from your membership. You can cancel up to 2 hours before the session.</p>
    `;
    modal.classList.remove('hidden');
    feather.replace();
}

function closeBookingModal() {
    pendingBooking = null;
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmBooking() {
    if (!pendingBooking) return;
    bookClassDirect(pendingBooking.name);
    closeBookingModal();
}

function bookClassDirect(className) {
    let stats = JSON.parse(localStorage.getItem('dashboardStats')) || { workouts: 24, calories: 3500, classes: 8, records: 5 };
    stats.classes += 1;
    stats.workouts += 1;
    stats.calories += 300;
    localStorage.setItem('dashboardStats', JSON.stringify(stats));

    let leaderboard = JSON.parse(localStorage.getItem('classLeaderboard')) || { 'John Doe': 8 };
    leaderboard['John Doe'] = (leaderboard['John Doe'] || 0) + 1;
    localStorage.setItem('classLeaderboard', JSON.stringify(leaderboard));

    let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    bookings.unshift({ type: 'class', name: className, extra: new Date().toLocaleString(), date: new Date().toLocaleString() });
    localStorage.setItem('myBookings', JSON.stringify(bookings));

    addNotification(`"${className}" class booked successfully!`, 'booking');
    showToast(`"${className}" booked! See you there.`, 'success');
    loadDashboardStats();
    loadAchievements();
    loadClassLeaderboard();
    loadMyBookings();
}

function bookClass(className) {
    openBookingModal(className);
}

// ---- Trainer Booking Modal ----
function showTrainerProfile(name) {
    const trainerSlots = {
        'John Smith':    ['Today 5:00 PM', 'Tomorrow 9:00 AM', 'Wed 6:00 PM', 'Thu 10:00 AM'],
        'Sarah Johnson': ['Tomorrow 8:00 AM', 'Tomorrow 2:00 PM', 'Fri 9:00 AM', 'Sat 11:00 AM'],
        'Mike Torres':   ['Today 7:00 PM', 'Tomorrow 11:00 AM', 'Thu 5:30 PM', 'Sat 9:00 AM']
    };
    const times = trainerSlots[name] || ['Tomorrow 10:00 AM', 'Day after 3:00 PM'];
    openTrainerBookingModal(name, times);
}

function openTrainerBookingModal(name, times) {
    const modal = document.getElementById('trainer-modal');
    if (!modal) return;
    document.getElementById('tmodal-name').textContent = name;
    const select = document.getElementById('tmodal-time');
    select.innerHTML = times.map(t => `<option value="${t}">${t}</option>`).join('');
    const notes = document.getElementById('tmodal-notes');
    if (notes) notes.value = '';
    modal.classList.remove('hidden');
    feather.replace();
}

function confirmTrainerBooking() {
    const name = document.getElementById('tmodal-name')?.textContent;
    const time = document.getElementById('tmodal-time')?.value;
    if (!name || !time) return;

    let bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    bookings.unshift({ type: 'trainer', name, extra: time, date: new Date().toLocaleString() });
    localStorage.setItem('myBookings', JSON.stringify(bookings));

    addNotification(`Session with ${name} at ${time} confirmed!`, 'booking');
    showToast(`Session with ${name} booked for ${time}!`, 'success');
    closeTrainerModal();
    loadMyBookings();
}

function closeTrainerModal() {
    const modal = document.getElementById('trainer-modal');
    if (modal) modal.classList.add('hidden');
}

// Navigate to trainers.html to book (used from classes page)
function bookTrainer(name, time) {
    window.location.href = `trainers.html?book=${encodeURIComponent(name)}`;
}

// ---- Profile Modal ----
function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    const prof = JSON.parse(localStorage.getItem('userProfile')) || { name: 'John Doe', age: 28, height: 70, weight: 180, goal: 'muscle-gain' };
    const nameEl = document.getElementById('profile-name-input');
    const ageEl  = document.getElementById('profile-age-input');
    const htEl   = document.getElementById('profile-height-input');
    const wtEl   = document.getElementById('profile-weight-input');
    const goalEl = document.getElementById('profile-goal-input');
    if (nameEl) nameEl.value = prof.name;
    if (ageEl)  ageEl.value  = prof.age;
    if (htEl)   htEl.value   = prof.height;
    if (wtEl)   wtEl.value   = prof.weight;
    if (goalEl) goalEl.value = prof.goal;
    modal.classList.remove('hidden');
    feather.replace();
}

function saveProfile(event) {
    event.preventDefault();
    const prof = {
        name:   document.getElementById('profile-name-input')?.value || 'John Doe',
        age:    parseInt(document.getElementById('profile-age-input')?.value || 28),
        height: parseFloat(document.getElementById('profile-height-input')?.value || 70),
        weight: parseFloat(document.getElementById('profile-weight-input')?.value || 180),
        goal:   document.getElementById('profile-goal-input')?.value || 'muscle-gain'
    };
    localStorage.setItem('userProfile', JSON.stringify(prof));

    const first = prof.name.split(' ')[0];
    const usernameEl = document.getElementById('header-username');
    if (usernameEl) usernameEl.textContent = first;

    const sidebarName = document.querySelector('[style*="font-size:0.875rem;font-weight:600"]');
    if (sidebarName && sidebarName.tagName === 'P') sidebarName.textContent = prof.name;

    closeProfileModal();
    showToast('Profile updated successfully!', 'success');
    addNotification(`Profile updated — goal: ${prof.goal.replace('-', ' ')}.`, 'success');
    generateNutritionPlan();
    updateAISuggestion();
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
}

// ---- Chatbot ----
function toggleChatbot() {
    const panel = document.getElementById('chatbot-panel');
    if (panel) panel.classList.toggle('hidden');
}

function addChatbotMessage(message, isBot = false) {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = isBot ? 'msg-bot' : 'msg-user';
    div.textContent = message;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbot-input');
    if (!input || !input.value.trim()) return;
    const message = input.value.trim();
    addChatbotMessage(message, false);
    input.value = '';

    setTimeout(() => {
        const lower = message.toLowerCase();
        let response = "I'm here to help! Ask about workouts, nutrition, classes, trainers, or your progress.";
        if (lower.includes('workout') || lower.includes('exercise'))
            response = 'Try the Full Body Blast in the Workout Plan section for a great full-body session!';
        else if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('food') || lower.includes('meal'))
            response = 'Check the Nutrition page for your personalized meal plan and macro tracking!';
        else if (lower.includes('class') || lower.includes('yoga') || lower.includes('hiit') || lower.includes('strength'))
            response = 'Head to the Classes page to book Strength Training, Yoga Flow, or HIIT Cardio!';
        else if (lower.includes('equipment'))
            response = 'Reserve gym equipment on the Workout Plan page before your session!';
        else if (lower.includes('trainer') || lower.includes('coach') || lower.includes('pt'))
            response = 'Visit the Trainers page to book a one-on-one session with John, Sarah, or Mike!';
        else if (lower.includes('price') || lower.includes('membership') || lower.includes('plan'))
            response = 'Check the Pricing page for our Basic ($29), Premium ($59), and Elite ($99) plans!';
        else if (lower.includes('progress') || lower.includes('weight') || lower.includes('bmi'))
            response = 'Track your body composition on the Progress page. You can also calculate your BMI there!';
        else if (lower.includes('community') || lower.includes('post') || lower.includes('share'))
            response = 'Join the Community page to share your wins, get tips, and connect with 5,000+ members!';
        else if (lower.includes('contact') || lower.includes('support') || lower.includes('help'))
            response = 'Visit the Contact page or send us a message — we reply within 24 hours!';
        addChatbotMessage(response, true);
    }, 600);
}

// ---- Dashboard Stats ----
function loadDashboardStats() {
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || { workouts: 24, calories: 3500, classes: 8, records: 5 };
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('workouts-count', stats.workouts);
    set('calories-count', stats.calories.toLocaleString());
    set('classes-count', stats.classes);
    set('records-count', stats.records);
}

function loadMembershipStatus() {
    const plan = localStorage.getItem('selectedPlan') || 'Basic';
    const el = document.getElementById('membership-status');
    if (el) el.textContent = plan;
    const sidebar = document.getElementById('sidebar-plan');
    if (sidebar) sidebar.textContent = `${plan} Member`;
}

function loadAchievements() {
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || { workouts: 24, calories: 3500, classes: 8, records: 5 };
    const achievements = [
        { name: 'Workout Warrior', desc: '50 workouts completed', condition: stats.workouts >= 50, icon: 'award', color: '#f59e0b' },
        { name: 'Calorie Crusher', desc: '10,000 calories burned', condition: stats.calories >= 10000, icon: 'zap', color: '#22c55e' },
        { name: 'Class Champion', desc: '20 classes attended', condition: stats.classes >= 20, icon: 'users', color: '#3b82f6' }
    ];
    const container = document.getElementById('achievements');
    if (!container) return;
    container.innerHTML = achievements.map(a => `
        <div class="achievement-item ${a.condition ? 'earned' : ''}">
            <div class="icon-circle" style="background:${a.condition ? `rgba(${a.color === '#f59e0b' ? '245,158,11' : a.color === '#22c55e' ? '34,197,94' : '59,130,246'},0.15)` : 'rgba(255,255,255,0.04)'};border:1px solid ${a.condition ? `${a.color}33` : 'var(--border)'}">
                <i data-feather="${a.icon}" style="width:18px;height:18px;color:${a.condition ? a.color : 'var(--text-secondary)'}"></i>
            </div>
            <div style="flex:1;min-width:0">
                <p style="font-size:0.875rem;font-weight:600;margin:0">${a.name}</p>
                <p style="font-size:0.75rem;color:var(--text-secondary);margin:0">${a.desc}</p>
            </div>
            <span class="badge ${a.condition ? 'badge-success' : ''}" style="${!a.condition ? 'background:rgba(255,255,255,0.04);color:var(--text-secondary);border:1px solid var(--border)' : ''}">${a.condition ? 'Earned' : 'Locked'}</span>
        </div>
    `).join('');
    feather.replace();
}

// ---- My Bookings ----
function loadMyBookings() {
    const container = document.getElementById('my-bookings');
    if (!container) return;
    const bookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    if (!bookings.length) {
        container.innerHTML = '<p style="color:var(--text-secondary);font-size:0.85rem;padding:0.5rem 0">No bookings yet. Book a class or trainer session!</p>';
        return;
    }
    const typeColors = { class: 'badge-success', trainer: 'badge-accent' };
    container.innerHTML = bookings.slice(0, 6).map(b => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border)">
            <div>
                <p style="font-size:0.85rem;font-weight:600;margin:0">${b.name}</p>
                <p style="font-size:0.72rem;color:var(--text-secondary);margin:0.1rem 0 0">${b.extra || b.date}</p>
            </div>
            <span class="badge ${typeColors[b.type] || 'badge-info'}">${b.type}</span>
        </div>
    `).join('');
}

// ---- Workout Tracker ----
let timerInterval = null;
let repCount = 0;
let calorieBurn = 0;
let startTime = null;

function startTimer(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    let timeLeft = seconds;
    startTime = Date.now();
    updateTimerDisplay(timeLeft);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        calorieBurn += 0.14;
        updateTrackerDisplay();
        updateIntensityFeedback();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            showToast('Workout time is up! Great session!', 'success');
            updateIntensityFeedback(true);
        }
    }, 1000);
    showToast('Timer started — let\'s go!', 'info');
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTime = null;
        updateTimerDisplay(0);
        updateIntensityFeedback(true);
        showToast('Timer stopped.', 'info');
    }
}

function updateTimerDisplay(seconds) {
    const display = document.getElementById('timer-display');
    if (display) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}

function addRep() {
    repCount += 1;
    calorieBurn += 5;
    updateTrackerDisplay();
    updateIntensityFeedback();
}

function resetTracker() {
    repCount = 0;
    calorieBurn = 0;
    startTime = null;
    updateTrackerDisplay();
    updateIntensityFeedback();
    showToast('Tracker reset.', 'info');
}

function updateTrackerDisplay() {
    const r = document.getElementById('rep-count');
    const c = document.getElementById('calorie-burn');
    if (r) r.textContent = repCount;
    if (c) c.textContent = Math.round(calorieBurn);
}

function handleMotion(event) {
    if (event.accelerationIncludingGravity && event.accelerationIncludingGravity.z > 10) addRep();
}

function updateIntensityFeedback(isComplete = false) {
    const feedback = document.getElementById('intensity-feedback');
    if (!feedback) return;
    if (!startTime && !isComplete) {
        feedback.textContent = 'Start the timer to analyze intensity.';
        feedback.style.color = 'var(--text-secondary)';
        return;
    }
    const elapsed = (Date.now() - (startTime || Date.now())) / 60000;
    const intensity = repCount / (elapsed || 1);
    const level = intensity > 20 ? 'High' : intensity > 10 ? 'Moderate' : 'Low';
    const colors = { High: 'var(--success)', Moderate: 'var(--accent)', Low: 'var(--info)' };
    if (isComplete) {
        const msgs = { High: 'High Intensity — Outstanding! You crushed it!', Moderate: 'Moderate — Solid work! Push harder next time.', Low: 'Low — Good start! Increase reps or pace.' };
        feedback.textContent = msgs[level];
    } else {
        feedback.textContent = `Current: ${level} Intensity (${Math.round(intensity)} reps/min)`;
    }
    feedback.style.color = colors[level];
}

function completeWorkout() {
    let stats = JSON.parse(localStorage.getItem('dashboardStats')) || { workouts: 24, calories: 3500, classes: 8, records: 5 };
    stats.workouts += 1;
    stats.calories += Math.round(calorieBurn) || 500;
    localStorage.setItem('dashboardStats', JSON.stringify(stats));

    let history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    history.unshift({ name: 'Full Body Blast', timestamp: new Date().toLocaleString(), calories: Math.round(calorieBurn) || 500, reps: repCount });
    localStorage.setItem('workoutHistory', JSON.stringify(history));

    resetTracker();
    addNotification(`Workout completed! ${Math.round(calorieBurn) || 500} calories burned.`, 'success');
    showToast('Workout completed! Stats updated.', 'success');
    loadWorkoutHistory();
    loadDashboardStats();
    loadAchievements();
}

function loadWorkoutHistory() {
    const container = document.getElementById('workout-history');
    if (!container) return;
    const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    if (!history.length) {
        container.innerHTML = '<p style="color:var(--text-secondary);font-size:0.875rem">No workout history yet. Complete a workout to see it here.</p>';
        return;
    }
    container.innerHTML = history.slice(0, 5).map(e => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border)">
            <div>
                <p style="font-size:0.875rem;font-weight:600;margin:0">${e.name}</p>
                <p style="font-size:0.75rem;color:var(--text-secondary);margin:0">${e.timestamp}</p>
            </div>
            <div style="text-align:right">
                <p style="font-size:0.875rem;color:var(--accent);font-weight:600;margin:0">${e.calories} cal</p>
                <p style="font-size:0.75rem;color:var(--text-secondary);margin:0">${e.reps || 0} reps</p>
            </div>
        </div>
    `).join('');
}

function updateAISuggestion() {
    const progress = JSON.parse(localStorage.getItem('progress')) || { weight: 180, bodyFat: 18, muscleMass: 140 };
    const el = document.getElementById('ai-suggestion');
    if (!el) return;
    if (progress.bodyFat > 20)
        el.textContent = 'Based on your body fat %, try adding more HIIT Cardio sessions to accelerate fat burn!';
    else if (progress.muscleMass < 145)
        el.textContent = 'Your muscle mass goal is within reach — focus on Strength Training and increase protein intake!';
    else
        el.textContent = 'Great balance! Keep up with Full Body Blast and maintain your current nutrition plan.';
}

function loadEquipmentBooking() {
    const container = document.getElementById('equipment-booking');
    if (!container) return;
    const equipment = [
        { name: 'Treadmill', available: 3, icon: 'activity' },
        { name: 'Bench Press', available: 2, icon: 'arrow-up' },
        { name: 'Dumbbells Set', available: 5, icon: 'target' }
    ];
    container.innerHTML = equipment.map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:0.75rem">
                <div class="icon-circle" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15)">
                    <i data-feather="${item.icon}" style="width:16px;height:16px;color:var(--accent)"></i>
                </div>
                <div>
                    <p style="font-size:0.875rem;font-weight:600;margin:0">${item.name}</p>
                    <p style="font-size:0.75rem;color:${item.available > 0 ? 'var(--success)' : 'var(--danger)'};margin:0">${item.available > 0 ? `${item.available} available` : 'Fully booked'}</p>
                </div>
            </div>
            <button class="btn-primary" style="border-radius:999px;font-size:0.8rem;padding:0.45rem 1rem;${item.available === 0 ? 'opacity:0.45;cursor:not-allowed' : ''}"
                onclick="${item.available > 0 ? `bookEquipment('${item.name}')` : `showToast('${item.name} is fully booked!','error')`}">
                Book
            </button>
        </div>
    `).join('');
    feather.replace();
}

function bookEquipment(name) {
    addNotification(`${name} reserved for your next session.`, 'booking');
    showToast(`"${name}" reserved for your next session!`, 'success');
}

// ---- Nutrition ----
function showMealForm() {
    const form = document.getElementById('meal-form');
    if (form) form.classList.remove('hidden');
}

function hideMealForm() {
    const form = document.getElementById('meal-form');
    if (form) form.classList.add('hidden');
}

function logMeal(event) {
    event.preventDefault();
    const name = document.getElementById('meal-name').value;
    const calories = parseInt(document.getElementById('meal-calories').value);
    let nutrition = JSON.parse(localStorage.getItem('nutrition')) || { calories: 0, water: 0 };
    nutrition.calories += calories;
    localStorage.setItem('nutrition', JSON.stringify(nutrition));
    updateNutritionDisplay();
    hideMealForm();
    addNotification(`Meal logged: ${name} (${calories} kcal).`, 'success');
    showToast(`"${name}" logged — ${calories} kcal added!`, 'success');
}

function addWater() {
    let nutrition = JSON.parse(localStorage.getItem('nutrition')) || { calories: 0, water: 0 };
    nutrition.water = Math.round((nutrition.water + 0.5) * 10) / 10;
    localStorage.setItem('nutrition', JSON.stringify(nutrition));
    updateNutritionDisplay();
    showToast('0.5L water logged. Stay hydrated!', 'info');
}

function loadNutritionData() { updateNutritionDisplay(); }

function updateNutritionDisplay(nutrition) {
    nutrition = nutrition || JSON.parse(localStorage.getItem('nutrition')) || { calories: 0, water: 0 };
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setStyle = (id, prop, val) => { const el = document.getElementById(id); if (el) el.style[prop] = val; };
    setEl('calories-display', `${nutrition.calories.toLocaleString()} / 3,000 kcal`);
    setStyle('calories-bar', 'width', `${Math.min((nutrition.calories / 3000) * 100, 100)}%`);
    setEl('water-display', `${nutrition.water}L / 3L`);
    setStyle('water-bar', 'width', `${Math.min((nutrition.water / 3) * 100, 100)}%`);
}

function generateNutritionPlan() {
    const progress = JSON.parse(localStorage.getItem('progress')) || { weight: 180, bodyFat: 18, muscleMass: 140 };
    const prof = JSON.parse(localStorage.getItem('userProfile')) || {};
    const container = document.getElementById('nutrition-plan');
    if (!container) return;
    let goal = prof.goal || (progress.bodyFat > 20 ? 'fat-loss' : progress.muscleMass < 145 ? 'muscle-gain' : 'maintenance');
    const plans = {
        'fat-loss':    [{ meal: 'Breakfast', food: 'Oatmeal with Berries & Chia Seeds', cal: 320 }, { meal: 'Lunch', food: 'Grilled Chicken Salad with Avocado', cal: 420 }, { meal: 'Dinner', food: 'Steamed Salmon with Veggies', cal: 380 }, { meal: 'Snack', food: 'Apple + Almond Butter', cal: 180 }],
        'muscle-gain': [{ meal: 'Breakfast', food: 'Protein Pancakes with Banana', cal: 520 }, { meal: 'Lunch', food: 'Beef & Brown Rice Bowl', cal: 650 }, { meal: 'Dinner', food: 'Salmon with Quinoa & Spinach', cal: 580 }, { meal: 'Snack', food: 'Greek Yogurt + Granola', cal: 280 }],
        'maintenance': [{ meal: 'Breakfast', food: 'Greek Yogurt with Mixed Fruit', cal: 360 }, { meal: 'Lunch', food: 'Turkey & Avocado Wrap', cal: 470 }, { meal: 'Dinner', food: 'Chicken Stir-Fry with Brown Rice', cal: 440 }, { meal: 'Snack', food: 'Nuts & Dark Chocolate', cal: 210 }],
        'endurance':   [{ meal: 'Breakfast', food: 'Banana Oat Smoothie + Eggs', cal: 450 }, { meal: 'Lunch', food: 'Pasta with Lean Turkey Bolognese', cal: 580 }, { meal: 'Dinner', food: 'Grilled Chicken with Sweet Potato', cal: 520 }, { meal: 'Snack', food: 'Energy Bars + Electrolyte Drink', cal: 240 }]
    };
    const goalLabels = { 'fat-loss': 'Fat Loss', 'muscle-gain': 'Muscle Gain', 'maintenance': 'Maintenance', 'endurance': 'Endurance' };
    container.innerHTML = `
        <div style="margin-bottom:0.75rem">
            <span class="badge badge-accent">Goal: ${goalLabels[goal] || 'Balanced'}</span>
        </div>
        ${(plans[goal] || plans['maintenance']).map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border)">
                <div>
                    <p style="font-size:0.75rem;color:var(--text-secondary);margin:0;text-transform:uppercase;letter-spacing:0.05em">${item.meal}</p>
                    <p style="font-size:0.875rem;font-weight:500;margin:0">${item.food}</p>
                </div>
                <span class="badge badge-accent">${item.cal} kcal</span>
            </div>
        `).join('')}
    `;
}

// ---- Progress Tracker ----
function showProgressForm() {
    const form = document.getElementById('progress-form');
    if (form) form.classList.remove('hidden');
}

function hideProgressForm() {
    const form = document.getElementById('progress-form');
    if (form) form.classList.add('hidden');
}

function updateProgress(event) {
    if (event) event.preventDefault();
    const weight = parseFloat(document.getElementById('progress-weight')?.value || 0);
    const bodyFat = parseFloat(document.getElementById('progress-body-fat')?.value || 0);
    const muscleMass = parseFloat(document.getElementById('progress-muscle-mass')?.value || 0);
    if (!weight || !bodyFat || !muscleMass) { showToast('Please fill in all fields.', 'error'); return; }

    let progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180, bodyFat: 18, muscleMass: 140, steps: 0, heartRate: 0,
        history: [{ weight: 180, bodyFat: 18, muscleMass: 140, date: new Date().toLocaleDateString() }]
    };
    progress.history.push({ weight, bodyFat, muscleMass, date: new Date().toLocaleDateString() });
    progress.weight = weight;
    progress.bodyFat = bodyFat;
    progress.muscleMass = muscleMass;
    localStorage.setItem('progress', JSON.stringify(progress));

    // Update stat cards
    const wEl = document.getElementById('stat-weight');
    const fEl = document.getElementById('stat-fat');
    const mEl = document.getElementById('stat-muscle');
    if (wEl) wEl.textContent = weight;
    if (fEl) fEl.textContent = bodyFat;
    if (mEl) mEl.textContent = muscleMass;

    initProgressChart();
    hideProgressForm();
    addNotification('Progress stats updated!', 'success');
    showToast('Progress updated successfully!', 'success');
    updateAISuggestion();
    generateNutritionPlan();
    loadGoalProgress();
}

let progressChartInstance = null;

function loadProgressData() {
    initProgressChart();
    syncWearable(true);
}

function initProgressChart() {
    const progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180, bodyFat: 18, muscleMass: 140, steps: 0, heartRate: 0,
        history: [{ weight: 180, bodyFat: 18, muscleMass: 140, date: new Date().toLocaleDateString() }]
    };
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;

    if (progressChartInstance) { progressChartInstance.destroy(); progressChartInstance = null; }

    progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: progress.history.map(e => e.date),
            datasets: [
                { label: 'Weight (lbs)', data: progress.history.map(e => e.weight), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', fill: true, tension: 0.4 },
                { label: 'Body Fat (%)', data: progress.history.map(e => e.bodyFat), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4 },
                { label: 'Muscle (lbs)', data: progress.history.map(e => e.muscleMass), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Poppins', size: 12 } } } },
            scales: {
                x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { beginAtZero: false, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
            }
        }
    });

    const stepsEl = document.getElementById('wearable-steps');
    const hrEl    = document.getElementById('wearable-hr');
    if (stepsEl) stepsEl.textContent = progress.steps.toLocaleString();
    if (hrEl)    hrEl.textContent    = `${progress.heartRate || 72} bpm`;
}

function syncWearable(auto = false) {
    let progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180, bodyFat: 18, muscleMass: 140, steps: 0, heartRate: 0,
        history: [{ weight: 180, bodyFat: 18, muscleMass: 140, date: new Date().toLocaleDateString() }]
    };
    if (!auto) {
        progress.steps     += Math.floor(Math.random() * 1000) + 500;
        progress.heartRate  = Math.floor(Math.random() * 40) + 60;
        localStorage.setItem('progress', JSON.stringify(progress));
        addNotification(`Wearable synced — ${progress.steps.toLocaleString()} steps today.`, 'info');
        showToast('Wearable device synced!', 'success');
    }
    initProgressChart();
}

// ---- BMI Calculator ----
function calculateBMI() {
    const weight = parseFloat(document.getElementById('bmi-weight')?.value);
    const height = parseFloat(document.getElementById('bmi-height')?.value);
    if (!weight || !height || height <= 0) { showToast('Please enter valid weight and height.', 'error'); return; }

    const bmi = (weight / (height * height)) * 703; // lbs + inches formula
    const result = document.getElementById('bmi-result');
    if (!result) return;

    let category, color, advice;
    if (bmi < 18.5)       { category = 'Underweight'; color = '#3b82f6'; advice = 'Focus on muscle-gain nutrition and strength training.'; }
    else if (bmi < 25)    { category = 'Normal Weight'; color = 'var(--success)'; advice = 'Great! Maintain your current lifestyle and training routine.'; }
    else if (bmi < 30)    { category = 'Overweight'; color = 'var(--accent)'; advice = 'Try adding HIIT Cardio sessions and adjusting your diet.'; }
    else                  { category = 'Obese'; color = 'var(--danger)'; advice = 'Consult a professional. Start with low-impact cardio and diet changes.'; }

    result.innerHTML = `
        <div style="text-align:center;padding:1.25rem;background:rgba(0,0,0,0.1);border-radius:10px;border:1px solid var(--border)">
            <p style="font-size:2.5rem;font-weight:800;color:${color};margin:0;line-height:1">${bmi.toFixed(1)}</p>
            <p style="font-size:0.875rem;font-weight:700;color:${color};margin:0.3rem 0 0.125rem">${category}</p>
            <p style="font-size:0.72rem;color:var(--text-secondary);margin:0 0 0.875rem">Body Mass Index</p>
            <p style="font-size:0.78rem;color:var(--text-secondary);margin:0;line-height:1.5">${advice}</p>
        </div>
    `;
}

// ---- Fitness Goal ----
function saveGoal(event) {
    event.preventDefault();
    const goal = {
        targetWeight:  parseFloat(document.getElementById('goal-weight')?.value),
        targetBodyFat: parseFloat(document.getElementById('goal-body-fat')?.value)
    };
    if (!goal.targetWeight || !goal.targetBodyFat) { showToast('Please fill in both goal fields.', 'error'); return; }
    localStorage.setItem('fitnessGoal', JSON.stringify(goal));
    loadGoalProgress();
    addNotification(`New goal set: ${goal.targetWeight} lbs / ${goal.targetBodyFat}% body fat.`, 'success');
    showToast('Fitness goal saved!', 'success');
}

function loadGoalProgress() {
    const container = document.getElementById('goal-progress');
    if (!container) return;
    const goal = JSON.parse(localStorage.getItem('fitnessGoal'));
    const progress = JSON.parse(localStorage.getItem('progress')) || { weight: 180, bodyFat: 18 };
    const startWeight  = 180;
    const startBodyFat = 18;

    if (!goal) {
        container.innerHTML = '<p style="color:var(--text-secondary);font-size:0.82rem">Set a goal below to track your progress.</p>';
        return;
    }

    const weightPct = goal.targetWeight >= startWeight ? 0
        : Math.min(Math.max(((startWeight - progress.weight) / (startWeight - goal.targetWeight)) * 100, 0), 100);
    const fatPct = goal.targetBodyFat >= startBodyFat ? 0
        : Math.min(Math.max(((startBodyFat - progress.bodyFat) / (startBodyFat - goal.targetBodyFat)) * 100, 0), 100);

    container.innerHTML = `
        <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;margin-bottom:0.4rem">
                <span style="color:var(--text-secondary)">Weight: ${progress.weight} → ${goal.targetWeight} lbs</span>
                <span style="font-weight:700;color:var(--accent)">${Math.round(weightPct)}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${weightPct}%"></div></div>
        </div>
        <div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;margin-bottom:0.4rem">
                <span style="color:var(--text-secondary)">Body Fat: ${progress.bodyFat}% → ${goal.targetBodyFat}%</span>
                <span style="font-weight:700;color:var(--success)">${Math.round(fatPct)}%</span>
            </div>
            <div style="background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;height:8px">
                <div style="height:8px;border-radius:999px;background:linear-gradient(90deg,#16a34a,var(--success));width:${fatPct}%;transition:width 0.6s ease"></div>
            </div>
        </div>
    `;
}

// ---- Classes ----
function loadClassSchedule() {
    const container = document.getElementById('class-schedule');
    if (!container) return;
    const schedule = [
        { name: 'Strength Training', time: 'Today 6:00 PM', spots: 5, color: '#f59e0b' },
        { name: 'Yoga Flow',         time: 'Tomorrow 8:00 AM', spots: 10, color: '#22c55e' },
        { name: 'HIIT Cardio',       time: 'Tomorrow 7:00 PM', spots: 3, color: '#3b82f6' }
    ];
    container.innerHTML = schedule.map(cls => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.875rem 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:0.75rem">
                <div style="width:4px;height:36px;border-radius:2px;background:${cls.color};flex-shrink:0"></div>
                <div>
                    <p style="font-size:0.875rem;font-weight:600;margin:0">${cls.name}</p>
                    <p style="font-size:0.75rem;color:var(--text-secondary);margin:0">${cls.time}</p>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem">
                <span class="badge ${cls.spots <= 3 ? 'badge-danger' : 'badge-success'}">${cls.spots} spots</span>
                <button class="btn-primary" style="border-radius:999px;font-size:0.8rem;padding:0.45rem 1rem;${cls.spots === 0 ? 'opacity:0.45;cursor:not-allowed' : ''}"
                    onclick="${cls.spots > 0 ? `bookClass('${cls.name}')` : `showToast('Class is full!','error')`}">
                    Book
                </button>
            </div>
        </div>
    `).join('');
}

function loadTrainerSchedule() {
    const container = document.getElementById('trainer-schedule');
    if (!container) return;
    const trainers = [
        { name: 'John Smith',    specialty: 'Strength & Conditioning', time: 'Today 5:00 PM',    available: true },
        { name: 'Sarah Johnson', specialty: 'Yoga & Pilates',          time: 'Tomorrow 10:00 AM', available: true },
        { name: 'Mike Torres',   specialty: 'HIIT & Cardio',           time: 'Tomorrow 7:00 PM',  available: true }
    ];
    container.innerHTML = trainers.map(t => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.875rem 0;border-bottom:1px solid var(--border)">
            <div>
                <p style="font-size:0.875rem;font-weight:600;margin:0">${t.name}</p>
                <p style="font-size:0.75rem;color:var(--accent);margin:0">${t.specialty}</p>
                <p style="font-size:0.75rem;color:var(--text-secondary);margin:0">${t.time}</p>
            </div>
            <button class="btn-primary" style="border-radius:999px;font-size:0.8rem;padding:0.45rem 1rem"
                onclick="bookTrainer('${t.name}','${t.time}')">
                View &amp; Book
            </button>
        </div>
    `).join('');
}

function loadClassLeaderboard() {
    const container = document.getElementById('class-leaderboard');
    if (!container) return;
    const leaderboard = JSON.parse(localStorage.getItem('classLeaderboard')) || { 'John Doe': 8, 'Alex Kim': 15, 'Maria Santos': 12 };
    const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);
    const medals = ['🥇', '🥈', '🥉'];
    container.innerHTML = sorted.map(([user, count], i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.625rem 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:0.625rem">
                <span style="font-size:1rem;width:24px;text-align:center">${medals[i] || (i + 1)}</span>
                <p style="font-size:0.875rem;font-weight:${user === 'John Doe' ? '700' : '500'};margin:0;color:${user === 'John Doe' ? 'var(--accent)' : 'inherit'}">${user}</p>
            </div>
            <span class="badge badge-accent">${count} classes</span>
        </div>
    `).join('') || '<p style="color:var(--text-secondary);font-size:0.875rem">No leaderboard data yet.</p>';
}

// ---- Community ----
function sharePost(event) {
    event.preventDefault();
    const content = document.getElementById('post-content')?.value?.trim();
    if (!content) { showToast('Please write something first!', 'error'); return; }
    let posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
    posts.unshift({
        id: Date.now(),
        user: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        content,
        likes: 0,
        likedBy: [],
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    document.getElementById('post-content').value = '';
    loadCommunityPosts();
    addNotification('Your post was shared with the community!', 'success');
    showToast('Post shared with the community!', 'success');
}

function loadCommunityPosts() {
    const container = document.getElementById('community-posts');
    if (!container) return;
    const posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
    if (!posts.length) {
        container.innerHTML = '<p style="color:var(--text-secondary);font-size:0.875rem;padding:1rem 0">No posts yet. Be the first to share your fitness journey!</p>';
        return;
    }
    container.innerHTML = posts.map(post => {
        const liked = post.likedBy && post.likedBy.includes('John Doe');
        const safeContent = post.content.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
        <div style="display:flex;gap:0.875rem;padding:1rem 0;border-bottom:1px solid var(--border)">
            <img src="${post.avatar}" alt="${post.user}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(245,158,11,0.2);flex-shrink:0">
            <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.25rem">
                    <p style="font-size:0.875rem;font-weight:600;margin:0">${post.user}</p>
                    <span style="font-size:0.72rem;color:var(--text-secondary);white-space:nowrap">${post.timestamp}</span>
                </div>
                <p style="font-size:0.875rem;color:var(--text-secondary);margin:0 0 0.625rem;line-height:1.55">${post.content}</p>
                <div style="display:flex;gap:0.4rem;align-items:center">
                    <button class="like-btn ${liked ? 'liked' : ''}" onclick="likePost(${post.id})">
                        <i data-feather="heart" style="width:13px;height:13px"></i> ${post.likes || 0}
                    </button>
                    <button class="share-btn" onclick="sharePostSocial('${safeContent}','twitter')" title="Share on Twitter">
                        <i data-feather="twitter" style="width:13px;height:13px"></i>
                    </button>
                    <button class="share-btn" onclick="sharePostSocial('${safeContent}','facebook')" title="Share on Facebook">
                        <i data-feather="facebook" style="width:13px;height:13px"></i>
                    </button>
                    ${post.user === 'John Doe' ? `<button class="delete-btn" onclick="deletePost(${post.id})" title="Delete post"><i data-feather="trash-2" style="width:13px;height:13px"></i></button>` : ''}
                </div>
            </div>
        </div>
    `}).join('');
    feather.replace();
}

function likePost(id) {
    let posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
    const post = posts.find(p => p.id === id);
    if (!post) return;
    if (!post.likedBy) post.likedBy = [];
    const userId = 'John Doe';
    if (post.likedBy.includes(userId)) {
        post.likedBy = post.likedBy.filter(u => u !== userId);
        post.likes = Math.max((post.likes || 1) - 1, 0);
    } else {
        post.likedBy.push(userId);
        post.likes = (post.likes || 0) + 1;
    }
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    loadCommunityPosts();
}

function deletePost(id) {
    let posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    loadCommunityPosts();
    showToast('Post deleted.', 'info');
}

function sharePostSocial(content, platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(content);
    const urls = {
        twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
}

// ---- Pricing ----
function selectPlan(plan) {
    localStorage.setItem('selectedPlan', plan);
    addNotification(`You switched to the ${plan} membership plan.`, 'success');
    showToast(`${plan} plan selected! Redirecting to dashboard...`, 'success');
    loadMembershipStatus();
    setTimeout(() => { window.location.href = 'index.html'; }, 1800);
}

// ---- Contact ----
function sendContactMessage(event) {
    event.preventDefault();
    const name    = document.getElementById('contact-name')?.value?.trim();
    const email   = document.getElementById('contact-email')?.value?.trim();
    const message = document.getElementById('contact-message')?.value?.trim();
    if (!name || !email || !message) { showToast('Please fill in all required fields.', 'error'); return; }

    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.push({ name, email, message, timestamp: new Date().toLocaleString() });
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    // Reset form
    const form = event.target;
    if (form) form.reset();

    addNotification(`Message sent! We'll reply to ${email} within 24 hours.`, 'success');
    showToast(`Thanks ${name}! We'll get back to you within 24 hours.`, 'success');
}

// ---- Smooth Scroll ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
