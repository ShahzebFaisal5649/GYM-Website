# FLEX GYM - Smart Gym Website

Welcome to the **FLEX GYM Website**, a modern and interactive front-end platform for fitness lovers and gym members. This responsive gym management interface helps users track workouts, book classes, manage nutrition, chat with a virtual trainer, and engage with a fitness community — all in one place.

## Live Demo

[View Live Site](https://shahzebfaisal5649.github.io/GYM-Website/)

---

## Screenshots

![Dashboard](Flex%20Gym%20Dashboard.png)
![Classes](Flex%20Gym%20Classes.png)
![Nutrition](Flex%20Gym%20Nutrition.png)
![Progress Tracker](Flex%20Gym%20Progress%20Tracker.png)

---

## Features

### Core Modules
- **Dashboard**: See total workouts, calories burned, records, and class stats.
- **Workout Tracker**: Rep counter, timer, calorie tracker, and intensity feedback.
- **Nutrition Panel**: Log meals, water intake, and get AI-generated meal plans.
- **Progress Tracker**: Input body stats, sync wearable data, and visualize trends.
- **Class Booking**: View schedules and book real-time fitness classes.
- **Trainer Scheduler**: Book training sessions with available trainers.
- **Community Feed**: Share posts and interact with fellow gym members.
- **AI Chatbot**: A virtual trainer offering workout and nutrition advice.

### UI Features
- Responsive design using **Tailwind CSS**
- Light/dark mode toggle with persistent theme
- Dynamic UI components powered by **Feather Icons**
- Scroll animations and smooth transitions
- Data saved locally using **Local Storage API**

---

## Technologies Used

| Technology | Usage |
|---|---|
| HTML5 | Page structure (10 pages) |
| Tailwind CSS v2.2.19 | Styling and layout |
| JavaScript (ES6) | Interactivity and logic |
| Feather Icons | UI icons |
| Google Fonts (Poppins) | Typography |

> All dependencies are loaded via CDN — no build step required.

---

## Project Structure

```
GYM-Website/
├── index.html              # Dashboard (home page)
├── workout-plan.html       # Workout planning
├── classes.html            # Gym classes
├── nutrition.html          # Nutrition tracking
├── progress-tracker.html   # Progress monitoring
├── trainers.html           # Trainer profiles
├── pricing.html            # Membership pricing
├── contact.html            # Contact form
├── community.html          # Community features
├── strength-training.html  # Strength training detail page
├── scripts.js              # Main application logic
├── main.js                 # Preloader & navbar scripts
└── styles.css              # Custom styles
```

---

## How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShahzebFaisal5649/GYM-Website.git
   cd GYM-Website
   ```

2. **Open the main HTML file in your browser**
   - Double-click `index.html`, or
   - Use the Live Server extension in VS Code, or
   - Run one of the following in your terminal:
     ```bash
     start index.html    # Windows
     open index.html     # macOS
     python -m http.server 8000  # Any OS
     ```

---

## Deployment

This site is deployed via **GitHub Pages** at:
[https://shahzebfaisal5649.github.io/GYM-Website/](https://shahzebfaisal5649.github.io/GYM-Website/)

You can also deploy to:
- **Netlify** — Drag and drop the project folder at [netlify.com](https://netlify.com)
- **Vercel** — Import this repository at [vercel.com](https://vercel.com)

---

## Sample Pages

- `index.html` — Main dashboard
- `strength-training.html` — Class booking page
- `nutrition.html` — Meal logging & planning
- `community.html` — Social interaction hub
- `progress-tracker.html` — Body progress visualization

---

## Future Enhancements

- Add user login system (Firebase/Auth0)
- Store real-time data in a cloud database
- Enable trainer/admin dashboards
- Mobile-first enhancements

---

## Author

**Shahzeb Faisal**
- Email: [l215649@lhr.nu.edu.pk](mailto:l215649@lhr.nu.edu.pk)
- LinkedIn: [shahzeb-faisal](https://www.linkedin.com/in/shahzeb-faisal-8b9190321/)

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute it.
