// Initialize Feather Icons and Load Data
document.addEventListener('DOMContentLoaded', function() {
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

    // Ensure forms are hidden on page load
    if (document.getElementById('meal-form')) hideMealForm();
    if (document.getElementById('progress-form')) hideProgressForm();

    // Theme Toggle
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }

    // Initialize Progress Chart
    initProgressChart();

    // Chatbot
    if (document.getElementById('chatbot')) {
        addChatbotMessage('Hi! I’m your virtual trainer. How can I assist you today?', true);
    }

    // Real-Time Workout Tracking
    if ('DeviceMotionEvent' in window && document.getElementById('rep-count')) {
        window.addEventListener('devicemotion', handleMotion);
    }
});

// Theme Functions
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        const icon = toggleButton.querySelector('i');
        icon.setAttribute('data-feather', document.body.classList.contains('light-mode') ? 'sun' : 'moon');
        feather.replace();
    }
}

// Chatbot Functions
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    if (chatbot) chatbot.classList.toggle('hidden');
}

function addChatbotMessage(message, isBot = false) {
    const messages = document.getElementById('chatbot-messages');
    if (messages) {
        messages.innerHTML += `
            <div class="${isBot ? 'text-gray-400' : 'text-accent'} p-2 rounded ${isBot ? 'bg-gray-700' : 'bg-gray-600'}">
                ${isBot ? 'Trainer: ' : 'You: '}${message}
            </div>
        `;
        messages.scrollTop = messages.scrollHeight;
    }
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbot-input');
    if (!input || !input.value.trim()) return;
    const message = input.value.trim();
    addChatbotMessage(message);
    input.value = '';

    setTimeout(() => {
        if (message.toLowerCase().includes('workout')) {
            addChatbotMessage('Try the Full Body Blast in the Workout Plan section!', true);
        } else if (message.toLowerCase().includes('nutrition')) {
            addChatbotMessage('Check out the Nutrition page for a personalized plan!', true);
        } else if (message.toLowerCase().includes('class')) {
            addChatbotMessage('Head to the Classes page to book a live session or trainer!', true);
        } else if (message.toLowerCase().includes('equipment')) {
            addChatbotMessage('Reserve gym equipment on the Workout Plan page!', true);
        } else {
            addChatbotMessage('I’m here to help! Ask about workouts, nutrition, classes, or equipment.', true);
        }
    }, 500);
}

// Dashboard Functions
function loadDashboardStats() {
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        workouts: 24,
        calories: 3500,
        classes: 8,
        records: 5
    };
    if (document.getElementById('workouts-count')) {
        document.getElementById('workouts-count').textContent = stats.workouts;
        document.getElementById('calories-count').textContent = stats.calories.toLocaleString();
        document.getElementById('classes-count').textContent = stats.classes;
        document.getElementById('records-count').textContent = stats.records;
    }
}

function loadMembershipStatus() {
    const plan = localStorage.getItem('selectedPlan') || 'Basic';
    if (document.getElementById('membership-status')) {
        document.getElementById('membership-status').textContent = plan;
    }
}

function loadAchievements() {
    const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        workouts: 24,
        calories: 3500,
        classes: 8,
        records: 5
    };
    const achievements = [
        { name: 'Workout Warrior', condition: stats.workouts >= 50, icon: 'award' },
        { name: 'Calorie Crusher', condition: stats.calories >= 10000, icon: 'zap' },
        { name: 'Class Champion', condition: stats.classes >= 20, icon: 'users' }
    ];
    const container = document.getElementById('achievements');
    if (container) {
        container.innerHTML = achievements.map(ach => `
            <div class="flex items-center p-4 rounded-lg ${ach.condition ? 'bg-green-500' : 'bg-gray-700'}">
                <i data-feather="${ach.icon}" class="mr-2 text-accent"></i>
                <span>${ach.name} ${ach.condition ? '✓' : '✗'}</span>
            </div>
        `).join('');
        feather.replace();
    }
}

// Workout Plan Functions
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
        calorieBurn += 0.14; // Rough estimate: 500 cal/hour
        updateTrackerDisplay();
        updateIntensityFeedback();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Workout time is up!');
            updateIntensityFeedback(true);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        updateTimerDisplay(0);
        timerInterval = null;
        startTime = null;
        updateIntensityFeedback(true);
    }
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = document.getElementById('timer-display');
    if (display) {
        display.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

function addRep() {
    repCount += 1;
    calorieBurn += 5; // Approx 5 cal per rep
    updateTrackerDisplay();
    updateIntensityFeedback();
}

function resetTracker() {
    repCount = 0;
    calorieBurn = 0;
    startTime = null;
    updateTrackerDisplay();
    updateIntensityFeedback();
}

function updateTrackerDisplay() {
    const repDisplay = document.getElementById('rep-count');
    const calorieDisplay = document.getElementById('calorie-burn');
    if (repDisplay && calorieDisplay) {
        repDisplay.textContent = repCount;
        calorieDisplay.textContent = Math.round(calorieBurn);
    }
}

function handleMotion(event) {
    if (event.accelerationIncludingGravity.z > 10) {
        addRep();
    }
}

function updateIntensityFeedback(isComplete = false) {
    const feedback = document.getElementById('intensity-feedback');
    if (!feedback) return;
    if (!startTime && !isComplete) {
        feedback.textContent = 'Start your workout to analyze intensity.';
        return;
    }
    const elapsed = (Date.now() - startTime) / 1000 / 60; // Minutes
    const intensity = repCount / (elapsed || 1); // Reps per minute
    if (isComplete) {
        if (intensity > 20) {
            feedback.textContent = 'High Intensity: Outstanding effort! Reward yourself!';
        } else if (intensity > 10) {
            feedback.textContent = 'Moderate Intensity: Solid work! Push a bit harder next time.';
        } else {
            feedback.textContent = 'Low Intensity: Good start! Increase reps or pace for more burn.';
        }
    } else {
        feedback.textContent = `Current Intensity: ${intensity > 20 ? 'High' : intensity > 10 ? 'Moderate' : 'Low'} (Reps/Min: ${Math.round(intensity)})`;
    }
}

function completeWorkout() {
    let stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        workouts: 24,
        calories: 3500,
        classes: 8,
        records: 5
    };
    stats.workouts += 1;
    stats.calories += calorieBurn || 500;
    localStorage.setItem('dashboardStats', JSON.stringify(stats));

    let history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    history.unshift({
        name: 'Full Body Blast',
        timestamp: new Date().toLocaleString(),
        calories: calorieBurn || 500,
        reps: repCount
    });
    localStorage.setItem('workoutHistory', JSON.stringify(history));

    resetTracker();
    alert('Workout completed! Stats and history updated.');
    loadWorkoutHistory();
    loadDashboardStats();
    loadAchievements();
}

function loadWorkoutHistory() {
    const historyContainer = document.getElementById('workout-history');
    if (!historyContainer) return;
    const history = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    historyContainer.innerHTML = history.map(entry => `
        <div class="text-gray-400">
            <p><strong>${entry.name}</strong> - ${entry.timestamp}</p>
            <p>Calories Burned: ${entry.calories} | Reps: ${entry.reps || 0}</p>
        </div>
    `).join('') || '<p>No workout history yet.</p>';
}

function updateAISuggestion() {
    const progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180,
        bodyFat: 18,
        muscleMass: 140
    };
    const suggestion = document.getElementById('ai-suggestion');
    if (suggestion) {
        if (progress.bodyFat > 20) {
            suggestion.textContent = 'Try adding more HIIT Cardio to burn fat!';
        } else if (progress.muscleMass < 145) {
            suggestion.textContent = 'Focus on Strength Training to build muscle!';
        } else {
            suggestion.textContent = 'Great balance! Keep up with Full Body Blast!';
        }
    }
}

function loadEquipmentBooking() {
    const bookingContainer = document.getElementById('equipment-booking');
    if (!bookingContainer) return;
    const equipment = [
        { name: 'Treadmill', available: 3 },
        { name: 'Bench Press', available: 2 },
        { name: 'Dumbbells', available: 5 }
    ];
    bookingContainer.innerHTML = equipment.map(item => `
        <div class="flex justify-between items-center">
            <p>${item.name} (${item.available} available)</p>
            <button class="btn-primary px-4 py-2 rounded-full neon-glow ${item.available > 0 ? '' : 'opacity-50 cursor-not-allowed'}" 
                    onclick="${item.available > 0 ? `bookEquipment('${item.name}')` : 'alert(\'Equipment unavailable!\')'}">
                Book
            </button>
        </div>
    `).join('');
}

function bookEquipment(name) {
    alert(`Equipment "${name}" booked for your session!`);
    // In a real app, this would update availability via a server
}

// Nutrition Functions
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
    alert(`Meal "${name}" logged with ${calories} calories!`);
}

function addWater() {
    let nutrition = JSON.parse(localStorage.getItem('nutrition')) || { calories: 0, water: 0 };
    nutrition.water += 0.5;
    localStorage.setItem('nutrition', JSON.stringify(nutrition));
    updateNutritionDisplay();
    alert('0.5L of water added!');
}

function loadNutritionData() {
    const nutrition = JSON.parse(localStorage.getItem('nutrition')) || { calories: 0, water: 0 };
    updateNutritionDisplay(nutrition);
}

function updateNutritionDisplay(nutrition = JSON.parse(localStorage.getItem('nutrition')) || { calories: 0, water: 0 }) {
    const caloriesDisplay = document.getElementById('calories-display');
    const caloriesBar = document.getElementById('calories-bar');
    const waterDisplay = document.getElementById('water-display');
    const waterBar = document.getElementById('water-bar');
    if (caloriesDisplay && caloriesBar) {
        caloriesDisplay.textContent = `${nutrition.calories} / 3,000`;
        caloriesBar.style.width = `${Math.min((nutrition.calories / 3000) * 100, 100)}%`;
    }
    if (waterDisplay && waterBar) {
        waterDisplay.textContent = `${nutrition.water}L / 3L`;
        waterBar.style.width = `${Math.min((nutrition.water / 3) * 100, 100)}%`;
    }
}

function generateNutritionPlan() {
    const progress = JSON.parse(localStorage.getItem('progress')) || { weight: 180, bodyFat: 18, muscleMass: 140 };
    const planContainer = document.getElementById('nutrition-plan');
    if (!planContainer) return;

    let goal;
    if (progress.bodyFat > 20) goal = 'fat-loss';
    else if (progress.muscleMass < 145) goal = 'muscle-gain';
    else goal = 'maintenance';

    const plans = {
        'fat-loss': [
            { meal: 'Breakfast', food: 'Oatmeal with Berries', calories: 300 },
            { meal: 'Lunch', food: 'Grilled Chicken Salad', calories: 400 },
            { meal: 'Dinner', food: 'Steamed Fish with Veggies', calories: 350 }
        ],
        'muscle-gain': [
            { meal: 'Breakfast', food: 'Protein Pancakes', calories: 500 },
            { meal: 'Lunch', food: 'Beef & Rice Bowl', calories: 600 },
            { meal: 'Dinner', food: 'Salmon with Quinoa', calories: 550 }
        ],
        'maintenance': [
            { meal: 'Breakfast', food: 'Greek Yogurt with Fruit', calories: 350 },
            { meal: 'Lunch', food: 'Turkey Wrap', calories: 450 },
            { meal: 'Dinner', food: 'Chicken Stir-Fry', calories: 400 }
        ]
    };

    planContainer.innerHTML = plans[goal].map(item => `
        <div class="text-gray-400">
            <p><strong>${item.meal}:</strong> ${item.food}</p>
            <p>Calories: ${item.calories}</p>
        </div>
    `).join('');
}

// Progress Tracker Functions
function showProgressForm() {
    const form = document.getElementById('progress-form');
    if (form) form.classList.remove('hidden');
}

function hideProgressForm() {
    const form = document.getElementById('progress-form');
    if (form) form.classList.add('hidden');
}

function updateProgress(event) {
    event.preventDefault();
    const weight = parseFloat(document.getElementById('progress-weight').value);
    const bodyFat = parseFloat(document.getElementById('progress-body-fat').value);
    const muscleMass = parseFloat(document.getElementById('progress-muscle-mass').value);

    let progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180,
        bodyFat: 18,
        muscleMass: 140,
        steps: 0,
        heartRate: 0,
        history: [{ weight: 180, bodyFat: 18, muscleMass: 140, date: new Date().toLocaleDateString() }]
    };

    progress.history.push({ weight, bodyFat, muscleMass, date: new Date().toLocaleDateString() });
    progress.weight = weight;
    progress.bodyFat = bodyFat;
    progress.muscleMass = muscleMass;

    localStorage.setItem('progress', JSON.stringify(progress));
    initProgressChart();
    hideProgressForm();
    alert('Progress updated!');
}

function loadProgressData() {
    initProgressChart();
    syncWearable(true);
}

function initProgressChart() {
    const progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180,
        bodyFat: 18,
        muscleMass: 140,
        steps: 0,
        heartRate: 0,
        history: [{ weight: 180, bodyFat: 18, muscleMass: 140, date: new Date().toLocaleDateString() }]
    };
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: progress.history.map(entry => entry.date),
            datasets: [
                { label: 'Weight (lbs)', data: progress.history.map(entry => entry.weight), borderColor: '#f59e0b', fill: false },
                { label: 'Body Fat (%)', data: progress.history.map(entry => entry.bodyFat), borderColor: '#10b981', fill: false },
                { label: 'Muscle Mass (lbs)', data: progress.history.map(entry => entry.muscleMass), borderColor: '#3b82f6', fill: false }
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false } }
        }
    });

    const stepsDisplay = document.getElementById('wearable-steps');
    const hrDisplay = document.getElementById('wearable-hr');
    if (stepsDisplay && hrDisplay) {
        stepsDisplay.textContent = progress.steps;
        hrDisplay.textContent = `${progress.heartRate} bpm`;
    }
}

function syncWearable(auto = false) {
    const progress = JSON.parse(localStorage.getItem('progress')) || {
        weight: 180,
        bodyFat: 18,
        muscleMass: 140,
        steps: 0,
        heartRate: 0,
        history: [{ weight: 180, bodyFat: 18, muscleMass: 140, date: new Date().toLocaleDateString() }]
    };
    // Simulate wearable data sync
    progress.steps += auto ? 0 : Math.floor(Math.random() * 1000) + 500; // Random steps
    progress.heartRate = auto ? progress.heartRate : Math.floor(Math.random() * 40) + 60; // Random HR
    localStorage.setItem('progress', JSON.stringify(progress));
    if (!auto) alert('Wearable device synced!');
    initProgressChart();
}

// Classes Functions
function bookClass(className) {
    let stats = JSON.parse(localStorage.getItem('dashboardStats')) || {
        workouts: 24,
        calories: 3500,
        classes: 8,
        records: 5
    };
    stats.classes += 1;
    stats.workouts += 1;
    stats.calories += 300;
    localStorage.setItem('dashboardStats', JSON.stringify(stats));

    let leaderboard = JSON.parse(localStorage.getItem('classLeaderboard')) || { 'John Doe': 8 };
    leaderboard['John Doe'] = (leaderboard['John Doe'] || 0) + 1;
    localStorage.setItem('classLeaderboard', JSON.stringify(leaderboard));

    alert(`Successfully booked ${className} class!`);
    loadDashboardStats();
    loadAchievements();
    loadClassLeaderboard();
    window.location.href = 'index.html';
}

function loadClassSchedule() {
    const scheduleContainer = document.getElementById('class-schedule');
    if (!scheduleContainer) return;
    const today = new Date();
    const schedule = [
        { name: 'Strength Training', time: 'Today 6:00 PM', spots: 5 },
        { name: 'Yoga Flow', time: 'Tomorrow 8:00 AM', spots: 10 },
        { name: 'HIIT Cardio', time: 'Tomorrow 7:00 PM', spots: 3 }
    ];
    scheduleContainer.innerHTML = schedule.map(cls => `
        <div class="flex justify-between items-center">
            <div>
                <p class="font-semibold">${cls.name}</p>
                <p class="text-sm text-gray-400">${cls.time}</p>
            </div>
            <button class="btn-primary px-4 py-2 rounded-full ${cls.spots > 0 ? 'neon-glow' : 'opacity-50 cursor-not-allowed'}" 
                    onclick="${cls.spots > 0 ? `bookClass('${cls.name}')` : 'alert(\'Class full!\')'}">
                ${cls.spots > 0 ? `Book (${cls.spots} spots)` : 'Full'}
            </button>
        </div>
    `).join('');
}

function loadTrainerSchedule() {
    const scheduleContainer = document.getElementById('trainer-schedule');
    if (!scheduleContainer) return;
    const trainers = [
        { name: 'John Smith', time: 'Today 5:00 PM', available: true },
        { name: 'Sarah Johnson', time: 'Tomorrow 10:00 AM', available: true }
    ];
    scheduleContainer.innerHTML = trainers.map(trainer => `
        <div class="flex justify-between items-center">
            <div>
                <p class="font-semibold">${trainer.name}</p>
                <p class="text-sm text-gray-400">${trainer.time}</p>
            </div>
            <button class="btn-primary px-4 py-2 rounded-full ${trainer.available ? 'neon-glow' : 'opacity-50 cursor-not-allowed'}" 
                    onclick="${trainer.available ? `bookTrainer('${trainer.name}', '${trainer.time}')` : 'alert(\'Slot taken!\')'}">
                ${trainer.available ? 'Book' : 'Taken'}
            </button>
        </div>
    `).join('');
}

function bookTrainer(name, time) {
    alert(`Booked a session with ${name} at ${time}!`);
    // In a real app, this would update availability
    loadTrainerSchedule();
}

function loadClassLeaderboard() {
    const leaderboardContainer = document.getElementById('class-leaderboard');
    if (!leaderboardContainer) return;
    const leaderboard = JSON.parse(localStorage.getItem('classLeaderboard')) || { 'John Doe': 8 };
    const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);
    leaderboardContainer.innerHTML = sorted.map(([user, count], idx) => `
        <div class="flex justify-between">
            <p>${idx + 1}. ${user}</p>
            <p>${count} classes</p>
        </div>
    `).join('') || '<p>No leaderboard data yet.</p>';
}

// Community Functions
function sharePost(event) {
    event.preventDefault();
    const content = document.getElementById('post-content').value;
    let posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
    const postId = Date.now();
    posts.unshift({
        id: postId,
        user: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        content,
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    document.getElementById('post-content').value = '';
    loadCommunityPosts();
    alert('Post shared successfully!');
}

function loadCommunityPosts() {
    const postsContainer = document.getElementById('community-posts');
    if (!postsContainer) return;
    const posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
    postsContainer.innerHTML = posts.map(post => `
        <div class="flex items-center mb-4">
            <img src="${post.avatar}" alt="${post.user}" class="w-12 h-12 rounded-full mr-4">
            <div class="flex-1">
                <p class="font-semibold">${post.user}</p>
                <p class="text-sm text-gray-400">${post.content}</p>
                <p class="text-xs text-gray-500">${post.timestamp}</p>
                <div class="flex space-x-2 mt-2">
                    <button class="share-btn p-2 rounded-full bg-gray-700 neon-glow" onclick="sharePostSocial('${post.content}', 'twitter')"><i data-feather="twitter"></i></button>
                    <button class="share-btn p-2 rounded-full bg-gray-700 neon-glow" onclick="sharePostSocial('${post.content}', 'facebook')"><i data-feather="facebook"></i></button>
                </div>
            </div>
        </div>
    `).join('') || '<p>No posts yet. Be the first to share!</p>';
    feather.replace();
}

function sharePostSocial(content, platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(content);
    let shareUrl;
    if (platform === 'twitter') {
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (platform === 'facebook') {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Trainers Functions
function showTrainerProfile(trainerName) {
    alert(`Trainer Profile for ${trainerName}:\nSpecialty: ${trainerName === 'John Smith' ? 'Strength & Conditioning' : 'Yoga & Pilates'}\nExperience: 5+ years\nContact: trainer@flexgym.com`);
}

// Pricing Functions
function selectPlan(plan) {
    localStorage.setItem('selectedPlan', plan);
    alert(`${plan} plan selected! Redirecting to payment (simulated).`);
    loadMembershipStatus();
    window.location.href = 'index.html';
}

// Contact Functions
function sendContactMessage(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.push({ name, email, message, timestamp: new Date().toLocaleString() });
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-message').value = '';
    alert('Message sent! We’ll get back to you soon.');
}

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});