const OpenAI = require('openai');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// OpenAI Image Editing Provider
// Uses gpt-image-1.5 which understands prompts and edits images directly
// without requiring a mask. Just image + prompt.
class OpenAIProvider {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async editImage(imagePath, prompt, userMaskPath = null, options = {}) {
    try {
      const quality = options.quality || 'medium';
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('OpenAI Image Edit (gpt-image-1.5)');
      console.log(`  prompt: "${prompt}"`);
      console.log(`  quality: ${quality}`);

      // Prepare image: convert to PNG, keep original aspect ratio
      // gpt-image-1.5 accepts up to 4MB PNG
      const imageBuffer = await sharp(imagePath)
        .toFormat('png')
        .toBuffer();

      console.log(`  image size: ${(imageBuffer.length / 1024).toFixed(0)} KB`);

      // Build the File objects
      const imageFile = new File([imageBuffer], 'image.png', { type: 'image/png' });

      // Build request params — just image + prompt, no mask needed
      const params = {
        image: imageFile,
        prompt: prompt,
        model: 'gpt-image-1.5',
        size: '1024x1024',
        quality: quality
      };

      // If user provided a mask, include it
      if (userMaskPath) {
        const maskBuffer = await sharp(userMaskPath)
          .toFormat('png')
          .toBuffer();
        params.mask = new File([maskBuffer], 'mask.png', { type: 'image/png' });
        console.log('  using user-provided mask');
      } else {
        console.log('  no mask — model will determine what to edit from prompt');
      }

      console.log('🚀 Sending to gpt-image-1.5 …');

      const response = await this.client.images.edit(params);

      // gpt-image-1.5 may return b64_json or url
      let dataUrl;
      const result = response.data[0];

      if (result.b64_json) {
        dataUrl = 'data:image/png;base64,' + result.b64_json;
        console.log('✅ Got base64 result directly');
      } else if (result.url) {
        console.log('✅ Got URL result, downloading …');
        const dl = await axios.get(result.url, { responseType: 'arraybuffer' });
        dataUrl = 'data:image/png;base64,' + Buffer.from(dl.data).toString('base64');
      } else {
        throw new Error('Unexpected response format from OpenAI');
      }

      console.log('✅ Done');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return {
        success: true,
        imageUrl: dataUrl,
        provider: 'openai',
        model: 'gpt-image-1.5'
      };
    } catch (error) {
      console.error('❌ Edit failed:', error.message);
      if (error.error) console.error('   detail:', JSON.stringify(error.error));
      throw new Error(`Image editing failed: ${error.message}`);
    }
  }
}

module.exports = { OpenAIProvider };
