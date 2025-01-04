import json
import qrcode
from io import BytesIO
import base64

def handler(event, context):
    try:
        body = json.loads(event['body'])
        url = body.get('url', 'https://example.com')

        # Generate QR Code
        qr = qrcode.QRCode(
            version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to Base64
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.read()).decode()

        return {
            "statusCode": 200,
            "body": json.dumps({"qr_code": img_base64}),
            "headers": {"Content-Type": "application/json"}
        }
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}
