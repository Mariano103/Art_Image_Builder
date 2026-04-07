# 🎨 AI Image Editor

A powerful, production-ready AI-powered image editing application that allows users to edit specific objects in images while preserving everything else - background, colors, lighting, and style.

## ✨ Features

### Core Functionality
- **Object-Specific Editing**: Modify only the objects you specify in your prompt
- **Style Preservation**: Maintains background, colors, lighting, and overall image style
- **Full Image Display**: Upload and view full-resolution images in the UI
- **Easy Download**: One-click download of edited images
- **Real-time Processing**: Cloud-based AI processing with progress indicators

### AI Providers
- **OpenAI DALL-E**: Industry-leading image editing with natural language understanding
- **Stability AI**: Stable Diffusion inpainting for precise modifications
- **Modular Architecture**: Easily switch between providers without UI changes

### User Experience
- **Drag & Drop Upload**: Intuitive file upload with validation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Clear, actionable error messages
- **Loading States**: Visual feedback during processing
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter to edit

### Optional Enhancements
- Image zoom functionality
- Edit history tracking (localStorage)
- Multiple AI provider support
- Comprehensive help system

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- API key from OpenAI or Stability AI

### Installation

1. **Clone or download this project**

2. **Navigate to backend directory**
```bash
cd backend
```

3. **Install dependencies**
```bash
npm install
```

4. **Configure environment variables**

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```env
# Choose your AI provider
AI_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stability AI Configuration (Alternative)
STABILITY_API_KEY=your-stability-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

5. **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. **Open your browser**

Navigate to: `http://localhost:3000`

The server automatically serves the frontend from the `../frontend` directory.

## 🔑 Getting API Keys

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new secret key
5. Copy and paste into your `.env` file

### Stability AI API Key
1. Visit [Stability AI Platform](https://platform.stability.ai)
2. Sign up or log in
3. Go to API Keys section
4. Generate a new key
5. Copy and paste into your `.env` file

## 📖 How to Use

### Basic Workflow

1. **Upload Image**
   - Click the upload area or drag & drop an image
   - Supported formats: JPEG, PNG, WEBP
   - Maximum size: 10MB

2. **Write Prompt**
   - Describe which object to edit and how
   - Be specific: mention colors, styles, and details
   - Examples:
     - "Change the red car to a blue sports car"
     - "Replace the wooden table with a glass table"
     - "Make the person's shirt green instead of blue"

3. **Click Edit**
   - AI processes your image (10-30 seconds)
   - Progress indicators show status

4. **Review & Download**
   - View the edited result
   - Download if satisfied
   - Edit again to refine

## 🏗️ Project Structure

```
main_project/
├── backend/                      # 🔧 Backend API Server
│   ├── server.js                 # Express server
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Backend configuration
│   ├── .env.example              # Environment template
│   ├── .gitignore               # Backend git ignore
│   ├── README.md                # Backend documentation
│   ├── services/                # AI provider modules
│   │   ├── aiProviderFactory.js  # Provider factory pattern
│   │   ├── openaiProvider.js     # OpenAI implementation
│   │   └── stabilityProvider.js  # Stability AI implementation
│   └── uploads/                 # Temporary storage (auto-created)
│
├── frontend/                     # 🎨 Frontend UI
│   ├── index.html               # Main HTML
│   ├── app.js                   # Client logic
│   ├── styles.css               # Styling
│   └── README.md                # Frontend documentation
│
├── README.md                    # Main documentation (this file)
├── QUICKSTART.md               # Quick setup guide
├── API_DOCUMENTATION.md         # API reference
├── ARCHITECTURE.md              # System architecture
├── TESTING.md                  # Testing guide
├── TROUBLESHOOTING.md          # Problem solving
├── setup.bat                   # Windows setup script
└── setup.ps1                   # PowerShell setup script
```

## 🔧 API Endpoints

### `GET /api/health`
Health check and provider status
```json
{
  "status": "ok",
  "provider": "openai",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### `GET /api/providers`
Get available AI providers
```json
{
  "current": "openai",
  "available": ["openai", "stability"]
}
```

### `POST /api/edit-image`
Edit image with AI

**Request:**
- `image`: Image file (multipart/form-data)
- `prompt`: Text description of edits

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://...",
  "provider": "openai"
}
```

### `POST /api/edit-image-with-mask`
Advanced editing with custom mask

**Request:**
- `image`: Image file
- `mask`: Mask image file (optional)
- `prompt`: Text description

## 🎯 AI Provider Details

### OpenAI (DALL-E)
- **Strengths**: Natural language understanding, high-quality results
- **Image Size**: Automatically resized to 1024x1024
- **Format**: PNG with alpha channel for masking
- **Processing Time**: 10-20 seconds

### Stability AI
- **Strengths**: Fine-grained control, cost-effective
- **Image Size**: 1024x1024 (SDXL model)
- **Format**: PNG
- **Processing Time**: 15-30 seconds

## 🔄 Switching AI Providers

Simply change the `AI_PROVIDER` variable in your `.env` file:

```env
# Use OpenAI
AI_PROVIDER=openai

# Or use Stability AI
AI_PROVIDER=stability
```

Restart the server for changes to take effect. No code changes needed!

## 🛡️ Error Handling

The application handles various error scenarios:

- **Invalid File Format**: Only accepts JPEG, PNG, WEBP
- **File Too Large**: Maximum 10MB
- **Empty Prompt**: Requires clear editing instructions
- **API Failures**: Graceful error messages with retry capability
- **Network Issues**: Timeout handling and user feedback

## 🎨 Example Prompts

### Good Prompts (Specific)
- ✅ "Replace the red car with a blue Tesla Model 3"
- ✅ "Change the person's shirt from white to a green hoodie"
- ✅ "Make the sky orange and pink like sunset"
- ✅ "Replace the wooden chair with a modern black office chair"

### Less Effective Prompts (Vague)
- ❌ "Make it better"
- ❌ "Change something"
- ❌ "Edit the image"

## 🔐 Security Considerations

- API keys stored in environment variables (never committed)
- File upload validation and size limits
- Automatic cleanup of temporary files
- Input sanitization
- CORS configuration for security

## 📊 Performance

- **Upload Limit**: 10MB per image
- **Processing Time**: 10-30 seconds depending on provider
- **Concurrent Requests**: Supported (Node.js async)
- **Image Optimization**: Automatic resize to optimal dimensions

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify Node.js version (16+)
- Ensure all dependencies are installed: `npm install`

### "API key not set" error
- Create `.env` file from `.env.example`
- Add your API key
- Restart the server

### Image editing fails
- Check your API key is valid and has credits
- Verify internet connection
- Try a simpler prompt
- Check image format is supported

### Cannot upload image
- Verify file size < 10MB
- Check file format (JPEG, PNG, WEBP only)
- Try a different browser

## 📝 Development

### Install dependencies
```bash
npm install
```

### Run in development mode
```bash
npm run dev
```

### Run in production
```bash
npm start
```

### Environment Variables
- `AI_PROVIDER`: Choose 'openai' or 'stability'
- `OPENAI_API_KEY`: Your OpenAI API key
- `STABILITY_API_KEY`: Your Stability AI API key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

## 🚀 Deployment

### Deploy to Production

1. **Environment Setup**
   - Set production environment variables
   - Use process manager (PM2, Forever)
   - Configure reverse proxy (Nginx, Apache)

2. **Example with PM2**
```bash
npm install -g pm2
pm2 start server.js --name ai-image-editor
pm2 save
pm2 startup
```

3. **Docker Deployment** (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

Contributions are welcome! Areas for enhancement:
- Additional AI provider integrations
- Automatic object detection and masking
- Batch processing support
- Multi-object editing
- Undo/redo functionality
- Advanced mask editing UI

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

- **OpenAI**: DALL-E image editing API
- **Stability AI**: Stable Diffusion models
- **Express.js**: Web server framework
- **Sharp**: High-performance image processing

## 📞 Support

For issues, questions, or feature requests:
- Check the Help modal in the application
- Review this README
- Check API provider documentation

---

**Built with ❤️ using AI technology**

*Last updated: March 2026*
