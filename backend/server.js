require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend from parent directory
app.use(express.static(path.join(__dirname, '../frontend')));

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

// Import AI services
const { AIProviderFactory } = require('./services/aiProviderFactory');

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
    available: ['openai', 'gemini', 'stability']
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

    const { prompt, provider: providerName, quality } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required and cannot be empty' 
      });
    }

    uploadedFilePath = req.file.path;

    // Get AI provider and process image
    const provider = AIProviderFactory.getProvider(providerName);
    const result = await provider.editImage(uploadedFilePath, prompt, null, { quality });

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
    const providerName = req.body.provider;
    const quality = req.body.quality;
    
    uploadedFiles.push(imagePath);
    if (maskPath) uploadedFiles.push(maskPath);

    // Get AI provider and process image
    const provider = AIProviderFactory.getProvider(providerName);
    const result = await provider.editImage(imagePath, prompt, maskPath, { quality });

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

// Start the HTTP listener only for local Node execution.
if (require.main === module) {
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
}

module.exports = app;
