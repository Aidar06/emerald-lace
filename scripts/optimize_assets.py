from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "dist" / "assets"
targets = {
    "envelope-closed.png": (1080, 84),
    "hero-chandelier.png": (1280, 82),
    "couple-close.png": (900, 82),
    "couple-walk.png": (900, 82),
}
for name, (width, quality) in targets.items():
    source = root / name
    with Image.open(source) as image:
        if image.width > width:
            height = round(image.height * width / image.width)
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(source.with_suffix('.webp'), 'WEBP', quality=quality, method=6)
        print(source.with_suffix('.webp').name, source.with_suffix('.webp').stat().st_size)
