function previewLogo() {
    const logoInput = document.getElementById('logoInput').files[0];
    if (logoInput) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.src = e.target.result;
            logoPreview.style.display = 'block';
        };
        reader.readAsDataURL(logoInput);
    }
}

function updateColorPreview(colorInputId) {
    const colorValue = document.getElementById(colorInputId).value;
    document.getElementById(`${colorInputId}Preview`).style.backgroundColor = colorValue;
}

// ✅ Default values to avoid regenerating QR Code unnecessarily
let selectedLogoPosition = "center";
let lastGeneratedQrCode = null;  // ✅ Store the last generated QR code
let lastLogoUrl = null;          // ✅ Store the last logo URL for re-use

// ✅ Set logo position without regenerating the QR code
function setLogoPosition(position, event) {
    event.preventDefault(); // Prevent the form from clearing
    selectedLogoPosition = position;

    // Remove active class from all buttons and apply it only to the selected one
    document.querySelectorAll('.position-btn').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.position-btn[value="${position}"]`).classList.add('active');

    // ✅ Update the logo position only if a QR code has already been generated
    if (lastGeneratedQrCode) {
        updateLogoPositionOnly();
    }
}

// ✅ Generate QR Code and store the generated image
async function generateQRCode() {
    const url = document.getElementById('url').value;
    const logoInput = document.getElementById('logoInput').files[0];
    const darkColor = document.getElementById('darkColor').value;
    const lightColor = document.getElementById('lightColor').value;

    // ✅ Capturing the logo position
    const logoPosition = selectedLogoPosition;

    if (!url) {
        alert("Please enter a valid URL.");
        return;
    }

    if (logoInput) {
        const reader = new FileReader();
        reader.onloadend = async function () {
            lastLogoUrl = reader.result;  // ✅ Save logo for re-use
            await sendToServer(url, lastLogoUrl, darkColor, lightColor, logoPosition);
        };
        reader.readAsDataURL(logoInput);
    } else {
        lastLogoUrl = null;
        await sendToServer(url, null, darkColor, lightColor, logoPosition);
    }
}

// ✅ Only update the logo position without regenerating QR code
async function updateLogoPositionOnly() {
    const qrImage = document.getElementById('qrImage');

    try {
        const response = await fetch('/.netlify/functions/generate_qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: document.getElementById('url').value,
                logoUrl: lastLogoUrl,
                darkColor: document.getElementById('darkColor').value,
                lightColor: document.getElementById('lightColor').value,
                logoPosition: selectedLogoPosition
            })
        });

        const result = await response.json();
        if (response.ok) {
            qrImage.src = result.qr_code;
            lastGeneratedQrCode = result.qr_code;  // ✅ Save the updated QR code
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert('An error occurred: ' + error.toString());
    }
}

// ✅ Send the QR code data to the server
async function sendToServer(url, logoUrl, darkColor, lightColor, logoPosition) {
    try {
        const response = await fetch('/.netlify/functions/generate_qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, logoUrl, darkColor, lightColor, logoPosition })
        });

        const result = await response.json();
        if (response.ok) {
            const qrImage = document.getElementById('qrImage');
            qrImage.src = result.qr_code;
            qrImage.style.display = 'block';

            // ✅ Store the generated QR code for future use
            lastGeneratedQrCode = result.qr_code;

            enableDownloads(result.qr_code);
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert('An error occurred: ' + error.toString());
    }
}

// ✅ Enable download buttons for the QR Code
function enableDownloads(qrCodeData) {
    const downloadButtons = document.querySelector('.download-buttons');

    document.getElementById('downloadPng').href = qrCodeData;
    document.getElementById('downloadJpg').href = qrCodeData.replace("image/png", "image/jpeg");
    document.getElementById('downloadPdf').href = qrCodeData;

    // ✅ Now making sure the download buttons appear
    downloadButtons.style.display = 'flex';
}
