import React, { useState } from 'react';

function Login({ onLogin }) {

    // TODO: Use useState to manage:
    // 1. Signup/Login toggle
    // 2. Form data (username, password, email)
    // 3. Error messages
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');    
    // TODO: Implement handleSubmit function
    // - Prevent default form submission
    // - Choose endpoint based on login/signup
    // - Call POST /login or POST /signup API
    // - Handle success:
    //   - Call onLogin with user data
    // - Handle error responses
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const username = formData.username.trim();
        const password = formData.password.trim();
        const email = formData.email.trim();

        if (!username || !password) {
            setError('Username and password are required.');
            return;
        }

        if (isSignup && !email) {
            setError('Email is required for signup.');
            return;
        }
        
        if (isSignup) {
            try {
                const response = await fetch('http://localhost:4000/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, email })
                });
                const data = await response.json();
                if (!response.ok) {
                    setError(data.message || 'Signup failed.');
                    return;
                }
            } catch (err) {
                setError('Signup failed. Please try again.');
                console.log(err);
                return;
            }
        }
        else{
            try {
                console.log("something");
                const response = await fetch('http://localhost:4000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (!response.ok) {
                    setError(data.message || 'Login failed.');
                    return;
                }
            } catch (err) {
                setError('Login failed. Please try again.');
                console.log(err);
                return;
            }
        }
        
        onLogin({ username, password });
    };

    function handleChange(e){
        const value = e.target.value;
        const field = e.target.name;

        setFormData(values => ({...values, [field]: value}));
    }

    return (
        <>
            {/*
              TODO: Implement JSX for Login / Signup page
              - Username input
              - Password input
              - Email input (only for signup)
              - Error message display
              - Submit button
              - Toggle between Login and Signup
            */}            
            <form onSubmit={handleSubmit}>
                <label>username:</label>
                <input
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                />
                <label>password:</label>
                <input
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                />
                {isSignup && (
                    <>
                        <label>email:</label>
                        <input
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </>
                )}
                {error && <div>{error}</div>}
                <button type="submit">
                    {isSignup ? 'Sign up' : 'Login'}
                </button>
                <button
                    type="button"
                    onClick={() => setIsSignup((prev) => !prev)}
                >
                    {isSignup ? 'Switch to Login' : 'Switch to Signup'}
                </button>
            </form>
        </>
    );
}

export default Login;
