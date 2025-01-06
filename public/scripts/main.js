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

async function generateQRCode() {
    const url = document.getElementById('url').value;
    const logoInput = document.getElementById('logoInput').files[0];
    const darkColor = document.getElementById('darkColor').value;
    const lightColor = document.getElementById('lightColor').value;

    // ✅ Capturing the logo position here
    const logoPosition = document.getElementById('logoPosition').value;

    if (!url) {
        alert("Please enter a valid URL.");
        return;
    }

    let logoUrl = null;

    if (logoInput) {
        const reader = new FileReader();
        reader.onloadend = async function () {
            logoUrl = reader.result;
            await sendToServer(url, logoUrl, darkColor, lightColor, logoPosition);
        };
        reader.readAsDataURL(logoInput);
    } else {
        await sendToServer(url, null, darkColor, lightColor, logoPosition);
    }
}


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

            enableDownloads(result.qr_code);
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert('An error occurred: ' + error.toString());
    }
}

function enableDownloads(qrCodeData) {
    const downloadButtons = document.querySelector('.download-buttons');

    document.getElementById('downloadPng').href = qrCodeData;
    document.getElementById('downloadJpg').href = qrCodeData.replace("image/png", "image/jpeg");
    document.getElementById('downloadPdf').href = qrCodeData;

    // ✅ Now making sure the download buttons appear
    downloadButtons.style.display = 'flex';
}