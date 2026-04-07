# Frontend - AI Image Editor

User interface for AI Image Editor application.

## Directory Structure

```
frontend/
├── index.html      # Main HTML structure
├── app.js          # JavaScript logic
├── styles.css      # Styling and animations
└── assets/         # Images, icons (if needed)
```

## Features

- **Upload Interface**: Drag-drop or click to upload
- **Image Preview**: Full image display with zoom
- **Prompt Input**: Textarea with helpful tips
- **Live Status**: Real-time AI provider display
- **Results Display**: Show edited image with actions
- **Download**: One-click download of results
- **Error Handling**: User-friendly error messages
- **Modals**: Help and About information
- **Responsive**: Mobile, tablet, desktop support

## Technology

- **Pure HTML/CSS/JavaScript**: No framework dependencies
- **Modern ES6+**: Async/await, arrow functions
- **Fetch API**: HTTP requests to backend
- **FileReader API**: Image preview
- **LocalStorage**: Optional history tracking

## Configuration

Update API endpoint if backend runs on different port:

```javascript
// In app.js, change fetch URLs:
fetch('http://localhost:3000/api/edit-image', ...)
```

## Customization

### Styling
Edit `styles.css` to change:
- Color scheme (CSS variables at top)
- Layout and spacing
- Animations
- Responsive breakpoints

### Functionality
Edit `app.js` to add:
- Additional validation
- Custom workflows
- Integration with other APIs
- Analytics tracking

## Running Standalone

Serve with any static file server:

```bash
# Python
python -m http.server 8080

# Node.js http-server
npx http-server -p 8080

# PHP
php -S localhost:8080
```

Then update API URLs in `app.js` to point to backend server.

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE: Not supported

## Integration with Backend

Frontend expects backend to run on `http://localhost:3000` by default.

API calls:
1. `GET /api/health` - Check status
2. `POST /api/edit-image` - Edit image
3. `GET /api/providers` - Get provider info

## Development

No build process needed - plain HTML/CSS/JS.

Just edit files and refresh browser!

### Tips
- Use browser DevTools for debugging
- Check Console for errors
- Monitor Network tab for API calls
- Test on multiple browsers

---

See [../README.md](../README.md) for complete documentation.
