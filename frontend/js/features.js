// Feature data
const features = {
    shortening: {
        title: "URL Shortening",
        description: "Transform long URLs into short, memorable links with our powerful URL shortener.",
        icon: "fas fa-link",
        details: [
            {
                title: "Custom Aliases",
                description: "Create custom short URLs that are easy to remember and share."
            },
            {
                title: "Expiration Dates",
                description: "Set expiration dates for your shortened URLs to control their lifespan."
            },
            {
                title: "Password Protection",
                description: "Add password protection to your shortened URLs for enhanced security."
            }
        ]
    },
    analytics: {
        title: "Advanced Analytics",
        description: "Gain valuable insights into your shortened URLs with detailed analytics.",
        icon: "fas fa-chart-line",
        details: [
            {
                title: "Click Tracking",
                description: "Track the number of clicks and unique visitors for each URL."
            },
            {
                title: "Geographic Data",
                description: "See where your visitors are coming from with country-level analytics."
            },
            {
                title: "Device Information",
                description: "Get insights into the devices and browsers your visitors are using."
            }
        ]
    },
    qr: {
        title: "QR Code Generation",
        description: "Create QR codes for your shortened URLs with custom styling options.",
        icon: "fas fa-qrcode",
        details: [
            {
                title: "Custom Colors",
                description: "Customize QR code colors to match your brand or design."
            },
            {
                title: "High Resolution",
                description: "Download high-resolution QR codes in various formats."
            },
            {
                title: "Logo Integration",
                description: "Add your logo to QR codes for better brand recognition."
            }
        ]
    }
};

// Load feature details
function loadFeatureDetails(featureId) {
    const feature = features[featureId];
    if (!feature) return;

    const featureSection = document.getElementById('featureDetails');
    if (!featureSection) return;

    featureSection.innerHTML = `
        <div class="feature-header">
            <i class="${feature.icon}"></i>
            <h2>${feature.title}</h2>
            <p>${feature.description}</p>
        </div>
        <div class="feature-details">
            ${feature.details.map(detail => `
                <div class="detail-card">
                    <h3>${detail.title}</h3>
                    <p>${detail.description}</p>
                </div>
            `).join('')}
        </div>
    `;

    // Scroll to feature section
    featureSection.scrollIntoView({ behavior: 'smooth' });
}

// Handle feature navigation
document.addEventListener('DOMContentLoaded', () => {
    // Load feature from URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash && features[hash]) {
        loadFeatureDetails(hash);
    }

    // Handle feature links
    document.querySelectorAll('.feature-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const featureId = link.getAttribute('data-feature');
            if (features[featureId]) {
                loadFeatureDetails(featureId);
                window.location.hash = featureId;
            }
        });
    });
});

// Initialize feature animations
function initFeatureAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.feature-card, .detail-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initFeatureAnimations();
}); 