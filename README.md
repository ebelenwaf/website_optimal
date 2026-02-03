# Optimal Healthcare Services LLC — Website (Static)

A modern, responsive, and professional marketing website for **Optimal Healthcare Services LLC**, built with **HTML + CSS + JavaScript**.  
Designed to showcase services, providers, benefits, and contact information with a polished UI and smooth interactivity.

---

## ✨ Features

- **Fully responsive** (mobile/tablet/desktop)
- **Sticky header** with reliable active-section highlighting (scrollspy)
- **Services section** with search + category filters + “Learn more” modal details
- **Provider bios** with “Read full bio” modal + highlights list
- **Testimonials** with auto-rotation and transitions
- **FAQ accordion**
- **Contact form UI** with validation + toast notifications  
  > Note: Form submission requires a backend service (Formspree/Netlify Forms/etc.)
- **Performance-friendly animations** with `prefers-reduced-motion` support

---

## 🧱 Tech Stack

- HTML5
- CSS3 (responsive grid, modern UI styles)
- Vanilla JavaScript (no frameworks)

---

## 📁 Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
└── assets/
    ├── hero-team.jpg
    ├── about-primary.jpg
    ├── about-psychiatry.jpg
    ├── abu.jpg
    └── zainab.jpg
```

> Your `assets/` folder may contain different filenames depending on your images.

---

## 🚀 Getting Started (Local)

### Option 1 — Open directly
You can open `index.html` in a browser.

### Option 2 — Use a local server (recommended)
Some browser features behave better with a local server.

**VS Code (Live Server Extension)**
1. Install the “Live Server” extension
2. Right-click `index.html` → **Open with Live Server**

**Python**
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🖼️ Using Your Own Images

1. Place your images in the `assets/` folder.
2. Update the `<img src="...">` paths in `index.html`, for example:
```html
<img src="assets/hero-team.jpg" alt="Team" />
```

### Cropping / Focus
Images use `object-fit: cover`, so they fill the frame cleanly.  
If a face is cropped, adjust the focal point in CSS:
```css
.visual-img img { object-position: center top; }
```

---

## 🌐 Deployment

This is a static site and can be hosted on:
- **Hostinger** (upload files to `public_html` + enable SSL)
- **Netlify / Cloudflare Pages / GitHub Pages**
- Any static hosting provider

---

## 🔧 Customization Notes

### Services
Services are displayed in the “Our Services” section.  
Clicking “Learn more” opens details from the `modalContent` object in `app.js`.

### Scheduling Link
Update the scheduling URL in `index.html`:
```html
href="https://YOUR-SCHEDULING-LINK"
```

### Contact Form
The contact form is currently UI-only. To make it send messages:
- Add Formspree / Netlify Forms / a custom backend
- Or route messages to an email service

---

## ♿ Accessibility

- Keyboard-accessible navigation
- Modal dialog behavior and click-outside closing
- `prefers-reduced-motion` respected for animations

---

## 📜 License

This project is provided for client use.  
If you want an open-source license (MIT, etc.), add a `LICENSE` file and update this section.

---

## 📩 Contact

For updates or improvements, open an issue or contact the project owner.
