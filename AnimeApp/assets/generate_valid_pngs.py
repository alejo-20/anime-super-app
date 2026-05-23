#!/usr/bin/env python3
"""Generate valid PNG files with proper dimensions for Expo web export"""
import os
import struct
import zlib

def create_minimal_png(filepath, width, height, color_r=26, color_g=26, color_b=46):
    """
    Create a minimal but valid PNG file with proper IHDR, data, and IEND chunks.
    Creates a solid color PNG.
    """
    # PNG signature
    png_sig = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk (13 bytes of data)
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk (image data)
    # Create a simple scanline: filter byte (0) + RGB pixels for the color
    scanline = bytes([0]) + bytes([color_r, color_g, color_b]) * width
    raw_data = scanline * height
    compressed = zlib.compress(raw_data, 9)
    
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    idat_chunk = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk (empty)
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    # Combine all chunks
    png_data = png_sig + ihdr_chunk + idat_chunk + iend_chunk
    
    # Write to file
    with open(filepath, 'wb') as f:
        f.write(png_data)
    
    print(f"Created {filepath} ({width}x{height}, size: {len(png_data)} bytes)")

# Get the directory of this script
asset_dir = os.path.dirname(os.path.abspath(__file__))

# Create PNG assets with appropriate dimensions
print("Generating valid PNG files for Expo...")
create_minimal_png(os.path.join(asset_dir, 'icon.png'), 1024, 1024)
create_minimal_png(os.path.join(asset_dir, 'adaptive-icon.png'), 1024, 1024)
create_minimal_png(os.path.join(asset_dir, 'favicon.png'), 256, 256)
create_minimal_png(os.path.join(asset_dir, 'splash.png'), 1242, 2436)

print("\nAll PNG assets created successfully!")
