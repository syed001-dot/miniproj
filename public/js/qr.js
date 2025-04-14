// Get URL from query parameter or form
function getUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('url');
    
    if (urlId) {
        return urlId;
    }
    
    return document.getElementById('url').value;
}

// Generate QR code
async function generateQRCode() {
    const url = getUrl();
    if (!url) {
        showError('Please enter a URL');
        return;
    }

    const size = document.getElementById('qrSize').value;
    const color = document.getElementById('qrColor').value;
    const bgColor = document.getElementById('qrBgColor').value;
    const format = document.getElementById('qrFormat').value;

    try {
        const response = await fetch('/api/urls/qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                url,
                size: parseInt(size),
                color,
                bgColor,
                format
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate QR code');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        displayQRCode(imageUrl);
    } catch (error) {
        showError('Failed to generate QR code');
    }
}

// Display QR code
function displayQRCode(imageUrl) {
    const resultContainer = document.getElementById('qrResultContainer');
    const qrCodeImage = document.getElementById('qrCodeImage');
    
    qrCodeImage.src = imageUrl;
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Download QR code
async function downloadQRCode() {
    const qrCodeImage = document.getElementById('qrCodeImage');
    const format = document.getElementById('qrFormat').value;
    
    try {
        const response = await fetch(qrCodeImage.src);
        const blob = await response.blob();
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `qr-code.${format}`;
        downloadLink.click();
        
        URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
        showError('Failed to download QR code');
    }
}

// Handle form submission
document.getElementById('qrForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    generateQRCode();
});

// Handle download button click
document.getElementById('downloadQR')?.addEventListener('click', downloadQRCode);

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
    // If URL ID is provided in query parameters, hide the URL input
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('url');
    
    if (urlId) {
        const urlInput = document.getElementById('url');
        if (urlInput) {
            urlInput.style.display = 'none';
            generateQRCode();
        }
    }
});