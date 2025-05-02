// Load user's URLs with analytics
async function loadUserUrls() {
    try {
        const response = await fetch('/api/urls/my-urls', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load URLs');
        }

        const urls = await response.json();
        displayUrls(urls);
        updateStats(urls);
    } catch (error) {
        showError('Failed to load URLs');
    }
}

// Display URLs in the list
function displayUrls(urls) {
    const urlsList = document.getElementById('urlsList');
    urlsList.innerHTML = '';

    if (urls.length === 0) {
        urlsList.innerHTML = '<p class="no-urls">No URLs found. <a href="shorten.html">Create your first short URL</a></p>';
        return;
    }

    urls.forEach(url => {
        const urlCard = createUrlCard(url);
        urlsList.appendChild(urlCard);
    });
}

// Create URL card element with analytics
function createUrlCard(url) {
    const card = document.createElement('div');
    card.className = 'url-card';
    
    const analytics = url.analytics || [];
    const uniqueVisitors = new Set(analytics.map(a => a.visitorIp)).size;
    
    card.innerHTML = `
        <div class="url-info">
            <h3>${url.title || 'Untitled URL'}</h3>
            <p class="url-original">${url.originalUrl}</p>
            <p class="url-short">${window.location.origin}/${url.shortUrl}</p>
        </div>
        <div class="url-stats">
            <span class="clicks">${url.clicks} clicks</span>
            <span class="visitors">${uniqueVisitors} unique visitors</span>
            <span class="created">Created: ${new Date(url.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="url-actions">
            <button onclick="viewAnalytics('${url.id}')" class="btn btn-primary">View Analytics</button>
            <button onclick="copyToClipboard('${window.location.origin}/${url.shortUrl}')" class="btn btn-secondary">Copy URL</button>
        </div>
    `;
    return card;
}

// View detailed analytics for a URL
async function viewAnalytics(urlId) {
    try {
        const response = await fetch(`/api/analytics/${urlId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load analytics');
        }

        const { analytics, summary } = await response.json();
        displayAnalytics(summary);
    } catch (error) {
        showError('Failed to load analytics');
    }
}

// Display analytics summary
function displayAnalytics(summary) {
    const modal = document.createElement('div');
    modal.className = 'analytics-modal';
    modal.innerHTML = `
        <div class="analytics-content">
            <h2>Analytics Summary</h2>
            <div class="analytics-stats">
                <div class="stat">
                    <h3>Total Visits</h3>
                    <p>${summary.totalVisits}</p>
                </div>
                <div class="stat">
                    <h3>Unique Visitors</h3>
                    <p>${summary.uniqueVisitors}</p>
                </div>
            </div>
            <div class="analytics-breakdown">
                <div class="devices">
                    <h3>Devices</h3>
                    ${Object.entries(summary.byDevice).map(([device, count]) => 
                        `<div class="stat-row"><span>${device}</span><span>${count}</span></div>`
                    ).join('')}
                </div>
                <div class="browsers">
                    <h3>Browsers</h3>
                    ${Object.entries(summary.byBrowser).map(([browser, count]) => 
                        `<div class="stat-row"><span>${browser}</span><span>${count}</span></div>`
                    ).join('')}
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-secondary">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Helper function to copy URL to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showMessage('URL copied to clipboard!');
    } catch (error) {
        showError('Failed to copy URL');
    }
}

// Show success/error messages
function showMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

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

// Update dashboard statistics
function updateStats(urls) {
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const activeUrls = urls.filter(url => url.isActive).length;

    document.getElementById('totalUrls').textContent = totalUrls;
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('activeUrls').textContent = activeUrls;
}

// Handle search
document.getElementById('searchUrl')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const urlCards = document.querySelectorAll('.url-card');

    urlCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const originalUrl = card.querySelector('.url-original').textContent.toLowerCase();
        const shortUrl = card.querySelector('.url-short').textContent.toLowerCase();

        if (title.includes(searchTerm) || 
            originalUrl.includes(searchTerm) || 
            shortUrl.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
});

// Handle sorting
document.getElementById('sortBy')?.addEventListener('change', (e) => {
    const sortBy = e.target.value;
    const urlsList = document.getElementById('urlsList');
    const urlCards = Array.from(urlsList.querySelectorAll('.url-card'));

    urlCards.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.querySelector('.created').textContent.split(': ')[1]) - 
                       new Date(a.querySelector('.created').textContent.split(': ')[1]);
            case 'oldest':
                return new Date(a.querySelector('.created').textContent.split(': ')[1]) - 
                       new Date(b.querySelector('.created').textContent.split(': ')[1]);
            case 'clicks':
                return parseInt(b.querySelector('.clicks').textContent) - 
                       parseInt(a.querySelector('.clicks').textContent);
            default:
                return 0;
        }
    });

    urlsList.innerHTML = '';
    urlCards.forEach(card => urlsList.appendChild(card));
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadUserUrls();
});