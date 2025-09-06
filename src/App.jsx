import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import UserDashboard from './UserDashboard.jsx';
import ProviderDashboard from './ProviderDashboard.jsx';
import Chatbot from './Chatbot.jsx';

const initialUserCredentials = [
    { username: 'pro', password: 'pass', role: 'provider' },
    // Operator accounts
    ...Array.from({ length: 10 }, (_, i) => ({
        username: `OP${101 + i}`,
        password: `op${101 + i}`,
        role: 'user',
    })),
];

const App = () => {
    const [userCredentials, setUserCredentials] = useState(initialUserCredentials);

    const handleLogin = (username, role) => {
        localStorage.setItem('dashboardUsername', username);
    };

    const handleSignUp = (newUser) => {
        // Prevent duplicate usernames
        if (!userCredentials.find(u => u.username === newUser.username)) {
            setUserCredentials((prevCredentials) => [...prevCredentials, newUser]);
            return true;
        }
        return false;
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login userCredentials={userCredentials} onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/provider" element={<ProviderDashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Chatbot />
        </Router>
    );
};

export default App;