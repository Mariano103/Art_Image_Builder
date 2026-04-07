// Global state
let currentImage = null;
let editHistory = [];
let currentEditedImageUrl = null;

// DOM Elements
const elements = {
  uploadArea: document.getElementById('uploadArea'),
  imageInput: document.getElementById('imageInput'),
  uploadPlaceholder: document.getElementById('uploadPlaceholder'),
  imagePreviewContainer: document.getElementById('imagePreviewContainer'),
  imagePreview: document.getElementById('imagePreview'),
  changeImageBtn: document.getElementById('changeImageBtn'),
  modelSelect: document.getElementById('modelSelect'),
  qualitySelect: document.getElementById('qualitySelect'),
  qualitySelector: document.getElementById('qualitySelector'),
  promptInput: document.getElementById('promptInput'),
  editBtn: document.getElementById('editBtn'),
  editBtnText: document.getElementById('editBtnText'),
  resetBtn: document.getElementById('resetBtn'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  resultsSection: document.getElementById('resultsSection'),
  resultImage: document.getElementById('resultImage'),
  downloadBtn: document.getElementById('downloadBtn'),
  editAgainBtn: document.getElementById('editAgainBtn'),
  errorMessage: document.getElementById('errorMessage'),
  errorText: document.getElementById('errorText'),
  errorClose: document.getElementById('errorClose'),
  aboutLink: document.getElementById('aboutLink'),
  helpLink: document.getElementById('helpLink'),
  apiLink: document.getElementById('apiLink'),
  aboutModal: document.getElementById('aboutModal'),
  helpModal: document.getElementById('helpModal'),
  aboutModalClose: document.getElementById('aboutModalClose'),
  helpModalClose: document.getElementById('helpModalClose')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  checkAPIStatus();
  loadEditHistory();
});

// Event Listeners
function initializeEventListeners() {
  // Upload area click
  elements.uploadArea.addEventListener('click', (e) => {
    if (e.target === elements.changeImageBtn || e.target.closest('.change-image-btn')) {
      return;
    }
    elements.imageInput.click();
  });

  // Drag and drop
  elements.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.add('drag-over');
  });

  elements.uploadArea.addEventListener('dragleave', () => {
    elements.uploadArea.classList.remove('drag-over');
  });

  elements.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      showError('Please drop a valid image file (JPEG, PNG, or WEBP)');
    }
  });

  // File input change
  elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  });

  // Change image button
  elements.changeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.imageInput.click();
  });

  // Model select - show/hide quality selector
  elements.modelSelect.addEventListener('change', () => {
    elements.qualitySelector.style.display = elements.modelSelect.value === 'openai' ? 'block' : 'none';
  });

  // Prompt input
  elements.promptInput.addEventListener('input', validateForm);

  // Edit button
  elements.editBtn.addEventListener('click', handleEditImage);

  // Reset button
  elements.resetBtn.addEventListener('click', resetApplication);

  // Download button
  elements.downloadBtn.addEventListener('click', downloadEditedImage);

  // Edit again button
  elements.editAgainBtn.addEventListener('click', () => {
    elements.resultsSection.style.display = 'none';
    elements.promptInput.value = '';
    elements.promptInput.focus();
    validateForm();
  });

  // Error close
  elements.errorClose.addEventListener('click', hideError);

  // Modal triggers
  elements.aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    elements.aboutModal.style.display = 'flex';
  });

  elements.helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    elements.helpModal.style.display = 'flex';
  });

  elements.apiLink.addEventListener('click', (e) => {
    e.preventDefault();
    checkAPIStatus(true);
  });

  // Modal close buttons
  elements.aboutModalClose.addEventListener('click', () => {
    elements.aboutModal.style.display = 'none';
  });

  elements.helpModalClose.addEventListener('click', () => {
    elements.helpModal.style.display = 'none';
  });

  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === elements.aboutModal) {
      elements.aboutModal.style.display = 'none';
    }
    if (e.target === elements.helpModal) {
      elements.helpModal.style.display = 'none';
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape to close modals
    if (e.key === 'Escape') {
      elements.aboutModal.style.display = 'none';
      elements.helpModal.style.display = 'none';
      hideError();
    }
    
    // Ctrl/Cmd + Enter to edit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !elements.editBtn.disabled) {
      handleEditImage();
    }
  });
}

// Handle image upload
function handleImageUpload(file) {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showError('Invalid file type. Please upload JPEG, PNG, or WEBP images only.');
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showError('File is too large. Maximum size is 10MB.');
    return;
  }

  currentImage = file;

  // Preview image using object URL (instant, no reading needed)
  const objectUrl = URL.createObjectURL(file);
  elements.imagePreview.src = objectUrl;
  elements.uploadPlaceholder.style.display = 'none';
  elements.imagePreviewContainer.style.display = 'block';
  elements.resultsSection.style.display = 'none';
  validateForm();
}

// Validate form
function validateForm() {
  const hasImage = currentImage !== null;
  const hasPrompt = elements.promptInput.value.trim().length > 0;
  
  elements.editBtn.disabled = !(hasImage && hasPrompt);
}

// Handle image editing
async function handleEditImage() {
  if (!currentImage || !elements.promptInput.value.trim()) {
    showError('Please upload an image and provide a prompt.');
    return;
  }

  const prompt = elements.promptInput.value.trim();

  // Show loading
  elements.loadingOverlay.style.display = 'flex';
  elements.editBtn.disabled = true;
  elements.resultsSection.style.display = 'none';
  hideError();

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('image', currentImage);
    formData.append('prompt', prompt);
    formData.append('provider', elements.modelSelect.value);
    if (elements.modelSelect.value === 'openai') {
      formData.append('quality', elements.qualitySelect.value);
    }

    // Call API
    const response = await fetch('/api/edit-image', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to edit image');
    }

    // Display result
    displayEditedImage(data);

    // Save to history
    saveToHistory({
      prompt,
      resultUrl: data.imageUrl || data.imageData,
      provider: data.provider,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Edit error:', error);
    showError(error.message || 'Failed to edit image. Please try again.');
  } finally {
    elements.loadingOverlay.style.display = 'none';
    elements.editBtn.disabled = false;
  }
}

// Display edited image
function displayEditedImage(data) {
  if (data.imageUrl) {
    // OpenAI returns URL
    elements.resultImage.src = data.imageUrl;
    currentEditedImageUrl = data.imageUrl;
  } else if (data.imageData) {
    // Stability AI returns base64
    elements.resultImage.src = `data:image/png;base64,${data.imageData}`;
    currentEditedImageUrl = `data:image/png;base64,${data.imageData}`;
  }

  elements.resultsSection.style.display = 'block';
  
  // Smooth scroll to results
  setTimeout(() => {
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// Download edited image
async function downloadEditedImage() {
  if (!currentEditedImageUrl) {
    showError('No edited image to download');
    return;
  }

  try {
    elements.downloadBtn.disabled = true;
    elements.downloadBtn.innerHTML = '<span class="btn-icon">⏳</span> Downloading...';

    let blob;
    
    if (currentEditedImageUrl.startsWith('data:')) {
      // Base64 data
      const base64Data = currentEditedImageUrl.split(',')[1];
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: 'image/png' });
    } else {
      // URL
      const response = await fetch(currentEditedImageUrl);
      blob = await response.blob();
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-edited-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Reset button
    setTimeout(() => {
      elements.downloadBtn.disabled = false;
      elements.downloadBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Edited Image
      `;
    }, 1000);

  } catch (error) {
    console.error('Download error:', error);
    showError('Failed to download image. Please try again.');
    elements.downloadBtn.disabled = false;
  }
}

// Reset application
function resetApplication() {
  currentImage = null;
  currentEditedImageUrl = null;
  
  elements.imageInput.value = '';
  elements.promptInput.value = '';
  elements.imagePreview.src = '';
  elements.resultImage.src = '';
  
  elements.uploadPlaceholder.style.display = 'block';
  elements.imagePreviewContainer.style.display = 'none';
  elements.resultsSection.style.display = 'none';
  
  hideError();
  validateForm();
}

// Error handling
function showError(message) {
  elements.errorText.textContent = message;
  elements.errorMessage.style.display = 'flex';
  
  // Auto-hide after 8 seconds
  setTimeout(hideError, 8000);
}

function hideError() {
  elements.errorMessage.style.display = 'none';
}

// Check API status
async function checkAPIStatus(showAlert = false) {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    if (data.status === 'ok' && showAlert) {
      alert(`✅ API Status: Connected\n🤖 Provider: ${data.provider.toUpperCase()}\n⏰ Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    }
  } catch (error) {
    if (showAlert) {
      showError('Cannot connect to server. Please ensure the server is running.');
    }
  }
}

// History management (localStorage)
function saveToHistory(edit) {
  try {
    editHistory.unshift(edit);
    
    // Keep only last 10 edits
    if (editHistory.length > 10) {
      editHistory = editHistory.slice(0, 10);
    }
    
    // Don't save large base64 data to localStorage (just save metadata)
    const historyToSave = editHistory.map(item => ({
      prompt: item.prompt,
      provider: item.provider,
      timestamp: item.timestamp
    }));
    
    localStorage.setItem('editHistory', JSON.stringify(historyToSave));
  } catch (error) {
    console.warn('Failed to save history:', error);
  }
}

function loadEditHistory() {
  try {
    const saved = localStorage.getItem('editHistory');
    if (saved) {
      const history = JSON.parse(saved);
      // Just load metadata, not full images
      console.log('Edit history loaded:', history.length, 'items');
    }
  } catch (error) {
    console.warn('Failed to load history:', error);
  }
}

// Utility functions
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Keyboard accessibility
elements.promptInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!elements.editBtn.disabled) {
      handleEditImage();
    }
  }
});

// Loading animation text rotation
const loadingTexts = [
  'AI is analyzing your image...',
  'Identifying the target object...',
  'Applying your edits...',
  'Preserving image quality...',
  'Almost done...'
];

let loadingTextIndex = 0;
let loadingInterval = null;

function startLoadingAnimation() {
  loadingTextIndex = 0;
  const loadingTextEl = document.querySelector('.loading-text');
  
  if (loadingTextEl) {
    loadingInterval = setInterval(() => {
      loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;
      loadingTextEl.textContent = loadingTexts[loadingTextIndex];
    }, 3000);
  }
}

function stopLoadingAnimation() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

// Enhanced loading overlay
const originalLoadingDisplay = elements.loadingOverlay.style.display;
const originalDisplaySetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');

// Intercept loading overlay display changes
const loadingObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target === elements.loadingOverlay) {
      const display = window.getComputedStyle(elements.loadingOverlay).display;
      if (display !== 'none') {
        startLoadingAnimation();
      } else {
        stopLoadingAnimation();
      }
    }
  });
});

loadingObserver.observe(elements.loadingOverlay, {
  attributes: true,
  attributeFilter: ['style']
});

// Image preview zoom functionality (optional enhancement)
elements.imagePreview.addEventListener('click', () => {
  if (elements.imagePreview.classList.contains('zoomed')) {
    elements.imagePreview.classList.remove('zoomed');
  } else {
    elements.imagePreview.classList.add('zoomed');
  }
});

elements.resultImage.addEventListener('click', () => {
  if (elements.resultImage.classList.contains('zoomed')) {
    elements.resultImage.classList.remove('zoomed');
  } else {
    elements.resultImage.classList.add('zoomed');
  }
});

// Console greeting
console.log('%c🎨 AI Image Editor', 'color: #4F46E5; font-size: 20px; font-weight: bold;');
console.log('%cPowered by AI • Edit specific objects with precision', 'color: #6B7280; font-size: 12px;');
