// Handle URL shortening form submission
document.getElementById('shortenForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalUrl = document.getElementById('originalUrl').value;
    const customAlias = document.getElementById('customAlias').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const expiresAt = document.getElementById('expiresAt').value;
    const isActive = document.getElementById('isActive').checked;

    try {
        const response = await fetch('/api/urls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                originalUrl,
                customAlias,
                title,
                description,
                expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
                isActive
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayShortenedUrl(data);
        } else {
            showError(data.message || 'Failed to shorten URL');
        }
    } catch (error) {
        showError('An error occurred while shortening the URL');
    }
});

// Display shortened URL result
function displayShortenedUrl(url) {
    const resultContainer = document.getElementById('resultContainer');
    const shortenedUrlInput = document.getElementById('shortenedUrl');
    const viewAnalyticsLink = document.getElementById('viewAnalytics');
    const generateQRLink = document.getElementById('generateQR');

    shortenedUrlInput.value = url.shortUrl;
    viewAnalyticsLink.href = `analytics.html?url=${url._id}`;
    generateQRLink.href = `qr-code.html?url=${url._id}`;

    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Copy shortened URL to clipboard
function copyToClipboard() {
    const shortenedUrl = document.getElementById('shortenedUrl');
    shortenedUrl.select();
    document.execCommand('copy');

    const copyButton = document.querySelector('.btn-copy');
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    
    setTimeout(() => {
        copyButton.textContent = originalText;
    }, 2000);
}

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

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date for expiration date input
    const expiresAtInput = document.getElementById('expiresAt');
    if (expiresAtInput) {
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        expiresAtInput.min = minDate;
    }
});