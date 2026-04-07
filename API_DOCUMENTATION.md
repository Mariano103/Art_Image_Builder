# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
API keys are configured server-side via environment variables. No client-side authentication required.

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /api/health`

**Description**: Check if server is running and which AI provider is active

**Response**:
```json
{
  "status": "ok",
  "provider": "openai",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

**Status Codes**:
- `200`: Server is healthy
- `500`: Server error

---

### 2. Get Providers

**Endpoint**: `GET /api/providers`

**Description**: List available AI providers and current active provider

**Response**:
```json
{
  "current": "openai",
  "available": ["openai", "stability"]
}
```

**Status Codes**:
- `200`: Success

---

### 3. Edit Image (Standard)

**Endpoint**: `POST /api/edit-image`

**Description**: Edit an image using AI based on text prompt

**Request**:
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image` (file, required): Image file to edit
  - `prompt` (string, required): Description of desired edits

**Example Request** (JavaScript):
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('prompt', 'Change the red car to a blue sports car');

const response = await fetch('/api/edit-image', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Success Response** (OpenAI):
```json
{
  "success": true,
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "provider": "openai"
}
```

**Success Response** (Stability AI):
```json
{
  "success": true,
  "imageData": "base64-encoded-image-data...",
  "provider": "stability"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message description"
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (missing file or prompt)
- `500`: Server or AI provider error

**Validation Rules**:
- **File Types**: JPEG, PNG, WEBP only
- **Max File Size**: 10MB
- **Prompt**: Must not be empty
- **Output Size**: 1024x1024 pixels (both providers)

---

### 4. Edit Image with Mask (Advanced)

**Endpoint**: `POST /api/edit-image-with-mask`

**Description**: Edit image with optional custom mask for precise control over editing region

**Request**:
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image` (file, required): Image file to edit
  - `mask` (file, optional): Mask image (white=edit, black=preserve)
  - `prompt` (string, required): Description of desired edits

**Example Request** (JavaScript):
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('mask', maskFile); // Optional
formData.append('prompt', 'Replace this area with grass');

const response = await fetch('/api/edit-image-with-mask', {
  method: 'POST',
  body: formData
});
```

**Response**: Same format as standard edit endpoint

**Mask Guidelines**:
- White pixels (255,255,255): Area to edit
- Black pixels (0,0,0): Area to preserve
- Gray pixels: Partial blending (provider-dependent)
- Mask should match image dimensions

---

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check file upload and prompt |
| 413 | Payload Too Large | Reduce image file size |
| 415 | Unsupported Media Type | Use JPEG, PNG, or WEBP |
| 500 | Server Error | Check logs, verify API key |
| 503 | Service Unavailable | AI provider may be down |

---

## Rate Limits

Rate limits depend on your AI provider:

### OpenAI
- **Free Tier**: ~50 requests/day
- **Paid Tier**: Based on usage tier
- **Rate**: ~50 requests/minute

### Stability AI
- **Free Tier**: Limited credits
- **Paid Tier**: Based on plan
- **Rate**: Varies by plan

---

## Image Processing Details

### Input Processing
1. **Validation**: Check file type and size
2. **Upload**: Save to temporary storage
3. **Resize**: Optimize to 1024x1024 (preserving aspect ratio)
4. **Format**: Convert to PNG with alpha channel
5. **Submit**: Send to AI provider

### Output Processing
1. **Receive**: Get result from AI provider
2. **Format**: URL (OpenAI) or Base64 (Stability)
3. **Cleanup**: Remove temporary files
4. **Return**: Send to client

### Temporary File Management
- Uploaded files stored in `uploads/` directory
- Files automatically deleted after processing
- Cleanup on both success and error
- No persistent storage of user images

---

## Response Time Guidelines

| Operation | Expected Time |
|-----------|---------------|
| Upload | < 1 second |
| Validation | < 100ms |
| AI Processing (OpenAI) | 10-20 seconds |
| AI Processing (Stability) | 15-30 seconds |
| Download | < 2 seconds |

---

## Best Practices

### Client-Side
1. **Validate before upload**: Check file size and type
2. **Show loading states**: Keep user informed
3. **Handle errors gracefully**: Display clear messages
4. **Implement timeouts**: Don't hang on network issues
5. **Cache results**: Avoid redundant processing

### Server-Side
1. **Clean up files**: Always remove temporary uploads
2. **Validate inputs**: Never trust client data
3. **Log errors**: Track issues for debugging
4. **Rate limit**: Prevent abuse (implement if needed)
5. **Monitor API usage**: Track costs and quotas

### Prompt Engineering
1. **Be specific**: "blue Tesla Model 3" > "nice car"
2. **Include context**: Mention what exists and what to change
3. **One object focus**: Edit one thing at a time
4. **Describe style**: Include colors, materials, styles
5. **Test iterations**: Refine prompts based on results

---

## Example Integration

### React Component
```javascript
async function editImage(file, prompt) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', prompt);

  try {
    const response = await fetch('http://localhost:3000/api/edit-image', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.imageUrl || `data:image/png;base64,${data.imageData}`;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Edit failed:', error);
    throw error;
  }
}
```

### Vue Component
```javascript
methods: {
  async editImage() {
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('prompt', this.editPrompt);

    this.loading = true;

    try {
      const res = await this.$http.post('/api/edit-image', formData);
      this.editedImageUrl = res.data.imageUrl || 
        `data:image/png;base64,${res.data.imageData}`;
    } catch (error) {
      this.errorMessage = error.response?.data?.error || 'Edit failed';
    } finally {
      this.loading = false;
    }
  }
}
```

### Python Client
```python
import requests

def edit_image(image_path, prompt):
    with open(image_path, 'rb') as f:
        files = {'image': f}
        data = {'prompt': prompt}
        
        response = requests.post(
            'http://localhost:3000/api/edit-image',
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['imageUrl'] if 'imageUrl' in result else result['imageData']
        else:
            raise Exception(response.json()['error'])
```

---

## Extending the API

### Add New AI Provider

1. Create new provider class:
```javascript
class CustomAIProvider {
  constructor() {
    if (!process.env.CUSTOM_API_KEY) {
      throw new Error('CUSTOM_API_KEY not set');
    }
    this.apiKey = process.env.CUSTOM_API_KEY;
  }

  async editImage(imagePath, prompt, maskPath = null) {
    // Implement your provider logic
    return {
      success: true,
      imageUrl: 'result-url', // or imageData: 'base64'
      provider: 'custom'
    };
  }
}
```

2. Add to factory:
```javascript
case 'custom':
  return new CustomAIProvider();
```

3. Update .env:
```env
AI_PROVIDER=custom
CUSTOM_API_KEY=your-key-here
```

### Add New Endpoints

```javascript
// Example: Batch processing
app.post('/api/batch-edit', upload.array('images', 10), async (req, res) => {
  const { prompt } = req.body;
  const results = [];
  
  for (const file of req.files) {
    const provider = AIProviderFactory.getProvider();
    const result = await provider.editImage(file.path, prompt);
    results.push(result);
  }
  
  res.json({ success: true, results });
});
```

---

## Monitoring & Logging

### Server Logs
Monitor `console.log` output for:
- API requests
- Processing times
- Error details
- Provider status

### Recommended Logging
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Metrics to Track
- Request count
- Success/failure rate
- Average processing time
- API costs
- Error types and frequency

---

## Security Notes

1. **API Keys**: Never expose in client code
2. **File Uploads**: Validated server-side
3. **CORS**: Configure for production domains
4. **Rate Limiting**: Implement for production
5. **Input Sanitization**: Prompts are sanitized
6. **Temp Files**: Automatically cleaned up

---

## Cost Estimation

### OpenAI DALL-E
- **Image Edit**: ~$0.020 per image (1024x1024)
- **Example**: 100 edits = ~$2.00

### Stability AI
- **Image Generation**: ~$0.01-0.04 per image
- **Example**: 100 edits = ~$1.00-$4.00

**Note**: Prices subject to change. Check provider pricing pages.

---

## Support & Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Stability AI Docs**: https://platform.stability.ai/docs
- **Express.js**: https://expressjs.com
- **Multer**: https://github.com/expressjs/multer
- **Sharp**: https://sharp.pixelplumbing.com

---

**API Version**: 1.0.0  
**Last Updated**: March 2026
