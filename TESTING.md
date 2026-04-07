# Testing Guide

## Manual Testing Checklist

### 1. Setup Verification
- [ ] Node.js installed (v16+)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with API key
- [ ] Server starts without errors

### 2. Upload Functionality
- [ ] Click upload area opens file picker
- [ ] Drag and drop works
- [ ] Image preview displays correctly
- [ ] "Change Image" button works
- [ ] Invalid file types are rejected
- [ ] Files > 10MB are rejected

### 3. Prompt Input
- [ ] Textarea accepts text input
- [ ] Prompt tips display correctly
- [ ] Character input is smooth
- [ ] Ctrl+Enter keyboard shortcut works

### 4. Image Editing
- [ ] Edit button enables when image + prompt present
- [ ] Loading overlay appears during processing
- [ ] Loading animation cycles through messages
- [ ] Edited image displays in results section
- [ ] Smooth scroll to results works

### 5. Download Functionality
- [ ] Download button works
- [ ] Downloaded file is valid PNG/JPEG
- [ ] Filename includes timestamp
- [ ] Multiple downloads work

### 6. Error Handling
- [ ] No image uploaded error
- [ ] Empty prompt error
- [ ] Invalid API key error
- [ ] Network timeout error
- [ ] File size exceeded error
- [ ] Invalid format error

### 7. UI/UX
- [ ] Responsive on mobile devices
- [ ] Buttons have hover effects
- [ ] Loading states are clear
- [ ] Error messages are readable
- [ ] Modal windows open/close properly
- [ ] Image zoom functionality works

### 8. Provider Switching
- [ ] OpenAI provider works
- [ ] Stability AI provider works (if configured)
- [ ] Provider badge shows correct name
- [ ] API status check works

### 9. Reset Functionality
- [ ] Reset button clears all data
- [ ] Form returns to initial state
- [ ] Can start new edit after reset

### 10. Browser Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Test Images

Use these test scenarios:

### Scenario 1: Simple Object Replacement
**Image**: Photo with a car
**Prompt**: "Change the red car to a blue sports car"
**Expected**: Car color and style changes, rest stays same

### Scenario 2: Person Clothing
**Image**: Photo of person
**Prompt**: "Change the shirt to a green hoodie"
**Expected**: Only shirt changes, face/background preserved

### Scenario 3: Background Element
**Image**: Landscape photo
**Prompt**: "Make the sky sunset orange and pink"
**Expected**: Sky changes color, foreground unchanged

### Scenario 4: Furniture Replacement
**Image**: Room interior
**Prompt**: "Replace the wooden chair with a modern black office chair"
**Expected**: Chair replaced, room layout preserved

## Performance Testing

### Response Times (Expected)
- **Upload**: < 1 second
- **OpenAI Processing**: 10-20 seconds
- **Stability AI Processing**: 15-30 seconds
- **Download**: < 2 seconds

### Load Testing
- Test with 5 concurrent users
- Verify queue handling
- Check memory usage
- Monitor API rate limits

## API Testing with cURL

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Provider Info
```bash
curl http://localhost:3000/api/providers
```

### Image Edit (with file)
```bash
curl -X POST http://localhost:3000/api/edit-image \
  -F "image=@test-image.jpg" \
  -F "prompt=Change the red car to blue"
```

## Troubleshooting Test Failures

### Upload fails
- Check file permissions in uploads/ directory
- Verify multer configuration
- Check disk space

### API calls fail
- Verify API key is correct in .env
- Check API credits/quota
- Test with curl directly
- Check network/firewall

### Images don't display
- Check browser console for errors
- Verify CORS settings
- Check image URL/base64 format
- Test with different image sizes

### Download fails
- Check browser's download settings
- Verify blob creation
- Test with different browsers
- Check console for JavaScript errors

## Automated Testing (Future Enhancement)

Consider adding:
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Playwright/Cypress
- Visual regression tests

## Security Testing

- [ ] SQL injection attempts (n/a - no database)
- [ ] XSS attempts in prompt field
- [ ] File upload exploits (executable files)
- [ ] API key exposure in responses
- [ ] CORS misconfiguration
- [ ] Rate limiting bypass attempts

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] ARIA labels where needed

---

**Note**: This is a manual testing checklist. For production deployment, implement automated testing with CI/CD integration.
