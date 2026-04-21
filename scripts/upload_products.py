"""
Upload Amazon product data to Supabase + images to Cloudflare R2
Run: python scripts/upload_products.py
"""
import json
import os
import sys
import urllib.request
import boto3
from botocore.config import Config

# ── Config ──────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://olgfqcygqzuevaftmdja.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY"

R2_ACCOUNT_ID   = "815cda625ddb970b925d0a2c77fc2309"
R2_ACCESS_KEY   = "cd8bce93fd8165f8d04da37ed1615164"
R2_SECRET_KEY   = "b7a62e14db5efd56e82cb65daf499207bab0241aa7831edc62e5327d6a4b5922"
R2_BUCKET       = "clowand-images"
R2_PUBLIC_URL   = "https://pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev"
R2_ENDPOINT     = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# Product data based on amazon_products.json (clowand brand, indie-site pricing)
PRODUCTS = [
    {
        "asin": "B0FH8XGG56",
        "name": "Clowand Disposable Toilet Brush - 48 Refills Auto Lid Kit",
        "price": 19.99,
        "description": "Premium disposable toilet brush with automatic lid-opening mechanism and 48 pre-loaded refill pads. One-click attach and release — your hands never touch dirty water. 48 refills included for nearly a full year of supply. Superior-quality materials ensure durability and deep cleaning performance.",
        "bullets": [
            "PREMIUM QUALITY: Superior-quality materials ensure practical, long-lasting performance",
            "AUTO LID MECHANISM: One-click attach & release — zero hand contact with dirty surfaces",
            "48 REFILLS INCLUDED: Nearly 1 year of supply when cleaning weekly",
            "EASY TO USE: Clip refill, scrub, toss — no washing, no dripping",
            "UNIQUE DESIGN: Budget-friendly yet professional-grade toilet cleaning"
        ],
        "stock": 999,
        "status": "active",
        "images": [
            "https://m.media-amazon.com/images/I/41PtXXdyndL.jpg",
            "https://m.media-amazon.com/images/I/41mrOqiBAqL.jpg",
            "https://m.media-amazon.com/images/I/31DoRLrThvL.jpg"
        ],
        "rating": 4.1,
        "review_count": 343,
        "tag": "Auto Lid Design",
        "popular": False,
    },
    {
        "asin": "B0FGV9BBFH",
        "name": "Clowand Toilet Wand Starter Kit - Wall Mounted, 48 Refills (White)",
        "price": 24.99,
        "description": "Wall-mounted disposable toilet brush system with 48 pre-loaded sponge refills. Drill-free installation with waterproof adhesive. Soft sponge head won't scratch toilet glaze. 360° comprehensive cleaning reaches every corner. Perfect for renters and families.",
        "bullets": [
            "MESS-FREE & TOSS-AFTER-USE: One-click detach — discard sponge without touching it",
            "DRILL-FREE WALL MOUNT: Waterproof adhesive sticker, installs in seconds, no tools needed",
            "GENTLE ON GLAZE: Soft sponge head protects toilet surface, safe for elderly users",
            "48 REFILLS = 1-YEAR SUPPLY: Pre-loaded with fresh-scent cleaning fluid, just add water",
            "360° DEEP CLEAN: Flexible head reaches under rim and all hard-to-clean corners"
        ],
        "stock": 999,
        "status": "active",
        "images": [
            "https://m.media-amazon.com/images/I/31vW92SG49L.jpg",
            "https://m.media-amazon.com/images/I/31f-bvkg7RL.jpg",
            "https://m.media-amazon.com/images/I/41Gr995sJGL.jpg"
        ],
        "rating": 4.6,
        "review_count": 343,
        "tag": "Best Seller",
        "popular": True,
    },
]

# ── R2 Client ────────────────────────────────────────────────────────────────
s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="auto",
)

def upload_image_to_r2(image_url, key):
    """Download from URL and upload to R2, return public URL."""
    print(f"  Downloading: {image_url}")
    req = urllib.request.Request(image_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = resp.read()
    content_type = "image/jpeg"
    s3.put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=data,
        ContentType=content_type,
        CacheControl="public, max-age=31536000",
    )
    public = f"{R2_PUBLIC_URL}/{key}"
    print(f"  Uploaded -> {public}")
    return public

# ── Supabase REST ─────────────────────────────────────────────────────────────
import urllib.parse

def supabase_upsert(table, payload):
    """Upsert a row via Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict=asin&columns=asin,name,price,description,image_url,extra_images,bullets,stock,status,rating,review_count,tag,popular"
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read()
            print(f"  Supabase upsert OK: {resp.status}")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read()
        print(f"  Supabase ERROR {e.code}: {body.decode()}")
        return None

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    for p in PRODUCTS:
        print(f"\n{'='*60}")
        print(f"Processing: {p['name']}")
        print(f"{'='*60}")

        # Upload primary image to R2
        primary_img_url = p["images"][0]
        r2_key = f"products/{p['asin']}/main.jpg"
        try:
            r2_url = upload_image_to_r2(primary_img_url, r2_key)
        except Exception as ex:
            print(f"  Image upload failed: {ex}, using Amazon URL as fallback")
            r2_url = primary_img_url

        # Upload extra images
        extra_urls = []
        for idx, img_url in enumerate(p["images"][1:], start=2):
            try:
                key = f"products/{p['asin']}/img{idx}.jpg"
                url = upload_image_to_r2(img_url, key)
                extra_urls.append(url)
            except Exception as ex:
                print(f"  Extra image {idx} failed: {ex}")
                extra_urls.append(img_url)

        # Compose all image URLs as JSON array string for extra_images column
        all_images = [r2_url] + extra_urls

        # Upsert into Supabase products table
        row = {
            "asin": p["asin"],
            "name": p["name"],
            "price": p["price"],
            "description": p["description"],
            "image_url": r2_url,
            "extra_images": json.dumps(all_images),
            "bullets": json.dumps(p["bullets"]),
            "stock": p["stock"],
            "status": p["status"],
            "rating": p["rating"],
            "review_count": p["review_count"],
            "tag": p["tag"],
            "popular": p["popular"],
        }
        supabase_upsert("products", row)

    print("\n\nDone! Both products uploaded.")

if __name__ == "__main__":
    main()
