# How to Add Your Own Book Cover Images

## 🖼️ Method 1: Using Image URLs (Recommended)

1. **Upload your images** to any image hosting service:
   - Google Drive (make sure to set sharing to "Anyone with the link")
   - Imgur
   - GitHub (create a repository and upload images)
   - Any cloud storage service

2. **Get the direct image URL** (should end with .jpg, .png, .gif, etc.)

3. **When adding a book**:
   - Click the + button to add a new book
   - In the "Cover Image URL" field, paste your image URL
   - Example: `https://drive.google.com/uc?id=YOUR_FILE_ID`

## 🖼️ Method 2: Using Local Images

1. **Add your images** to the `src/assets/book-covers/` folder
2. **Update the coverImages mapping** in `src/components/StudentCatalog.tsx`

### Step-by-step for Local Images:

1. **Add your image files** to `src/assets/book-covers/`
   - Supported formats: .jpg, .png, .gif, .webp
   - Recommended size: 300x400 pixels or similar aspect ratio

2. **Import your images** in `src/components/StudentCatalog.tsx`:
   ```typescript
   import yourBookCover from "@/assets/book-covers/your-book-cover.jpg";
   ```

3. **Add to the coverImages mapping**:
   ```typescript
   const coverImages: { [key: string]: string } = {
     "Your Book Title": yourBookCover,
     // ... other books
   };
   ```

## 🖼️ Method 3: File Upload (Current Implementation)

1. **Click the + button** to add a new book
2. **Click "Upload Cover Image"** button
3. **Select your image file** from your computer
4. **See the preview** of your image
5. **Submit the form** to add the book

## 📝 Example Image URLs

Here are some example formats for image URLs:

```
https://example.com/book-cover.jpg
https://drive.google.com/uc?id=1ABC123DEF456
https://github.com/username/repo/raw/main/images/book.jpg
https://imgur.com/abc123.jpg
```

## 🎨 Image Requirements

- **Format**: JPG, PNG, GIF, WebP
- **Size**: Maximum 5MB
- **Aspect Ratio**: 3:4 (width:height) works best
- **Resolution**: 300x400 pixels or higher recommended

## 🔧 Troubleshooting

### If images don't show:
1. **Check the URL** - make sure it's a direct link to the image
2. **Check permissions** - ensure the image is publicly accessible
3. **Check format** - use common image formats (jpg, png, gif)

### If upload doesn't work:
1. **Check file size** - must be under 5MB
2. **Check file format** - must be an image file
3. **Check browser** - try a different browser if issues persist

## 💡 Tips

- **Use high-quality images** for better display
- **Keep file sizes reasonable** for faster loading
- **Use consistent aspect ratios** for a uniform look
- **Test your URLs** in a browser before adding to the system
