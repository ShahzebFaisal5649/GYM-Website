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
    // Apply saved theme to body
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
        let response = "I'm here to help! Ask about workouts, nutrition, classes, or equipment.";
        if (lower.includes('workout')) response = 'Try the Full Body Blast in the Workout Plan section for a great full-body session!';
        else if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('food')) response = 'Check the Nutrition page for your personalized meal plan and macro tracking!';
        else if (lower.includes('class') || lower.includes('yoga') || lower.includes('hiit')) response = 'Head to the Classes page to book Strength Training, Yoga Flow, or HIIT Cardio!';
        else if (lower.includes('equipment')) response = 'Reserve gym equipment on the Workout Plan page before your session!';
        else if (lower.includes('trainer')) response = 'Visit the Trainers page to book a one-on-one session with our certified trainers!';
        else if (lower.includes('price') || lower.includes('membership')) response = 'Check the Pricing page for our Basic ($29), Premium ($59), and Elite ($99) plans!';
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
    if (event.accelerationIncludingGravity && event.accelerationIncludingGravity.z > 10) {
        addRep();
    }
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
        const msgs = { High: 'High Intensity — Outstanding! You crushed it!', Moderate: 'Moderate Intensity — Solid work! Push harder next time.', Low: 'Low Intensity — Good start! Increase reps or pace.' };
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
    if (progress.bodyFat > 20) {
        el.textContent = 'Based on your body fat %, try adding more HIIT Cardio sessions to accelerate fat burn!';
    } else if (progress.muscleMass < 145) {
        el.textContent = 'Your muscle mass goal is within reach — focus on Strength Training and increase protein intake!';
    } else {
        el.textContent = 'Great balance! Keep up with Full Body Blast and maintain your current nutrition plan.';
    }
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
    showToast(`"${name}" logged — ${calories} kcal added!`, 'success');
}

function addWater() {
    let nutrition = JSON.parse(localStorage.getItem('nutrition')) || { calories: 0, water: 0 };
    nutrition.water = Math.round((nutrition.water + 0.5) * 10) / 10;
    localStorage.setItem('nutrition', JSON.stringify(nutrition));
    updateNutritionDisplay();
    showToast('0.5L water logged. Stay hydrated!', 'info');
}

function loadNutritionData() {
    updateNutritionDisplay();
}

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
    const container = document.getElementById('nutrition-plan');
    if (!container) return;
    let goal = progress.bodyFat > 20 ? 'fat-loss' : progress.muscleMass < 145 ? 'muscle-gain' : 'maintenance';
    const plans = {
        'fat-loss':    [{ meal: 'Breakfast', food: 'Oatmeal with Berries & Chia Seeds', cal: 320 }, { meal: 'Lunch', food: 'Grilled Chicken Salad with Avocado', cal: 420 }, { meal: 'Dinner', food: 'Steamed Salmon with Veggies', cal: 380 }],
        'muscle-gain': [{ meal: 'Breakfast', food: 'Protein Pancakes with Banana', cal: 520 }, { meal: 'Lunch', food: 'Beef & Brown Rice Bowl', cal: 650 }, { meal: 'Dinner', food: 'Salmon with Quinoa & Spinach', cal: 580 }],
        'maintenance': [{ meal: 'Breakfast', food: 'Greek Yogurt with Mixed Fruit', cal: 360 }, { meal: 'Lunch', food: 'Turkey & Avocado Wrap', cal: 470 }, { meal: 'Dinner', food: 'Chicken Stir-Fry with Brown Rice', cal: 440 }]
    };
    const goalLabels = { 'fat-loss': 'Fat Loss', 'muscle-gain': 'Muscle Gain', 'maintenance': 'Maintenance' };
    container.innerHTML = `
        <div style="margin-bottom:0.75rem">
            <span class="badge badge-accent">Goal: ${goalLabels[goal]}</span>
        </div>
        ${plans[goal].map(item => `
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

    initProgressChart();
    hideProgressForm();
    showToast('Progress updated successfully!', 'success');
    updateAISuggestion();
    generateNutritionPlan();
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

    if (progressChartInstance) {
        progressChartInstance.destroy();
        progressChartInstance = null;
    }

    progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: progress.history.map(e => e.date),
            datasets: [
                { label: 'Weight (lbs)', data: progress.history.map(e => e.weight), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', fill: true, tension: 0.4 },
                { label: 'Body Fat (%)', data: progress.history.map(e => e.bodyFat), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4 },
                { label: 'Muscle Mass (lbs)', data: progress.history.map(e => e.muscleMass), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Poppins', size: 12 } } } },
            scales: {
                x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { beginAtZero: false, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
            }
        }
    });

    const stepsEl = document.getElementById('wearable-steps');
    const hrEl = document.getElementById('wearable-hr');
    if (stepsEl) stepsEl.textContent = progress.steps.toLocaleString();
    if (hrEl) hrEl.textContent = `${progress.heartRate || 72} bpm`;
}

function syncWearable(auto = false) {
    let progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180, bodyFat: 18, muscleMass: 140, steps: 0, heartRate: 0,
        history: [{ weight: 180, bodyFat: 18, muscleMass: 140, date: new Date().toLocaleDateString() }]
    };
    if (!auto) {
        progress.steps += Math.floor(Math.random() * 1000) + 500;
        progress.heartRate = Math.floor(Math.random() * 40) + 60;
        localStorage.setItem('progress', JSON.stringify(progress));
        showToast('Wearable device synced!', 'success');
    }
    initProgressChart();
}

// ---- Classes ----
function bookClass(className) {
    let stats = JSON.parse(localStorage.getItem('dashboardStats')) || { workouts: 24, calories: 3500, classes: 8, records: 5 };
    stats.classes += 1;
    stats.workouts += 1;
    stats.calories += 300;
    localStorage.setItem('dashboardStats', JSON.stringify(stats));

    let leaderboard = JSON.parse(localStorage.getItem('classLeaderboard')) || { 'John Doe': 8 };
    leaderboard['John Doe'] = (leaderboard['John Doe'] || 0) + 1;
    localStorage.setItem('classLeaderboard', JSON.stringify(leaderboard));

    showToast(`"${className}" class booked! See you there.`, 'success');
    loadDashboardStats();
    loadAchievements();
    loadClassLeaderboard();
}

function loadClassSchedule() {
    const container = document.getElementById('class-schedule');
    if (!container) return;
    const schedule = [
        { name: 'Strength Training', time: 'Today 6:00 PM', spots: 5, color: '#f59e0b' },
        { name: 'Yoga Flow', time: 'Tomorrow 8:00 AM', spots: 10, color: '#22c55e' },
        { name: 'HIIT Cardio', time: 'Tomorrow 7:00 PM', spots: 3, color: '#3b82f6' }
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
        { name: 'John Smith', specialty: 'Strength & Conditioning', time: 'Today 5:00 PM', available: true },
        { name: 'Sarah Johnson', specialty: 'Yoga & Pilates', time: 'Tomorrow 10:00 AM', available: true }
    ];
    container.innerHTML = trainers.map(t => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.875rem 0;border-bottom:1px solid var(--border)">
            <div>
                <p style="font-size:0.875rem;font-weight:600;margin:0">${t.name}</p>
                <p style="font-size:0.75rem;color:var(--accent);margin:0">${t.specialty}</p>
                <p style="font-size:0.75rem;color:var(--text-secondary);margin:0">${t.time}</p>
            </div>
            <button class="btn-primary" style="border-radius:999px;font-size:0.8rem;padding:0.45rem 1rem;${!t.available ? 'opacity:0.45;cursor:not-allowed' : ''}"
                onclick="${t.available ? `bookTrainer('${t.name}','${t.time}')` : `showToast('Slot taken!','error')`}">
                ${t.available ? 'Book' : 'Taken'}
            </button>
        </div>
    `).join('');
}

function bookTrainer(name, time) {
    showToast(`Session booked with ${name} at ${time}!`, 'success');
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
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    document.getElementById('post-content').value = '';
    loadCommunityPosts();
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
    container.innerHTML = posts.map(post => `
        <div style="display:flex;gap:0.875rem;padding:1rem 0;border-bottom:1px solid var(--border)">
            <img src="${post.avatar}" alt="${post.user}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(245,158,11,0.2);flex-shrink:0">
            <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
                    <p style="font-size:0.875rem;font-weight:600;margin:0">${post.user}</p>
                    <span style="font-size:0.72rem;color:var(--text-secondary);white-space:nowrap">${post.timestamp}</span>
                </div>
                <p style="font-size:0.875rem;color:var(--text-secondary);margin:0.25rem 0 0.625rem">${post.content}</p>
                <div style="display:flex;gap:0.5rem">
                    <button class="share-btn" onclick="sharePostSocial('${post.content.replace(/'/g,"\\'")}','twitter')" title="Share on Twitter">
                        <i data-feather="twitter" style="width:14px;height:14px"></i>
                    </button>
                    <button class="share-btn" onclick="sharePostSocial('${post.content.replace(/'/g,"\\'")}','facebook')" title="Share on Facebook">
                        <i data-feather="facebook" style="width:14px;height:14px"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    feather.replace();
}

function sharePostSocial(content, platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(content);
    const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
}

// ---- Trainers ----
function showTrainerProfile(name) {
    const profiles = {
        'John Smith': { specialty: 'Strength & Conditioning', exp: '8 years', cert: 'NASM-CPT, CSCS', email: 'john.smith@flexgym.com' },
        'Sarah Johnson': { specialty: 'Yoga & Pilates', exp: '6 years', cert: 'RYT-500, PMA-CPT', email: 'sarah.j@flexgym.com' }
    };
    const p = profiles[name] || {};
    showToast(`${name} — ${p.specialty || 'Trainer'} (${p.exp || '5+ years'})`, 'info');
}

// ---- Pricing ----
function selectPlan(plan) {
    localStorage.setItem('selectedPlan', plan);
    showToast(`${plan} plan selected! Redirecting to dashboard...`, 'success');
    loadMembershipStatus();
    setTimeout(() => { window.location.href = 'index.html'; }, 1800);
}

// ---- Contact ----
function sendContactMessage(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name')?.value;
    const email = document.getElementById('contact-email')?.value;
    const message = document.getElementById('contact-message')?.value;
    if (!name || !email || !message) { showToast('Please fill in all fields.', 'error'); return; }

    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.push({ name, email, message, timestamp: new Date().toLocaleString() });
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-message').value = '';
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
