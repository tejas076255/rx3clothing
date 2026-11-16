// Bundled fallback copy of the backend catalog (backend/catalog.py).
// Used only when the API is unreachable, so the store never looks broken.
export const FALLBACK_PRODUCTS = [
  {
    "id": 1,
    "name": "Classic Oxford Formal Shirt",
    "category": "Men",
    "type": "Formal Shirt",
    "price": 899,
    "mrp": 1699,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "White",
      "Sky Blue",
      "Light Pink"
    ],
    "rating": 4.6,
    "reviews": 2314,
    "description": "Our signature Oxford weave formal shirt with a structured collar and single-needle stitching. Wrinkle-resistant finish keeps it boardroom-sharp all day.",
    "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop",
    "featured": true,
    "bestseller": true
  },
  {
    "id": 2,
    "name": "Slim Fit Checked Casual Shirt",
    "category": "Men",
    "type": "Casual Shirt",
    "price": 949,
    "mrp": 1799,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "Red Check",
      "Blue Check",
      "Green Check"
    ],
    "rating": 4.3,
    "reviews": 1689,
    "description": "Yarn-dyed cotton checks with a button-down collar and curved hem. Pre-washed for zero shrinkage — weekends, sorted.",
    "image": "https://images.unsplash.com/photo-1698857494817-d244cb4231a8?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": true
  },
  {
    "id": 3,
    "name": "Premium Linen Casual Shirt",
    "category": "Men",
    "type": "Linen Shirt",
    "price": 1199,
    "mrp": 2199,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "White",
      "Beige",
      "Olive"
    ],
    "rating": 4.7,
    "reviews": 942,
    "description": "Airy European flax linen with a relaxed camp collar. The shirt Ahmedabad summers were made for — breathable, light and effortlessly sharp.",
    "image": "https://images.unsplash.com/photo-1740711152088-88a009e877bb?q=80&w=800&auto=format&fit=crop",
    "featured": true,
    "bestseller": false
  },
  {
    "id": 4,
    "name": "Striped Slim Formal Shirt",
    "category": "Men",
    "type": "Formal Shirt",
    "price": 999,
    "mrp": 1899,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "Blue Stripe",
      "Grey Stripe"
    ],
    "rating": 4.4,
    "reviews": 1204,
    "description": "Fine Bengal stripes on breathable cotton twill, cut slim through the body with a cutaway collar that sits perfectly with or without a tie.",
    "image": "https://images.unsplash.com/photo-1629871870289-21efd577d820?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": false
  },
  {
    "id": 5,
    "name": "Denim Casual Shirt",
    "category": "Men",
    "type": "Denim Shirt",
    "price": 1099,
    "mrp": 1999,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "Indigo",
      "Light Blue"
    ],
    "rating": 4.5,
    "reviews": 833,
    "description": "Mid-weight denim shirt with snap buttons and twin chest pockets. Fades beautifully with every wash and pairs with everything you own.",
    "image": "https://images.unsplash.com/photo-1791579521894-61c00d3b8bfe?q=80&w=800&auto=format&fit=crop",
    "featured": true,
    "bestseller": false
  },
  {
    "id": 6,
    "name": "Solid Satin Party Shirt",
    "category": "Men",
    "type": "Party Shirt",
    "price": 1299,
    "mrp": 2399,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "Maroon",
      "Black",
      "Royal Blue"
    ],
    "rating": 4.5,
    "reviews": 517,
    "description": "A rich satin-finish shirt with a subtle sheen made for sangeets, receptions and big nights out. Tailored fit, premium buttons, zero creasing.",
    "image": "https://images.unsplash.com/photo-1627798390269-219397e8d143?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": false
  },
  {
    "id": 7,
    "name": "Cotton Twill Utility Shirt",
    "category": "Men",
    "type": "Casual Shirt",
    "price": 799,
    "mrp": 1499,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "Khaki",
      "Olive",
      "Navy"
    ],
    "rating": 4.2,
    "reviews": 689,
    "description": "Hard-wearing cotton twill with reinforced elbows and two flap pockets. Built for long days on site, styled for everywhere after.",
    "image": "https://images.unsplash.com/photo-1779029061574-f2bb57af0747?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": false
  },
  {
    "id": 8,
    "name": "Micro-Print Festive Shirt",
    "category": "Men",
    "type": "Festive Shirt",
    "price": 1149,
    "mrp": 2099,
    "sizes": [
      "38",
      "40",
      "42",
      "44",
      "46"
    ],
    "colors": [
      "Ivory Print",
      "Teal Print"
    ],
    "rating": 4.6,
    "reviews": 764,
    "description": "A festive micro-print on soft cambric cotton — traditional motifs, modern slim cut. Made for poojas, family photos and wedding season.",
    "image": "https://images.unsplash.com/photo-1511039912745-8bfa0bc56aeb?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": true
  },
  {
    "id": 9,
    "name": "Boys Checked Party Shirt",
    "category": "Boys",
    "type": "Party Shirt",
    "price": 599,
    "mrp": 1099,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y",
      "8-9Y",
      "10-11Y",
      "12-13Y"
    ],
    "colors": [
      "Red Check",
      "Blue Check"
    ],
    "rating": 4.5,
    "reviews": 932,
    "description": "A smart checked shirt with a button-down collar and easy-care finish. Birthday-party ready and tough enough for the playground after.",
    "image": "https://images.unsplash.com/photo-1586537182864-75d5ea8a0e3d?q=80&w=800&auto=format&fit=crop",
    "featured": true,
    "bestseller": true
  },
  {
    "id": 10,
    "name": "Boys Classic School Shirt",
    "category": "Boys",
    "type": "School Shirt",
    "price": 449,
    "mrp": 849,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y",
      "8-9Y",
      "10-11Y",
      "12-13Y"
    ],
    "colors": [
      "White",
      "Sky Blue"
    ],
    "rating": 4.6,
    "reviews": 1541,
    "description": "Crisp poly-cotton school shirt that stays white wash after wash. Reinforced collar, smooth buttons and a comfortable regular fit for all-day classes.",
    "image": "https://images.unsplash.com/photo-1547082661-71362fc3969c?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": true
  },
  {
    "id": 11,
    "name": "Boys Denim Shirt",
    "category": "Boys",
    "type": "Denim Shirt",
    "price": 649,
    "mrp": 1199,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y",
      "8-9Y",
      "10-11Y"
    ],
    "colors": [
      "Indigo"
    ],
    "rating": 4.4,
    "reviews": 421,
    "description": "A mini version of our best-selling denim shirt — soft washed denim, snap buttons little fingers can manage, and double-stitched seams.",
    "image": "https://images.unsplash.com/photo-1625248730675-ae830b3d955d?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": false
  },
  {
    "id": 12,
    "name": "Boys Festive Kurta-Style Shirt",
    "category": "Boys",
    "type": "Festive Shirt",
    "price": 699,
    "mrp": 1299,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y",
      "8-9Y",
      "10-11Y",
      "12-13Y"
    ],
    "colors": [
      "Mustard",
      "Maroon"
    ],
    "rating": 4.7,
    "reviews": 558,
    "description": "A kurta-style festive shirt with a mandarin collar and wooden buttons. Dressy enough for Diwali, comfy enough that he will not want to take it off.",
    "image": "https://images.unsplash.com/photo-1774438026136-9736ec28922a?q=80&w=800&auto=format&fit=crop",
    "featured": true,
    "bestseller": false
  },
  {
    "id": 13,
    "name": "Boys Striped Casual Shirt",
    "category": "Boys",
    "type": "Casual Shirt",
    "price": 549,
    "mrp": 999,
    "sizes": [
      "2-3Y",
      "4-5Y",
      "6-7Y",
      "8-9Y",
      "10-11Y"
    ],
    "colors": [
      "Blue Stripe",
      "Green Stripe"
    ],
    "rating": 4.3,
    "reviews": 296,
    "description": "Breezy striped cotton shirt with a chest pocket for treasures. Pre-washed so it comes out of the packet soft, not scratchy.",
    "image": "https://images.unsplash.com/photo-1627639679638-8485316a4b21?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": false
  },
  {
    "id": 14,
    "name": "Boys Solid Formal Shirt",
    "category": "Boys",
    "type": "Formal Shirt",
    "price": 579,
    "mrp": 1049,
    "sizes": [
      "4-5Y",
      "6-7Y",
      "8-9Y",
      "10-11Y",
      "12-13Y"
    ],
    "colors": [
      "White",
      "Peach"
    ],
    "rating": 4.4,
    "reviews": 388,
    "description": "A crisp solid formal shirt for weddings, annual days and family functions. Pairs perfectly with trousers or a little Nehru jacket.",
    "image": "https://images.unsplash.com/photo-1727798450911-4f99a48cd03b?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": false
  },
  {
    "id": 15,
    "name": "New Born Soft Cotton Shirt",
    "category": "New Born",
    "type": "Baby Shirt",
    "price": 349,
    "mrp": 649,
    "sizes": [
      "0-3M",
      "3-6M",
      "6-12M"
    ],
    "colors": [
      "White",
      "Baby Pink",
      "Baby Blue"
    ],
    "rating": 4.8,
    "reviews": 1204,
    "description": "Feather-soft combed cotton shirt with nickel-free snap buttons and flat seams that never rub delicate skin. Gentle from the very first wear.",
    "image": "https://images.unsplash.com/photo-1582212742235-a2500f31cb39?q=80&w=800&auto=format&fit=crop",
    "featured": true,
    "bestseller": true
  },
  {
    "id": 16,
    "name": "New Born Printed Shirt & Shorts Set",
    "category": "New Born",
    "type": "Shirt Set",
    "price": 499,
    "mrp": 899,
    "sizes": [
      "0-3M",
      "3-6M",
      "6-12M"
    ],
    "colors": [
      "Mint Print",
      "Peach Print"
    ],
    "rating": 4.7,
    "reviews": 845,
    "description": "A two-piece set — printed cotton shirt with matching elastic-waist shorts. Skin-safe dyes, easy nappy-change access, endless photo cuteness.",
    "image": "https://images.unsplash.com/photo-1777397660834-67c6d0eabe15?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": true
  },
  {
    "id": 17,
    "name": "New Born Muslin Jhabla Shirt",
    "category": "New Born",
    "type": "Jhabla Shirt",
    "price": 299,
    "mrp": 549,
    "sizes": [
      "0-3M",
      "3-6M",
      "6-12M"
    ],
    "colors": [
      "Ivory",
      "Yellow"
    ],
    "rating": 4.8,
    "reviews": 663,
    "description": "Traditional front-tie jhabla in double-layer muslin that gets softer with every wash. Breathable, airy and perfect for Indian summers.",
    "image": "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=800&auto=format&fit=crop",
    "featured": true,
    "bestseller": false
  },
  {
    "id": 18,
    "name": "New Born Festive Shirt Set",
    "category": "New Born",
    "type": "Festive Set",
    "price": 549,
    "mrp": 999,
    "sizes": [
      "0-3M",
      "3-6M",
      "6-12M"
    ],
    "colors": [
      "Cream",
      "Light Green"
    ],
    "rating": 4.6,
    "reviews": 432,
    "description": "Baby's first festive outfit — a soft cotton shirt with delicate embroidery and matching bottoms. Made for naming ceremonies and first celebrations.",
    "image": "https://images.unsplash.com/photo-1561987619-06c885c7bd45?q=80&w=800&auto=format&fit=crop",
    "featured": false,
    "bestseller": false
  }
];
