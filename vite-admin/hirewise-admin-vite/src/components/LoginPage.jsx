import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./RegistrationPage.css"; // Reuse the same CSS for consistent styling
import { loginUser } from '../lib/auth';

const LoginPage = ({ onBackToRegister, onLoginSuccess }) => {
  const [form, setForm] = useState({ user: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const validate = {
    user: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\d{10}$/.test(v), // Validates as email or 10-digit phone
    password: (v) => v.length >= 6,
  };

  const errorMsg = {
    user: "Enter a valid email or 10-digit phone number.",
    password: "Password must be at least 6 characters.",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setError((prev) => ({
      ...prev,
      [name]: value && !validate[name](value) ? errorMsg[name] : "",
    }));
    setLoginError(''); // Clear login error on input change
  };

  const isFormValid = (
    Object.keys(validate).every((f) => validate[f](form[f])) &&
    Object.keys(error).every((f) => !error[f])
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double-submit
    if (isLoggingIn) return;
    
    setLoginError(''); // Clear any previous login error
    setIsLoggingIn(true);
    
    try {
      await loginUser({
        username: form.user,
        password: form.password
      });
      
      // Navigate to application form on success
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/application');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Invalid email/phone or password');
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <button className="figma-back-btn" onClick={onBackToRegister}>
        <span className="figma-login-icon"><svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M10 12l-4-4 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="3" width="12" height="10" rx="2" stroke="#fff" strokeWidth="1.5" /></svg></span>
        Back to Register
      </button>

      <div className="figma-card-title">
        <span className="figma-user-icon"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#0E76A8" /><path d="M10 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6.5 15v-1a3.5 3.5 0 017 0v1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /></svg></span>
        Login
      </div>

      <form className="figma-form" onSubmit={handleSubmit} autoComplete="off">
        {/* Email or Phone */}
        <div className="figma-form-group">
          <div className={`figma-float-label ${form.user ? "filled" : ""}`}>
            <input 
              className="figma-input" 
              type="text" 
              name="user" 
              id="user" 
              value={form.user} 
              onChange={handleChange} 
              autoComplete="off" 
              placeholder=" "
              disabled={isLoggingIn}
            />
            <label htmlFor="user">Email or Phone</label>
          </div>
          <div className="figma-error">{touched.user && error.user}</div>
        </div>

        {/* Password */}
        <div className="figma-form-group">
          <div className={`figma-float-label ${form.password ? "filled" : ""}`}>
            <input 
              className="figma-input" 
              type="password" 
              name="password" 
              id="password" 
              value={form.password} 
              onChange={handleChange} 
              autoComplete="off" 
              placeholder=" "
              disabled={isLoggingIn}
            />
            <label htmlFor="password">Password</label>
          </div>
          <div className="figma-error">{touched.password && error.password}</div>
        </div>

        {/* Login Error */}
        {loginError && <div className="figma-error" style={{ marginBottom: '1rem' }}>{loginError}</div>}

        <button 
          className="figma-apply-btn" 
          type="submit" 
          disabled={!isFormValid || isLoggingIn}
          style={{
            cursor: isLoggingIn ? 'wait' : 'pointer',
            opacity: isLoggingIn ? 0.7 : 1,
          }}
        >
          {isLoggingIn ? (
            <>
              <span style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
                marginRight: '8px'
              }}></span>
              Logging in...
            </>
          ) : (
            <>
              <span className="figma-send-icon"><svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M3 15l12-6-12-6v5l8 1-8 1v5z" fill="#fff" /></svg></span>
              LOGIN
            </>
          )}
        </button>
      </form>
    </>
  );
};

export default LoginPage; 