import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ userCredentials, onLogin }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loginError, setLoginError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError('');

        const foundUser = userCredentials.find(
            (user) => user.username === username && user.password === password && user.role === role
        );

        if (foundUser) {
            onLogin(foundUser.username, foundUser.role);
            if (foundUser.role === 'user') {
                navigate('/user');
            } else {
                navigate('/provider');
            }
        } else {
            setLoginError('Invalid username, password, or role. Please try again.');
        }
    };

    const handleForgotPassword = () => {
        alert('A password reset link has been sent to your email.');
    };

    const styles = {
        body: {
            fontFamily: 'Inter, sans-serif',
            backgroundImage: "url('https://www.ironfx.com/wp-content/uploads/2025/02/caterpillar-logo-building-stock.jpg')",
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden', 
            margin: 0,
            padding: 0
        },
        container: { maxWidth: '1024px', margin: 'auto' },
        h1: { fontSize: '2.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', color: '#1a202c' },
        loginContainer: {
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(42, 42, 42, 0.5)', 
            borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '2rem', marginBottom: '2rem'
        },
        h2: { fontSize: '1.5rem', fontWeight: '600', color: '#ffffffff', marginBottom: '1rem' },
        form: { width: '100%', maxWidth: '24rem' },
        formGroup: { marginBottom: '1rem', zIndex: 10 },
        label: { display: 'block', color: '#ffffffff', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' },
        input: {
            boxShadow: '0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24)',
            appearance: 'none', border: '1px solid #e2e8f0', borderRadius: '0.25rem',
            width: '100%', padding: '0.5rem 0.75rem', 
            lineHeight: '1.25', outline: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            color: 'white', 
            border: '1px solid white' 
        },
        button: {
            backgroundColor: '#4299e1', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem',
            borderRadius: '0.25rem', outline: 'none',
        },
        errorMessage: {
            color: '#e53e3e',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            textAlign: 'center'
        },
        linkContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: '0.5rem',
            fontSize: '0.875rem'
        },
        link: {
            color: '#ffffffff',
            textDecoration: 'none'
        }
    };

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <h1 style={{...styles.h1, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>Smart Rental Tracking Dashboard 📊</h1>
                <div style={styles.loginContainer}>
                    <h2 style={styles.h2}>Login</h2>
                    <form onSubmit={handleLogin} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                                placeholder="Enter your username"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                placeholder="Enter your password"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="role">Role</label>
                            <select
                                id="role"
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={styles.input}
                            >
                                <option value="user">User</option>
                                <option value="provider">Provider</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'column' }}>
                            <button type="submit" style={styles.button}>Login</button>
                            {loginError && <p style={styles.errorMessage}>{loginError}</p>}
                        </div>
                        <div style={styles.linkContainer}>
                            <a href="#" onClick={handleForgotPassword} style={styles.link}>Forgot Password?</a>
                            <Link to="/signup" style={styles.link}>Sign Up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;