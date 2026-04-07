# 🚀 Quick Start Guide

## Step 1: Get Your API Key

### Option A: OpenAI (Recommended)
1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to API Keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Option B: Stability AI
1. Go to https://platform.stability.ai
2. Sign up or log in
3. Navigate to API Keys
4. Generate new key
5. Copy the key

## Step 2: Setup Environment

1. Navigate to backend directory:
   ```powershell
   cd backend
   ```

2. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

3. Edit `.env` and add your API key:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

## Step 3: Install & Run

### Automatic Setup (Recommended)
```powershell
.\setup.ps1
```

### Manual Setup
```powershell
# Install backend dependencies
cd backend
npm install

# Start the server
npm start

# Or for development mode:
npm run dev
```

### From Root Directory
```powershell
# Install
npm run setup

# Run production
npm start

# Run development
npm run dev
```

## Step 4: Use the Application

1. Open your browser to: **http://localhost:3000**
2. Upload an image
3. Write a prompt describing what to edit
4. Click "Edit Image with AI"
5. Wait 10-30 seconds
6. Download your edited image!

## 📝 Example Prompts

Try these:
- "Change the red car to a blue sports car"
- "Replace the wooden chair with a modern black office chair"  
- "Make the person's shirt green instead of red"
- "Change the sky to sunset colors"

## 🆘 Troubleshooting

**Server won't start?**
- Check if Node.js is installed: `node --version`
- Check if port 3000 is available
- Make sure you ran `npm install`

**"API key not set" error?**
- Create `.env` file from `.env.example`
- Add your actual API key
- Restart the server

**Image editing fails?**
- Verify API key is valid
- Check your API credits/balance
- Try a simpler, more specific prompt
- Check image is < 10MB and valid format

## 💡 Tips for Best Results

1. **Be Specific**: "blue Tesla Model 3" vs "blue car"
2. **Describe Clearly**: Include colors, styles, materials
3. **One Object at a Time**: Focus on editing one thing per request
4. **Good Lighting**: Use well-lit images for better AI recognition

---

**Need more help?** Click the "Help" link in the app footer!
