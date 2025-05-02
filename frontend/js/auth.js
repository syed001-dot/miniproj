// Auth token management
const TOKEN_KEY = 'url_shortener_token';
const USER_KEY = 'url_shortener_user';

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const { token, user } = await response.json();
        saveAuthData(token, user);
        window.location.href = '/dashboard.html';
    } catch (error) {
        showError(error.message);
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const { token, user } = await response.json();
        saveAuthData(token, user);
        window.location.href = '/dashboard.html';
    } catch (error) {
        showError(error.message);
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Save auth data
function saveAuthData(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Clear auth data
function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Handle logout
function handleLogout() {
    clearAuthData();
    window.location.href = '/login.html';
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// Initialize auth forms
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Redirect if already logged in
    if (isLoggedIn() && (window.location.pathname === '/login.html' || window.location.pathname === '/register.html')) {
        window.location.href = '/dashboard.html';
    }
});