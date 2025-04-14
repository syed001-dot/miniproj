// Auth token management
const TOKEN_KEY = 'url_shortener_token';
const USER_KEY = 'url_shortener_user';

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

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            saveAuthData(data.token, data.user);
            window.location.href = 'dashboard.html';
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        showError('An error occurred during login');
    }
});

// Handle registration form submission
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            saveAuthData(data.token, data.user);
            window.location.href = 'dashboard.html';
        } else {
            showError(data.message || 'Registration failed');
        }
    } catch (error) {
        showError('An error occurred during registration');
    }
});

// Handle logout
document.getElementById('logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuthData();
    window.location.href = 'index.html';
});

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Protect routes that require authentication
function protectRoute() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Update UI with user info
    const userName = document.getElementById('userName');
    if (userName) {
        const user = getCurrentUser();
        userName.textContent = user.name;
    }
}

// Initialize auth state
document.addEventListener('DOMContentLoaded', () => {
    // Protect authenticated routes
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname.includes('shorten.html') ||
        window.location.pathname.includes('analytics.html') ||
        window.location.pathname.includes('qr-code.html')) {
        protectRoute();
    }

    // Redirect authenticated users away from auth pages
    if ((window.location.pathname.includes('login.html') || 
         window.location.pathname.includes('register.html')) && 
        isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
});