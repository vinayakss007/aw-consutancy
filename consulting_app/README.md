# Business Consulting Toolkit

A comprehensive business consulting application with Excel import capabilities and advanced template management for generating reports and documents.

## Features

- **Customer Management**: Store and manage customer information
- **Form Creation**: Create custom forms with various field types
- **Template System**: Create detailed templates with multiple sections and placeholders
- **Excel Import**: Import Excel files directly into forms or templates
- **Template Combination**: Combine multiple templates to create larger documents
- **Report Generation**: Generate reports using templates and Excel data
- **Offline Support**: Works offline as a Progressive Web App (PWA)
- **Template Import/Export**: Save and load templates as JSON files

## Technology Stack

- HTML5, CSS3, JavaScript (ES6+)
- IndexedDB for local data storage
- SheetJS (xlsx) for Excel file processing (loaded via CDN)
- PWA capabilities for offline functionality

## Deployment Requirements

### For Static Hosting (Recommended)

This application is designed to work as a static website, requiring only a basic web server:

1. **Web Server**: Any static web server (Apache, Nginx, IIS, etc.)
2. **HTTPS**: Recommended for PWA functionality and security
3. **MIME Types**: Ensure proper MIME types for service workers:
   - `.js` files: `application/javascript`
   - `.json` files: `application/json`

### For Local Development

1. **Node.js + http-server** (for local testing):
   ```bash
   npm install -g http-server
   http-server .
   ```

2. **Python** (for local testing):
   ```bash
   python -m http.server 8000
   ```

3. **Any local server** that can serve static files

## Deployment Instructions

### To GitHub Pages

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Set source to your main branch
4. Your app will be available at `https://<username>.github.io/<repository>`

### To Netlify

1. Create a new site on Netlify
2. Drag and drop the project folder or connect to your Git repository
3. Deploy settings:
   - Build command: None required
   - Publish directory: `./` (root of project)

### To Vercel

1. Create a new project on Vercel
2. Import your Git repository
3. Set build settings:
   - Framework preset: Other
   - Build command: None
   - Output directory: Current directory

### To Cloudflare Pages

1. Create a new project on Cloudflare Pages
2. Connect to your Git repository
3. Set build settings:
   - Build command: None
   - Build output directory: `./`
   - Root directory: Current directory

### To AWS S3 + CloudFront

1. Create an S3 bucket with static website hosting enabled
2. Upload all files to the bucket
3. Set bucket policy to allow public read access
4. Configure CloudFront distribution (optional but recommended)

## File Structure

```
consulting_app/
├── index.html          # Main application file
├── app.js             # Main application logic
├── storage.js         # IndexedDB storage service
├── forms.js           # Form management
├── reports.js         # Report generation
├── excel-importer.js  # Excel import functionality
├── template-system.js # Advanced template system
├── styles.css         # Application styling
├── manifest.json      # PWA manifest
├── service-worker.js  # PWA service worker
├── README.md          # This file
└── (icon files)       # PWA icons (if added)
```

## PWA Capabilities

The application is built as a Progressive Web App with:

- Offline functionality using service workers
- Installable on devices (mobile and desktop)
- Responsive design for all screen sizes
- Fast loading with caching

## Data Storage

- Uses IndexedDB for client-side data storage
- All data is stored locally in the user's browser
- No server backend required for basic functionality
- Data persists between sessions

## Security Considerations

- All data is stored locally (no data leaves the browser)
- Excel imports are processed client-side
- No server-side processing required
- HTTPS recommended for production deployment

## Customization

To customize the application for your specific needs:

1. Modify `styles.css` for visual changes
2. Update `index.html` for UI changes
3. Modify `app.js` for business logic changes
4. Add new template types in the template system

## Browser Support

- Chrome 50+ (Recommended)
- Firefox 52+
- Safari 11.1+
- Edge 15+
- Mobile browsers with PWA support

## Troubleshooting

### If the application doesn't work offline:

1. Ensure service worker is properly registered (check browser console)
2. Verify HTTPS is used in production
3. Check browser supports service workers

### If Excel import doesn't work:

1. Verify internet connection (SheetJS is loaded via CDN)
2. Ensure Excel file format is .xlsx or .xls
3. Check browser console for errors

### If PWA installation doesn't work:

1. Ensure site is served over HTTPS
2. Verify manifest.json and service-worker.js are accessible
3. Check browser console for errors

## Support

For support, please:

1. Check the browser console for error messages
2. Verify all files are properly uploaded to your server
3. Ensure proper MIME types are configured
4. Confirm HTTPS is enabled for production deployment

## Notes

- This application stores all data in the client's browser using IndexedDB
- No server backend is required for basic functionality
- Advanced features like Excel import require internet connectivity to load SheetJS library
- For production use, consider implementing server-side backup solutions for critical data