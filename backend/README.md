# Backend API Server

Backend service for AI Image Editor application.

## Directory Structure

```
backend/
├── server.js                 # Main Express server
├── package.json             # Backend dependencies
├── .env                     # Environment configuration
├── services/                # AI provider services
│   ├── aiProviderFactory.js   # Provider factory
│   ├── openaiProvider.js      # OpenAI implementation
│   └── stabilityProvider.js   # Stability AI implementation
└── uploads/                 # Temporary file storage (auto-created)
```

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `.env` file:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
PORT=3000
```

### 3. Run Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server will start on: **http://localhost:3000**

## API Endpoints

### `GET /api/health`
Check server status
```json
{
  "status": "ok",
  "provider": "openai",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### `POST /api/edit-image`
Edit image with AI
- **Body**: FormData with `image` (file) and `prompt` (string)
- **Response**: `{ success: true, imageUrl: "...", provider: "openai" }`

### `POST /api/edit-image-with-mask`
Advanced editing with mask
- **Body**: FormData with `image`, `mask` (optional), and `prompt`

## AI Providers

### OpenAI (Default)
- Model: DALL-E
- Best for: Natural language understanding
- Setup: Add `OPENAI_API_KEY` to .env

### Stability AI
- Model: Stable Diffusion XL
- Best for: Cost-effective, fine control
- Setup: Add `STABILITY_API_KEY` and set `AI_PROVIDER=stability`

## Adding New Providers

1. Create new file in `services/`: `newProvider.js`
2. Implement class with `editImage()` method
3. Add to `aiProviderFactory.js` switch statement
4. Add API key to `.env`

Example:
```javascript
// services/newProvider.js
class NewProvider {
  constructor() {
    if (!process.env.NEW_API_KEY) {
      throw new Error('NEW_API_KEY not set');
    }
  }

  async editImage(imagePath, prompt, maskPath) {
    // Your implementation
    return {
      success: true,
      imageUrl: 'result',
      provider: 'new-provider'
    };
  }
}

module.exports = { NewProvider };
```

## Dependencies

- **express**: Web framework
- **multer**: File upload handling
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **axios**: HTTP client
- **openai**: OpenAI SDK
- **sharp**: Image processing
- **form-data**: Multipart form handling

## Development

### Run with logs
```bash
npm run dev
```

### Test API
```bash
# Health check
curl http://localhost:3000/api/health

# Edit image
curl -X POST http://localhost:3000/api/edit-image \
  -F "image=@test.jpg" \
  -F "prompt=Change the car to blue"
```

## Error Handling

All errors return JSON:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common errors:
- 400: Missing image or prompt
- 500: Server or AI provider error

## Security

- API keys in environment variables only
- File upload validation (type, size)
- Automatic temp file cleanup
- CORS enabled (configure for production)

## Performance

- File size limit: 10MB
- Image processing: < 1 second
- AI processing: 10-30 seconds (external API)
- Auto cleanup: No disk bloat

---

See [../README.md](../README.md) for complete documentation.
