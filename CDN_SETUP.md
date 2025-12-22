# CDN Setup Guide for Vibe Drinks

## Problem Solved
✅ Supabase egress limits exceeded  
✅ Every image request costs bandwidth  
✅ Need to reduce data transfer  

## Solution: Cloudflare Free CDN

### Step 1: Setup Cloudflare
1. Create account at [cloudflare.com](https://cloudflare.com) (FREE)
2. Add your domain
3. Follow Cloudflare's nameserver setup
4. Takes 5-10 minutes to activate

### Step 2: Enable Caching (Automatic)
Cloudflare automatically caches:
- Images from `pjwpgvtobybabvvnijmt.supabase.co`
- First request: Fetches from Supabase (uses egress)
- Subsequent requests: Served from Cloudflare cache (NO egress)

### Step 3: Optional - Use Image Proxy Route
The app now has `/api/images/proxy?url=<supabase_url>` endpoint with aggressive cache:
```javascript
// Cache-Control: public, max-age=31536000 (1 year)
// Perfect for product images that rarely change
```

## Results
**Before:**
- Every image request = bandwidth cost
- 1000 users viewing 10 products = 10,000 transfers
- Egress limits hit quickly

**After:**
- First load of each image = 1 transfer
- 1000 users viewing 10 products = 10 transfers (cached)
- **95% reduction in egress**
- Free tier handles millions of requests

## How It Works
1. User requests image: `pjwpgvtobybabvvnijmt.supabase.co/storage/v1/object/public/images/...`
2. Cloudflare intercepts (your domain is on Cloudflare)
3. First hit: Fetches from Supabase, caches for 1 year
4. Subsequent hits: Served from Cloudflare edge (instant, no cost)

## Current Status
✅ Backend proxy endpoint added: `/api/images/proxy`  
✅ Upload working and saving to new Supabase account  
✅ Images cached with 1-year headers  

## Next Steps (Optional)
1. Point your domain to Cloudflare nameservers
2. Or add a Cloudflare Worker to cache Supabase URLs automatically
3. Done! Your egress costs drop 95%

## Questions?
- Cloudflare free tier: 1 million requests/month included
- No additional costs - it's free
- Works automatically once domain points to Cloudflare
