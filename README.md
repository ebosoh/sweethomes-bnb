# sweethomes-bnb - Premium Accommodation Booking Website

A high-conversion, mobile-first accommodation booking website built with HTML, CSS, and JavaScript. Designed for deployment on GitHub Pages with Google Apps Script backend integration.

## 🌟 Features

- **Premium Design**: Modern, warm, and trustworthy aesthetic with brand colors
- **Mobile-First**: Optimized for mobile devices with touch-friendly interactions
- **Touch-Enabled Carousel**: Swipe-friendly property image gallery with auto-scroll
- **Smart Booking Form**: Comprehensive form with date validation and user-friendly UX
- **Responsive Layout**: Seamless experience across all devices (mobile, tablet, desktop)
- **SEO Optimized**: Proper meta tags, semantic HTML, and accessibility features
- **WhatsApp Integration**: Click-to-chat floating button
- **Social Media Ready**: Integrated social media icons and sharing capabilities

## 🎨 Brand Identity

- **Primary Color**: `#0a2341` (Deep premium blue)
- **Accent Color**: `#cb9f34` (Luxury gold)
- **Soft Accent**: `#bad6e2`
- **Background**: `#ecf3fb`
- **Fonts**: Inter (body), Outfit (headings)

## 📋 Room Types & Pricing

- **1 Bedroom** - Max 2 guests - KES 3,000/night
- **2 Bedroom** - Max 4 guests - KES 5,000/night
- **3 Bedroom** - Max 6 guests - KES 8,000/night

**Payment Terms**: 50% on booking, balance on arrival (M-Pesa only)

## 🏗️ Project Structure

```
sweethomes-bnb/
├── index.html          # Main homepage
├── styles.css          # Complete CSS design system
├── script.js           # JavaScript functionality
├── rules.html          # Apartment rules page (to be created)
├── checkout.html       # Check-out procedure page (to be created)
├── images/             # Property images folder
│   ├── property-1.jpg
│   ├── property-2.jpg
│   └── property-3.jpg
├── logo.png           # Site logo
├── favicon.png        # Browser favicon
└── README.md          # This file
```

## 🚀 Deployment to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `sweethomes-bnb` (or your preferred name)
3. Make it public
4. Don't initialize with README (we already have one)

### Step 2: Push Code to GitHub

```bash
# Navigate to project directory
cd c:\Users\USER\.gemini\antigravity\playground\dynamic-omega\sweethomes-bnb

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: sweethomes-bnb booking website"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sweethomes-bnb.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select `main` branch
5. Click **Save**
6. Your site will be published at: `https://YOUR_USERNAME.github.io/sweethomes-bnb`

## 📝 Configuration Required

### 1. Add Your Logo and Images

- Replace `logo.png` with your actual logo
- Add property images to the `images/` folder:
  - `property-1.jpg`
  - `property-2.jpg`
  - `property-3.jpg`
  - (Add more as needed)

### 2. Update Social Media Links

In `script.js`, update the social media URLs (around line 290):

```javascript
const socialLinks = [
  { icon: '📘', url: 'https://facebook.com/YOUR_PAGE', label: 'Facebook' },
  { icon: '📷', url: 'https://instagram.com/YOUR_HANDLE', label: 'Instagram' },
  { icon: '🐦', url: 'https://twitter.com/YOUR_HANDLE', label: 'Twitter' },
];
```

### 3. Update Open Graph Meta Tags

In `index.html`, update the Open Graph URL and image (lines 14-17):

```html
<meta property="og:url" content="https://YOUR_USERNAME.github.io/sweethomes-bnb">
<meta property="og:image" content="https://YOUR_USERNAME.github.io/sweethomes-bnb/images/og-image.jpg">
```

## 🔧 Google Apps Script Integration (Backend)

The booking form is ready for Google Apps Script integration. You'll need to:

1. Create a Google Apps Script project
2. Set up functions to:
   - Receive booking data
   - Create Google Calendar events
   - Send email notifications
3. Deploy as web app and get the URL
4. Update `script.js` line 210 with your Apps Script URL

**Detailed backend setup will be covered in Stage 5.**

## 🎯 Next Stages

- **Stage 2**: Homepage core components (logo animation, carousel images)
- **Stage 3**: Booking form calendar enhancements
- **Stage 4**: Rules & policies pages
- **Stage 5**: Backend integration (Google Apps Script)
- **Stage 6**: Social & polish
- **Stage 7**: Testing & deployment

## 📱 Contact Information

- **Phone**: +254 780 898 927 / 0780 898 927
- **WhatsApp**: Click the floating button on the website

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: GitHub Pages (static site)
- **Backend**: Google Apps Script (for bookings, calendar, emails)
- **Fonts**: Google Fonts (Inter, Outfit)

## ✨ Key Features Implemented

- ✅ Mobile-first responsive design
- ✅ Touch-friendly carousel with swipe support
- ✅ Auto-scrolling image gallery
- ✅ Form validation with date checking
- ✅ Smooth scroll navigation
- ✅ Sticky "Book Now" button (mobile)
- ✅ WhatsApp click-to-chat
- ✅ SEO optimization
- ✅ Accessibility features
- ✅ Premium animations and transitions

## 📄 License

© 2026 sweethomes-bnb. All rights reserved.

---

**Built with ❤️ for premium accommodation experiences**
