// Handle URL shortening form submission
async function handleShorten(event) {
    event.preventDefault();

    const originalUrl = document.getElementById('originalUrl').value;
    const title = document.getElementById('title')?.value;
    const description = document.getElementById('description')?.value;

    try {
        const response = await fetch('/api/urls/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                originalUrl,
                title,
                description
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to shorten URL');
        }

        const url = await response.json();
        displayResult(url);
    } catch (error) {
        showError(error.message);
    }
}

// Display shortened URL result
function displayResult(url) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="success-message">
            <h3>URL Shortened Successfully!</h3>
            <div class="url-details">
                <p><strong>Short URL:</strong> 
                    <span id="shortUrl">${window.location.origin}/${url.shortUrl}</span>
                    <button onclick="copyToClipboard('${window.location.origin}/${url.shortUrl}')" class="btn btn-secondary">
                        Copy
                    </button>
                </p>
                <p><strong>Original URL:</strong> ${url.originalUrl}</p>
            </div>
            <div class="action-buttons">
                <a href="/dashboard.html" class="btn btn-primary">Go to Dashboard</a>
                <button onclick="document.getElementById('shortenForm').reset(); resultDiv.innerHTML = '';" class="btn btn-secondary">
                    Shorten Another URL
                </button>
            </div>
        </div>
    `;
}

// Copy URL to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showMessage('URL copied to clipboard!');
    } catch (error) {
        showError('Failed to copy URL');
    }
}

// Show success message
function showMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Show error message
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('shortenForm');
    if (form) {
        form.addEventListener('submit', handleShorten);
    }

    // Redirect if not logged in
    if (!getAuthToken()) {
        window.location.href = '/login.html';
    }
});