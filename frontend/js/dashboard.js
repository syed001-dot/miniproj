// Load user's URLs
async function loadUserUrls() {
    try {
        const response = await fetch('/api/urls', {
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

// Create URL card element
function createUrlCard(url) {
    const card = document.createElement('div');
    card.className = 'url-card';
    card.innerHTML = `
        <div class="url-info">
            <h3>${url.title || 'Untitled URL'}</h3>
            <p class="url-original">${url.originalUrl}</p>
            <p class="url-short">${url.shortUrl}</p>
        </div>
        <div class="url-stats">
            <span class="clicks">${url.clicks} clicks</span>
            <span class="created">Created: ${new Date(url.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="url-actions">
            <a href="analytics.html?url=${url._id}" class="btn-secondary">View Analytics</a>
            <a href="qr-code.html?url=${url._id}" class="btn-secondary">QR Code</a>
            <button class="btn-delete" onclick="deleteUrl('${url._id}')">Delete</button>
        </div>
    `;
    return card;
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

// Delete URL
async function deleteUrl(urlId) {
    if (!confirm('Are you sure you want to delete this URL?')) {
        return;
    }

    try {
        const response = await fetch(`/api/urls/${urlId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete URL');
        }

        loadUserUrls(); // Reload URLs after deletion
    } catch (error) {
        showError('Failed to delete URL');
    }
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