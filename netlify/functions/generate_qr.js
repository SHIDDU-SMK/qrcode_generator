import QRCode from 'qrcode';

export default async (request, context) => {
    try {
        const { url } = await request.json();  // Read the request body

        if (!url) {
            return new Response("URL is required!", { status: 400 });
        }

        // Generate the QR Code (Base64)
        const qrCodeData = await QRCode.toDataURL(url);

        // Return the QR Code as a JSON response
        return new Response(JSON.stringify({ qr_code: qrCodeData }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",  // CORS support
            }
        });
    } catch (error) {
        return new Response(`Error: ${error.toString()}`, { status: 500 });
    }
};
