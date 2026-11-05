from PIL import Image, ImageFilter
from collections import deque

img = Image.open("devika.jpg").convert("RGB")
w, h = img.size
px = img.load()

# Detect the background colour from the four corners
corners = [px[3, 3], px[w - 4, 3], px[3, h - 4], px[w - 4, h - 4]]
bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
print("Detected background colour:", bg)

TOL = 60  # raise if red edges remain, lower if your outline disappears

def is_bg(x, y):
    c = px[x, y]
    return sum((c[i] - bg[i]) ** 2 for i in range(3)) ** 0.5 < TOL

# Flood-fill from the edges to find the connected background
seen = bytearray(w * h)
q = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
while q:
    x, y = q.popleft()
    i = y * w + x
    if seen[i] or not is_bg(x, y):
        continue
    seen[i] = 1
    if x > 0: q.append((x - 1, y))
    if x < w - 1: q.append((x + 1, y))
    if y > 0: q.append((x, y - 1))
    if y < h - 1: q.append((x, y + 1))

# Build a transparency mask: background = transparent
mask = Image.new("L", (w, h), 255)
mp = mask.load()
for y in range(h):
    for x in range(w):
        if seen[y * w + x]:
            mp[x, y] = 0

# Soften the edge slightly so it doesn't look jagged
mask = mask.filter(ImageFilter.GaussianBlur(0.8))

out = img.convert("RGBA")
out.putalpha(mask)
out.save("devika.png")
print("Saved devika.png")