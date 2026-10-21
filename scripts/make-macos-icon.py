#!/usr/bin/env python3
"""Build assets/icons/sheriff-badge-msi.icns from the badge artwork.

macOS app icons use the .icns format, and the packager picks up a .icns that sits next to
the configured .ico (same file name). This script exists so the icon can be regenerated
without a Mac; on macOS, `iconutil` does the same job.

The source file is named .ico but is a single transparent PNG, not a multi-size Windows icon.
It is not square, so it is centered on a transparent 1024x1024 canvas with a margin first.

Requires: python3 and ImageMagick (`magick`).
Usage:    python3 scripts/make-macos-icon.py
"""

import struct
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/icons/sheriff-badge-msi.ico"
OUTPUT = ROOT / "assets/icons/sheriff-badge-msi.icns"

CANVAS = 1024
ARTWORK_HEIGHT = 900  # leaves a margin, like other macOS icons

# icns chunk type -> pixel size. These are the ten images `iconutil` writes for a
# standard iconset (16, 32, 128, 256 and 512 points, each at 1x and 2x).
CHUNKS = [
    ("icp4", 16),
    ("ic11", 32),  # 16@2x
    ("icp5", 32),
    ("ic12", 64),  # 32@2x
    ("ic07", 128),
    ("ic13", 256),  # 128@2x
    ("ic08", 256),
    ("ic14", 512),  # 256@2x
    ("ic09", 512),
    ("ic10", 1024),  # 512@2x
]


def magick(*args: str) -> None:
    subprocess.run(["magick", *args], check=True)


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        master = Path(tmp) / "master.png"
        magick(
            str(SOURCE),
            "-resize", f"x{ARTWORK_HEIGHT}",
            "-background", "none",
            "-gravity", "center",
            "-extent", f"{CANVAS}x{CANVAS}",
            str(master),
        )

        body = b""
        for chunk_type, size in CHUNKS:
            png = Path(tmp) / f"{size}.png"
            magick(str(master), "-resize", f"{size}x{size}", str(png))
            data = png.read_bytes()
            body += chunk_type.encode("ascii") + struct.pack(">I", len(data) + 8) + data

    OUTPUT.write_bytes(b"icns" + struct.pack(">I", len(body) + 8) + body)
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
