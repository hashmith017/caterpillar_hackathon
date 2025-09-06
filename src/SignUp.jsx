import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = ({ onSignUp }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');

    const handleSignUp = (e) => {
        e.preventDefault();
        setError('');

        if (username.length < 3 || password.length < 6) {
            setError('Username must be at least 3 characters and password at least 6 characters long.');
            return;
        }

        const newUser = { username, password, role };
        const success = onSignUp(newUser);
        if (success) {
            navigate('/');
        } else {
            setError('Username already exists. Please choose a different username.');
        }
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
        signUpContainer: {
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background
            color: 'white', // White text
            border: '1px solid white' // Light border for visibility
        },
        button: {
            backgroundColor: '#38a169', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem',
            borderRadius: '0.25rem', outline: 'none',
        },
        link: {
            color: '#ffffffff',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginTop: '1rem'
        },
        errorMessage: {
            color: '#e53e3e',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            textAlign: 'center'
        }
    };

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <h1 style={{...styles.h1, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>Smart Rental Tracking Dashboard 📊</h1>
                <div style={styles.signUpContainer}>
                    <h2 style={styles.h2}>Sign Up</h2>
                    <form onSubmit={handleSignUp} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                                placeholder="Choose a username"
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
                                placeholder="Choose a password"
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
                            <button type="submit" style={styles.button}>Sign Up</button>
                            {error && <p style={styles.errorMessage}>{error}</p>}
                            <Link to="/" style={styles.link}>Already have an account? Log in</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;