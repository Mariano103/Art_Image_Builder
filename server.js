require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const OpenAI = require('openai');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed!'));
    }
  }
});

// AI Provider Factory
class AIProviderFactory {
  static getProvider() {
    const provider = process.env.AI_PROVIDER || 'openai';
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'stability':
        return new StabilityAIProvider();
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
}

// OpenAI Provider
class OpenAIProvider {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async editImage(imagePath, prompt, maskPath = null) {
    try {
      // Prepare image - OpenAI requires RGBA PNG with transparent mask
      const processedImagePath = await this.prepareImageForOpenAI(imagePath, maskPath);
      
      const imageFile = fs.createReadStream(processedImagePath);
      
      // If no mask provided, use DALL-E 3 variation or create automatic mask
      const response = await this.client.images.edit({
        image: imageFile,
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      });

      // Cleanup temporary file
      if (processedImagePath !== imagePath) {
        fs.unlinkSync(processedImagePath);
      }

      return {
        success: true,
        imageUrl: response.data[0].url,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      throw new Error(`OpenAI editing failed: ${error.message}`);
    }
  }

  async prepareImageForOpenAI(imagePath, maskPath) {
    // OpenAI requires PNG with transparency for masking
    const outputPath = imagePath.replace(/\.[^.]+$/, '-processed.png');
    
    try {
      let imageBuffer = await sharp(imagePath)
        .resize(1024, 1024, { fit: 'inside' })
        .ensureAlpha()
        .png()
        .toBuffer();

      // If mask is provided, apply it
      if (maskPath) {
        const maskBuffer = await sharp(maskPath)
          .resize(1024, 1024, { fit: 'inside' })
          .greyscale()
          .toBuffer();
        
        // Composite mask onto image alpha channel
        imageBuffer = await sharp(imageBuffer)
          .composite([{ input: maskBuffer, blend: 'dest-in' }])
          .png()
          .toBuffer();
      }

      fs.writeFileSync(outputPath, imageBuffer);
      return outputPath;
    } catch (error) {
      throw new Error(`Image preparation failed: ${error.message}`);
    }
  }
}

// Stability AI Provider
class StabilityAIProvider {
  constructor() {
    if (!process.env.STABILITY_API_KEY) {
      throw new Error('STABILITY_API_KEY is not set in environment variables');
    }
    this.apiKey = process.env.STABILITY_API_KEY;
    this.baseUrl = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image';
  }

  async editImage(imagePath, prompt, maskPath = null) {
    try {
      const formData = new FormData();
      
      // Read and prepare image
      const imageBuffer = await sharp(imagePath)
        .resize(1024, 1024, { fit: 'inside' })
        .toBuffer();
      
      formData.append('init_image', imageBuffer, 'image.png');
      formData.append('text_prompts[0][text]', prompt);
      formData.append('text_prompts[0][weight]', '1');
      formData.append('cfg_scale', '7');
      formData.append('steps', '30');
      formData.append('samples', '1');

      if (maskPath) {
        const maskBuffer = fs.readFileSync(maskPath);
        formData.append('mask_image', maskBuffer, 'mask.png');
        formData.append('mask_source', 'MASK_IMAGE_BLACK');
      }

      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const imageBase64 = response.data.artifacts[0].base64;
        return {
          success: true,
          imageData: imageBase64,
          provider: 'stability'
        };
      } else {
        throw new Error('No image generated by Stability AI');
      }
    } catch (error) {
      console.error('Stability AI Error:', error.response?.data || error.message);
      throw new Error(`Stability AI editing failed: ${error.message}`);
    }
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    provider: process.env.AI_PROVIDER || 'openai',
    timestamp: new Date().toISOString()
  });
});

// Get available AI providers
app.get('/api/providers', (req, res) => {
  res.json({
    current: process.env.AI_PROVIDER || 'openai',
    available: ['openai', 'stability']
  });
});

// Main image editing endpoint
app.post('/api/edit-image', upload.single('image'), async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    // Validate input
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file uploaded' 
      });
    }

    const { prompt } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required and cannot be empty' 
      });
    }

    uploadedFilePath = req.file.path;

    // Get AI provider and process image
    const provider = AIProviderFactory.getProvider();
    const result = await provider.editImage(uploadedFilePath, prompt);

    // Cleanup uploaded file
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.json(result);

  } catch (error) {
    // Cleanup on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    console.error('Image editing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Image editing failed. Please try again.' 
    });
  }
});

// Advanced editing with mask support
app.post('/api/edit-image-with-mask', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mask', maxCount: 1 }
]), async (req, res) => {
  let uploadedFiles = [];
  
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file uploaded' 
      });
    }

    const { prompt } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }

    const imagePath = req.files.image[0].path;
    const maskPath = req.files.mask ? req.files.mask[0].path : null;
    
    uploadedFiles.push(imagePath);
    if (maskPath) uploadedFiles.push(maskPath);

    // Get AI provider and process image
    const provider = AIProviderFactory.getProvider();
    const result = await provider.editImage(imagePath, prompt, maskPath);

    // Cleanup uploaded files
    uploadedFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    res.json(result);

  } catch (error) {
    // Cleanup on error
    uploadedFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    console.error('Image editing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Image editing failed. Please try again.' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         AI Image Editor Server Running                     ║
╠════════════════════════════════════════════════════════════╣
║  Server:    http://localhost:${PORT}                       ║
║  Provider:  ${(process.env.AI_PROVIDER || 'openai').toUpperCase().padEnd(45)}║
║  Status:    Ready to accept requests                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
