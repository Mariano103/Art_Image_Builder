const { OpenAIProvider } = require('./openaiProvider');
const { StabilityAIProvider } = require('./stabilityProvider');
const { GeminiProvider } = require('./geminiProvider');

// AI Provider Factory - Modular design for easy provider switching
class AIProviderFactory {
  static getProvider(providerName) {
    const provider = providerName || process.env.AI_PROVIDER || 'openai';
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'gemini':
        return new GeminiProvider();
      case 'stability':
        return new StabilityAIProvider();
      default:
        throw new Error(`Unknown AI provider: ${provider}. Available: openai, gemini, stability`);
    }
  }
}

module.exports = { AIProviderFactory };
