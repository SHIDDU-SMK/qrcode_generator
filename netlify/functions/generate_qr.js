import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

export default async (request, context) => {
    try {
        const { url, logoUrl, darkColor, lightColor } = await request.json();  // Added color inputs

        if (!url) {
            return new Response(JSON.stringify({ error: "URL is required!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Generate the QR Code on a canvas
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext('2d');

        await QRCode.toCanvas(canvas, url, {
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
                const logoSize = canvas.width * 0.2;
                const logoX = (canvas.width - logoSize) / 2;
                const logoY = (canvas.height - logoSize) / 2;
                
                ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            } catch (logoError) {
                return new Response(JSON.stringify({ error: "Failed to load the logo image." }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // Convert the canvas to a base64 image
        const qrCodeData = canvas.toDataURL('image/png');

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
