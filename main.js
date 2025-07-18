// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    setTimeout(() => preloader.style.display = 'none', 500);
    AOS.init({ duration: 1000, once: true });
    feather.replace();
});

// Navbar Scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
});

// Login/Logout
document.getElementById('login-btn').addEventListener('click', function() {
    window.location.hash = '#dashboard';
    document.getElementById('home').classList.add('d-none');
    document.getElementById('dashboard').classList.remove('d-none');
    window.scrollTo(0, 0);
});

document.getElementById('logout-btn').addEventListener('click', function() {
    window.location.hash = '#home';
    document.getElementById('dashboard').classList.add('d-none');
    document.getElementById('home').classList.remove('d-none');
    window.scrollTo(0, 0);
});

// Sidebar Navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function(e) {
        if (!this.href.includes('workout-plan.html')) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const section = this.getAttribute('data-section');
            if (section) {
                document.querySelectorAll('.dashboard-content').forEach(content => content.classList.add('d-none'));
                document.getElementById(section).classList.remove('d-none');
            }
        }
    });
});

// Join Class
document.querySelectorAll('.join-class-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const className = this.getAttribute('data-class');
        alert(`You have joined the ${className} class!`);
    });
});

// Workout Details
function openWorkoutDetails(workout) {
    alert(`Details for ${workout}: A high-intensity workout targeting all major muscle groups. Duration: 60 mins.`);
}

// Class Details
function openClassDetails(className) {
    alert(`Details for ${className}: Build muscle and strength with expert guidance.`);
}

// Trainer Contact
function contactTrainer(trainer) {
    alert(`Contacting ${trainer}. Please reach out via email: john.smith@flexgym.com`);
}

// Signup
function signup(plan) {
    alert(`You have selected the ${plan} plan! Redirecting to signup...`);
}

// Contact Form Submission
function submitContact(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    document.querySelector('.contact-form').reset();
}

// Create New Workout Plan
function createNewPlan() {
    alert('Feature to create a new workout plan coming soon!');
}