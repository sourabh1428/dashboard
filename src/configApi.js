// API key management functions
export function getApiKey() {
  const apiKey = localStorage.getItem('apiKey');
  // Return either the stored key or a default for development (should be removed in production)
  return apiKey || 'dev-default-key-123';
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem('apiKey', key);
    return true;
  }
  return false;
}

export function clearApiKey() {
  localStorage.removeItem('apiKey');
}

