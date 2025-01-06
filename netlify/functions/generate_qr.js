import QRCode from 'qrcode';
import { createCanvas, loadImage } from '@napi-rs/canvas';

export default async (request, context) => {
    try {
        const { url, logoUrl, darkColor, lightColor, logoPosition} = await request.json();  // Added color inputs

        if (!url) {
            return new Response(JSON.stringify({ error: "URL is required!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Generate the QR Code on a canvas
        const qrCanvas = createCanvas(500, 500);
        const ctx = qrCanvas.getContext('2d');

        await QRCode.toCanvas(qrCanvas, url, {
            errorCorrectionLevel: 'H',
            margin: 1,
            scale: 10,
            color: {
                dark: darkColor || "#000000",
                light: lightColor || "#FFFFFF"
            }
        });

        // If a logo is provided, overlay it on the QR code
        if (logoUrl) {
            try {
                const logo = await loadImage(logoUrl);
                const logoSize = qrCanvas.width * 0.2;
                let logoX, logoY;
                 // ✅ Adjust logo position based on selection
                switch (logoPosition) {
                    case 'top-left':
                        logoX = 10;
                        logoY = 10;
                        break;
                    case 'top-right':
                        logoX = qrCanvas.width - logoSize - 10;
                        logoY = 10;
                        break;
                    case 'bottom-left':
                        logoX = 10;
                        logoY = qrCanvas.height - logoSize - 10;
                        break;
                    case 'bottom-right':
                        logoX = qrCanvas.width - logoSize - 10;
                        logoY = qrCanvas.height - logoSize - 10;
                        break;
                    case 'top-center':
                        logoX = (qrCanvas.width - logoSize) / 2;
                        logoY = 10;
                        break;
                    case 'bottom-center':
                        logoX = (qrCanvas.width - logoSize) / 2;
                        logoY = qrCanvas.height - logoSize - 10;
                        break;
                    case 'left-center':
                        logoX = 10;
                        logoY = (qrCanvas.height - logoSize) / 2;
                        break;
                    case 'right-center':
                        logoX = qrCanvas.width - logoSize - 10;
                        logoY = (qrCanvas.height - logoSize) / 2;
                        break;
                    case 'center':
                    default:
                        logoX = (qrCanvas.width - logoSize) / 2;
                        logoY = (qrCanvas.height - logoSize) / 2;
                }
                
                ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            } catch (logoError) {
                console.log(logoError);
                return new Response(JSON.stringify({ error: "Failed to load the logo image." }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // Convert the canvas to a base64 image
        const qrCodeData = qrCanvas.toDataURL('image/png');

        return new Response(JSON.stringify({ qr_code: qrCodeData }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.toString() }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
