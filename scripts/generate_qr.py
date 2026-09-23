"""
SETU Permanent QR Code Generator
Generates permanent, non-expiring static QR codes with Error Correction Level H (30%).
Directly encodes raw URLs into the QR matrix (zero third-party redirects or trackers).
"""

import sys
import os
import qrcode
import qrcode.image.svg

DEFAULT_RENDER_URL = "https://setu-crime-analysis.onrender.com"

def generate_qr(url: str, output_prefix: str = "setu_qr_code"):
    print(f"Generating permanent QR code for: {url}")

    # 1. Generate High-Resolution PNG with Level H error correction (30% recovery)
    qr = qrcode.QRCode(
        version=None, # Automatically determine smallest version
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=20, # Crisp 20px per module
        border=4,    # Standard quiet zone
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Clean styling: dark navy on pure white for max contrast / scannability
    img = qr.make_image(fill_color="#0B0F17", back_color="#FFFFFF")
    
    png_filename = f"{output_prefix}.png"
    img.save(png_filename)
    print(f"[OK] Saved PNG: {png_filename} ({img.pixel_size}px)")

    # 2. Generate Vector SVG (Infinitely scalable for flex banners / print posters)
    factory = qrcode.image.svg.SvgPathImage
    svg_img = qrcode.make(
        url,
        image_factory=factory,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=20,
        border=4
    )
    svg_filename = f"{output_prefix}.svg"
    svg_img.save(svg_filename)
    print(f"[OK] Saved SVG: {svg_filename}")

    return png_filename, svg_filename

if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_RENDER_URL
    
    # Save in root
    generate_qr(target_url, "SETU_RENDER_QR")
    
    # Also save in public/ so it can be viewed or downloaded from the web app
    os.makedirs("public", exist_ok=True)
    generate_qr(target_url, os.path.join("public", "setu_render_qr"))
