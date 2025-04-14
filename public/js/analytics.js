// Get URL ID from query parameters
function getUrlId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('url');
}

// Load analytics data
async function loadAnalytics() {
    const urlId = getUrlId();
    if (!urlId) {
        showError('No URL specified');
        return;
    }

    const timeRange = document.getElementById('timeRange').value;
    
    try {
        const response = await fetch(`/api/analytics/url/${urlId}?period=${timeRange}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load analytics');
        }

        const data = await response.json();
        updateAnalytics(data);
    } catch (error) {
        showError('Failed to load analytics data');
    }
}

// Update analytics display
function updateAnalytics(data) {
    // Update stats
    document.getElementById('totalClicks').textContent = data.totalClicks;
    document.getElementById('uniqueVisitors').textContent = data.uniqueVisitors;
    document.getElementById('avgClicks').textContent = data.avgClicksPerDay.toFixed(1);
    document.getElementById('conversionRate').textContent = `${data.conversionRate}%`;

    // Update charts
    updateClicksChart(data.clicksOverTime);
    updateCountriesChart(data.topCountries);
    updateDevicesChart(data.deviceDistribution);
    updateBrowsersChart(data.browserUsage);

    // Update activity table
    updateActivityTable(data.recentActivity);
}

// Update clicks over time chart
function updateClicksChart(data) {
    const ctx = document.getElementById('clicksChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => new Date(d.date).toLocaleDateString()),
            datasets: [{
                label: 'Clicks',
                data: data.map(d => d.clicks),
                borderColor: '#007bff',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Clicks Over Time'
                }
            }
        }
    });
}

// Update top countries chart
function updateCountriesChart(data) {
    const ctx = document.getElementById('countriesChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.country),
            datasets: [{
                label: 'Clicks',
                data: data.map(d => d.clicks),
                backgroundColor: '#007bff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Top Countries'
                }
            }
        }
    });
}

// Update device distribution chart
function updateDevicesChart(data) {
    const ctx = document.getElementById('devicesChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.device),
            datasets: [{
                data: data.map(d => d.clicks),
                backgroundColor: [
                    '#007bff',
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Device Distribution'
                }
            }
        }
    });
}

// Update browser usage chart
function updateBrowsersChart(data) {
    const ctx = document.getElementById('browsersChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.browser),
            datasets: [{
                data: data.map(d => d.clicks),
                backgroundColor: [
                    '#007bff',
                    '#28a745',
                    '#ffc107',
                    '#dc3545',
                    '#17a2b8'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Browser Usage'
                }
            }
        }
    });
}

// Update activity table
function updateActivityTable(activity) {
    const tbody = document.getElementById('activityTable');
    tbody.innerHTML = '';

    activity.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(item.timestamp).toLocaleString()}</td>
            <td>${item.ipAddress}</td>
            <td>${item.country}</td>
            <td>${item.device}</td>
            <td>${item.browser}</td>
            <td>${item.referrer || 'Direct'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Handle time range change
document.getElementById('timeRange')?.addEventListener('change', loadAnalytics);

// Handle URL selection change
document.getElementById('urlSelect')?.addEventListener('change', loadAnalytics);

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.analytics-container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
});