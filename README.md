
# Caterpillar Smart Rental Tracking Dashboard

>A modern, full-featured React dashboard for tracking and analyzing heavy equipment rentals, designed for both equipment users and providers. Includes analytics, machine learning insights, interactive maps, and a built-in chatbot for user support.

---

## Table of Contents
- [Demo](#demo)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Architecture](#architecture)
- [Customization](#customization)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Demo

> **Live demo:** _[Add your deployment link here if available]_  
> ![Dashboard Screenshot](screenshot.png) <!-- Add a screenshot if you have one -->

---

## Features

- **User & Provider Authentication**: Secure login and sign-up for both roles
- **Role-based Dashboards**: Separate dashboards for users and providers
- **Dark/Light Mode Toggle**: Switch themes instantly, persists across sessions
- **Equipment Analytics**: View current rentals, history, overdue, and efficiency
- **Interactive Charts**: Pie charts, bar charts, and more (powered by Chart.js)
- **ML Insights**: Efficiency and operator scores, demand forecasting, anomaly detection
- **Map Visualization**: See equipment distribution across sites (Mapbox/Leaflet)
- **Chatbot**: Built-in help and FAQ for users
- **Responsive UI**: Works on desktop and mobile
- **Inline CSS**: Easy to customize styles

---

## Screenshots

> _Add screenshots of Login, User Dashboard, Provider Dashboard, and Chatbot here for best results._

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/avinashreddy1235/caterpillar.git
   cd my-dashboard
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```
4. **Build for production:**
   ```bash
   npm run build
   ```

---

## Project Structure

```
my-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── Login.jsx
│   ├── SignUp.jsx
│   ├── UserDashboard.jsx
│   ├── ProviderDashboard.jsx
│   ├── Chatbot.jsx
│   ├── ThemeToggle.jsx
│   ├── dataService.js
│   ├── mlService.js
│   ├── data/
│   │   └── equipment_data.csv
│   ├── index.js
│   └── index.css
├── .gitignore
├── README.md
└── ...
```

---

## Data Model

Equipment data is stored in `src/data/equipment_data.csv` with columns:

| Equipment ID | Type      | Site ID | Check-Out Date | Planned Check-In Date | Actual Check-In Date | Engine Hours/Day | Idle Hours/Day | Operating Days | Fuel Usage/Day (Liters) | Operator ID |
|--------------|-----------|---------|----------------|----------------------|---------------------|------------------|----------------|---------------|-------------------------|-------------|
| EQX1000      | Excavator | S006    | 2025-07-23     | 2025-07-29           | 2025-08-08          | 5                | 4              | 6             | 18.7                    | OP106       |

**User accounts** and **provider accounts** are managed in-memory for demo purposes. See `App.jsx` for initial credentials.

---

## Architecture & Key Components

- **App.jsx**: Main router and state manager
- **Login.jsx / SignUp.jsx**: Auth pages for users/providers
- **UserDashboard.jsx**: User analytics, current/history rentals, efficiency, overdue, charts
- **ProviderDashboard.jsx**: Provider analytics, operator scores, demand forecasting, anomaly detection, map
- **Chatbot.jsx**: FAQ and help system
- **ThemeToggle.jsx**: Dark/light mode switch
- **dataService.js**: Loads and parses CSV data
- **mlService.js**: Machine learning logic for efficiency, operator scores, forecasting, anomaly detection

---

## Customization

- **Styling**: All styles are inline in each component for easy editing
- **Theme**: Edit `ThemeToggle.jsx` to change theme logic or add more themes
- **Data**: Replace or expand `equipment_data.csv` for your own data
- **Authentication**: For production, replace in-memory auth with a backend
- **Map**: Add your Mapbox token in `ProviderDashboard.jsx` for full map features

---

## FAQ

**Q: How do I log in?**  
A: Use your username and select your role (User or Provider) on the login page. Demo accounts are pre-filled in `App.jsx`.

**Q: How is efficiency calculated?**  
A: See `mlService.js` for the formula. It uses engine hours, idle hours, fuel usage, and a bias term.

**Q: How do I see my current rentals?**  
A: Go to the User Dashboard after login. Current rentals are shown in the main table.

**Q: What is the Operator Score?**  
A: A performance metric for providers, based on engine hours, idle hours, and overdue rentals. See `mlService.js`.

**Q: How do I add more equipment or users?**  
A: Add rows to `equipment_data.csv` for equipment. Add users in `App.jsx` or connect to a backend.

**Q: How do I deploy this?**  
A: Build with `npm run build` and deploy the `build/` folder to your preferred static hosting (Vercel, Netlify, GitHub Pages, etc).

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
