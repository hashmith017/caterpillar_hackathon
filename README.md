# Caterpillar Smart Rental Tracking Dashboard

> A modern, full-featured React dashboard for tracking and analyzing heavy equipment rentals, designed for both equipment users and providers. Includes analytics, machine learning insights, interactive maps, and a built-in chatbot for user support.

---

## Table of Contents
- [Demo](#Demo)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Architecture & Key Components](#architecture--key-components)
- [Customization](#customization)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Demo

🔗 **Live Demo:** [https://hashmith017.github.io/caterpillar_hackathon](https://hashmith017.github.io/caterpillar_hackathon)  
_(Deployed via GitHub Pages)_

### 🔑 Demo Accounts

- **User Login**  
  - Username: `OP103`  
  - Password: `op103`  
  - Role: `User`

- **Provider Login**  
  - Username: `pro`  
  - Password: `pass`  
  - Role: `Provider`

---

## Features

- 🔐 **User & Provider Authentication** – Secure login and sign-up for both roles  
- 📊 **Role-based Dashboards** – Separate dashboards for users and providers  
- 🌗 **Dark/Light Mode Toggle** – Switch themes instantly, persists across sessions  
- 📈 **Equipment Analytics** – View current rentals, history, overdue, and efficiency  
- 📊 **Interactive Charts** – Pie charts, bar charts, and more (powered by Chart.js)  
- 🤖 **ML Insights** – Efficiency and operator scores, demand forecasting, anomaly detection  
- 🗺️ **Map Visualization** – See equipment distribution across sites (Mapbox/Leaflet)  
- 💬 **Chatbot** – Built-in help and FAQ for users  
- 📱 **Responsive UI** – Works on desktop and mobile  
- 🎨 **Inline CSS** – Easy to customize styles  

---

## Screenshots

Login Page  
<img width="1879" height="828" alt="login" src="https://github.com/user-attachments/assets/0c07a029-a9ca-4b44-a725-446cd1dfdc59" />

User Dashboard  
<img width="1918" height="947" alt="user dashboard" src="https://github.com/user-attachments/assets/244d04f1-edcd-4765-8d33-a7190d81ee2c" />  
<img width="1917" height="873" alt="user dashboard 2" src="https://github.com/user-attachments/assets/7ae3bc7d-a394-4c0b-9e68-74fb6ac5b15c" />

Provider Dashboard  
<img width="1919" height="869" alt="provider dashboard" src="https://github.com/user-attachments/assets/9a09c7aa-238a-4916-8c15-e75fb08c5170" />  
<img width="1203" height="868" alt="provider dashboard 2" src="https://github.com/user-attachments/assets/a58e3035-3ff0-4d1e-8cfb-bb5f8ae8bc8e" />  
<img width="1185" height="862" alt="provider dashboard 3" src="https://github.com/user-attachments/assets/40ee6011-d42d-4e02-8612-d3b2c699334d" />  
<img width="1161" height="784" alt="provider dashboard 4" src="https://github.com/user-attachments/assets/0b37d22b-b3b1-4914-8253-85c607c49306" />  
<img width="1179" height="863" alt="provider dashboard 5" src="https://github.com/user-attachments/assets/64368197-c5ba-43c2-9ae0-a2eb22f3051a" />  
<img width="1170" height="732" alt="provider dashboard 6" src="https://github.com/user-attachments/assets/11a42248-8375-41f8-a27a-d270c6d97165" />

AI Chatbot  
<img width="451" height="617" alt="chatbot" src="https://github.com/user-attachments/assets/2f7af883-eba3-4c9e-8846-b95b74eb69d1" />

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/hashmith017/caterpillar_hackathon.git
   cd caterpillar
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
caterpillar/
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
└── package.json
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

- **App.jsx** – Main router and state manager  
- **Login.jsx / SignUp.jsx** – Authentication pages  
- **UserDashboard.jsx** – User analytics, current/history rentals, efficiency, overdue, charts  
- **ProviderDashboard.jsx** – Provider analytics, operator scores, demand forecasting, anomaly detection, map  
- **Chatbot.jsx** – FAQ and help system  
- **ThemeToggle.jsx** – Dark/light mode switch  
- **dataService.js** – Loads and parses CSV data  
- **mlService.js** – Machine learning logic for efficiency, operator scores, forecasting, anomaly detection  

---

## Customization

- 🎨 **Styling** – Inline styles in each component for easy editing  
- 🌗 **Theme** – Edit `ThemeToggle.jsx` to change theme logic or add more themes  
- 📊 **Data** – Replace or expand `equipment_data.csv` with your own data  
- 🔐 **Authentication** – For production, replace in-memory auth with a backend  
- 🗺️ **Map** – Add your Mapbox token in `ProviderDashboard.jsx` for full map features  

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
