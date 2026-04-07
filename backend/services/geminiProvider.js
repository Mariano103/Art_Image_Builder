const { GoogleGenAI } = require('@google/genai');
const sharp = require('sharp');
const fs = require('fs');

// Gemini Nano Banana 2 Image Editing Provider
// Uses gemini-3.1-flash-image-preview (Nano Banana 2) for image editing
class GeminiProvider {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.model = 'gemini-3.1-flash-image-preview';
  }

  async editImage(imagePath, prompt, userMaskPath = null) {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Gemini Image Edit (${this.model})`);
      console.log(`  prompt: "${prompt}"`);

      // Convert image to PNG base64
      const imageBuffer = await sharp(imagePath)
        .toFormat('png')
        .toBuffer();

      const base64Image = imageBuffer.toString('base64');
      console.log(`  image size: ${(imageBuffer.length / 1024).toFixed(0)} KB`);

      // Build contents array: text prompt + image
      const contents = [
        { text: prompt },
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png'
          }
        }
      ];

      // If mask provided, add it too
      if (userMaskPath) {
        const maskBuffer = await sharp(userMaskPath)
          .toFormat('png')
          .toBuffer();
        contents.push({
          inlineData: {
            data: maskBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        });
        console.log('  using user-provided mask');
      } else {
        console.log('  no mask — model will determine what to edit from prompt');
      }

      console.log('🚀 Sending to Gemini Nano Banana 2 …');

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: contents,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        }
      });

      // Extract image from response parts
      let dataUrl = null;
      let responseText = '';

      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
          if (part.text) {
            responseText += part.text;
          } else if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      if (!dataUrl) {
        throw new Error('No image returned from Gemini. The model may have refused the request or returned only text.');
      }

      if (responseText) {
        console.log(`  model said: "${responseText.substring(0, 100)}..."`);
      }

      console.log('✅ Done');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return {
        success: true,
        imageUrl: dataUrl,
        provider: 'gemini',
        model: this.model
      };
    } catch (error) {
      console.error('❌ Edit failed:', error.message);
      if (error.error) console.error('   detail:', JSON.stringify(error.error));
      throw new Error(`Image editing failed: ${error.message}`);
    }
  }
}

module.exports = { GeminiProvider };
