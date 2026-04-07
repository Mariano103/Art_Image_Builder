# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. Server Won't Start

#### Error: "Cannot find module 'express'"
**Cause**: Dependencies not installed  
**Solution**:
```bash
npm install
```

#### Error: "Port 3000 is already in use"
**Cause**: Another application using port 3000  
**Solutions**:
- Change port in `.env`: `PORT=3001`
- Or stop the other application
- Or find and kill process:
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

#### Error: "OPENAI_API_KEY is not set"
**Cause**: Missing or incorrect .env configuration  
**Solution**:
1. Ensure `.env` file exists (copy from `.env.example`)
2. Add your API key: `OPENAI_API_KEY=sk-...`
3. Restart server

---

### 2. Image Upload Issues

#### Error: "Only image files are allowed"
**Cause**: Invalid file format  
**Solution**: Use JPEG, PNG, or WEBP formats only

#### Error: "File is too large"
**Cause**: Image exceeds 10MB limit  
**Solutions**:
- Compress image before upload
- Use online tools (TinyPNG, Squoosh)
- Or increase limit in `server.js` (not recommended):
```javascript
limits: { fileSize: 20 * 1024 * 1024 } // 20MB
```

#### Image doesn't preview
**Cause**: Browser compatibility or CORS issue  
**Solutions**:
- Try different browser
- Check browser console for errors
- Verify file is valid image

---

### 3. AI Processing Failures

#### Error: "OpenAI editing failed: 401 Unauthorized"
**Cause**: Invalid or expired API key  
**Solutions**:
1. Verify API key in `.env` is correct
2. Check key hasn't expired
3. Generate new key at https://platform.openai.com

#### Error: "Insufficient credits"
**Cause**: API account has no credits  
**Solution**: Add credits to your OpenAI/Stability account

#### Error: "Request timeout"
**Cause**: Network issues or slow API response  
**Solutions**:
- Check internet connection
- Try again (provider may be busy)
- Switch to different provider

#### Error: "The operation has timed out"
**Cause**: Long processing time  
**Solution**: This is normal for complex edits. Wait or try simpler prompt.

#### Poor Edit Quality
**Causes**: Vague prompt, complex scene, poor lighting  
**Solutions**:
1. **Be more specific**:
   - Bad: "change the car"
   - Good: "change the red sedan to a blue Tesla Model 3"

2. **Simplify the edit**:
   - Edit one object at a time
   - Use clearer prompts

3. **Try different wording**:
   - "Replace X with Y"
   - "Change X from A to B"
   - "Make X look like Y"

---

### 4. Download Issues

#### Download button doesn't work
**Causes**: Browser settings, popup blocker  
**Solutions**:
- Allow popups for localhost
- Check browser console for errors
- Try different browser
- Right-click image → "Save image as"

#### Downloaded file is corrupted
**Causes**: Incomplete download, network issue  
**Solutions**:
- Try downloading again
- Check network connection
- Verify source image is valid

---

### 5. Installation Problems

#### npm install fails
**Solutions**:
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Try with legacy peer deps
npm install --legacy-peer-deps
```

#### Sharp installation fails
**Cause**: Sharp requires build tools on Windows  
**Solutions**:
1. Install Visual C++ Build Tools
2. Or use pre-built binaries:
```bash
npm install --platform=win32 --arch=x64 sharp
```

#### Permission denied errors
**Cause**: Insufficient permissions  
**Solution**: Run Command Prompt/PowerShell as Administrator

---

### 6. Browser-Specific Issues

#### Works in Chrome, not Firefox
**Cause**: Browser API differences  
**Solution**: Update Firefox to latest version

#### Safari issues
**Cause**: Safari strict security  
**Solutions**:
- Enable "Disable Cross-Origin Restrictions" (develop mode)
- Test on Chrome/Edge first

#### Mobile browser issues
**Cause**: Limited mobile support for some features  
**Solution**: Use desktop browser for best experience

---

### 7. API Provider Specific

#### OpenAI Errors

**"Content policy violation"**
- Prompt may contain restricted content
- Rephrase prompt
- Avoid sensitive/explicit content

**"Rate limit exceeded"**
- Too many requests
- Wait a minute
- Upgrade API tier

**"Model not available"**
- Service outage
- Check OpenAI status page
- Try again later

#### Stability AI Errors

**"Invalid parameter"**
- Check image format
- Verify prompt structure
- Review API documentation

**"Insufficient credits"**
- Add credits to account
- Check billing settings

---

### 8. Performance Issues

#### Slow upload
**Causes**: Large file, slow connection  
**Solutions**:
- Compress image before upload
- Use smaller resolution
- Check network speed

#### Slow processing
**Causes**: AI provider load, complex edit  
**Solutions**:
- This is normal (10-30 seconds)
- Try simpler prompt
- Switch providers

#### Browser freezes
**Causes**: Large image rendering  
**Solutions**:
- Use smaller images
- Increase browser memory
- Close other tabs

---

### 9. Development Issues

#### Code changes not reflecting
**Solutions**:
```bash
# Use nodemon for auto-reload
npm run dev

# Hard refresh browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

#### Can't access from other devices
**Cause**: Server bound to localhost only  
**Solution**: Change server listen to:
```javascript
app.listen(PORT, '0.0.0.0', () => { ... });
```

---

### 10. Environment Variable Issues

#### Changes to .env not working
**Cause**: Server not restarted  
**Solution**: Always restart server after .env changes

#### .env file not found
**Solution**:
```bash
# Create from template
copy .env.example .env
```

#### API key with spaces or quotes
**Cause**: Incorrect formatting in .env  
**Correct Format**:
```env
OPENAI_API_KEY=sk-xxxxx
# NO quotes, NO spaces
```

**Wrong**:
```env
OPENAI_API_KEY="sk-xxxxx"  # DON'T use quotes
OPENAI_API_KEY = sk-xxxxx  # DON'T use spaces around =
```

---

## Error Messages Reference

### Client-Side Errors

| Message | Meaning | Action |
|---------|---------|--------|
| "Please upload an image and provide a prompt" | Missing input | Upload image and write prompt |
| "Invalid file type" | Wrong format | Use JPEG, PNG, or WEBP |
| "File is too large" | Exceeds 10MB | Compress image |
| "Cannot connect to server" | Server offline | Start server |

### Server Errors

| Message | Meaning | Action |
|---------|---------|--------|
| "No image file uploaded" | Upload failed | Check network, try again |
| "Prompt is required" | Empty prompt | Write description |
| "OPENAI_API_KEY is not set" | Missing config | Add API key to .env |
| "OpenAI editing failed" | API error | Check API key, credits |

---

## Getting Help

### Self-Help Resources
1. **README.md**: Complete documentation
2. **QUICKSTART.md**: Step-by-step setup
3. **API_DOCUMENTATION.md**: Technical reference
4. **In-app Help**: Click "Help" link in footer

### Debug Mode

Enable detailed logging:
```javascript
// In server.js, add at top
const DEBUG = true;

// Then add logging throughout:
if (DEBUG) console.log('Debug info:', data);
```

### Check Logs
```bash
# View real-time logs
npm start

# Logs show:
# - Incoming requests
# - Processing steps
# - Error details
# - API responses
```

### Test API Directly

Use curl or Postman:
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test with actual image
curl -X POST http://localhost:3000/api/edit-image ^
  -F "image=@test.jpg" ^
  -F "prompt=Change the red car to blue"
```

---

## Still Having Issues?

### Before Reporting
1. Check this troubleshooting guide
2. Review console/terminal errors
3. Test with simple image and prompt
4. Try different browser
5. Verify API key is valid

### Useful Diagnostic Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0

# Check for outdated packages
npm outdated

# Verify server can start
npm start
```

### System Information to Collect
- Operating System version
- Node.js version
- Browser and version
- Error message (exact text)
- Steps to reproduce
- Screenshot if helpful

---

## Quick Fixes

### "Everything is broken!"
1. Stop server (Ctrl+C)
2. Delete `node_modules` folder
3. Delete `package-lock.json`
4. Run `npm install`
5. Run `npm start`

### "I made changes but nothing happens"
1. Restart server (Ctrl+C, then `npm start`)
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear browser cache

### "API key is correct but still fails"
1. Check for extra spaces in .env
2. Verify no quotes around key
3. Try regenerating API key
4. Check API provider status page

---

**Last Updated**: March 2026
