from PIL import Image

# Load the original image
original_image = Image.open("icon.png")

# Define the icon sizes you want
sizes = [16, 48, 128]

# Resize and save each icon
for size in sizes:
    resized = original_image.resize((size, size), Image.LANCZOS)
    resized.save(f"icon_{size}x{size}.png")

print("All icons generated!")
