// Shared URL validation utilities
const validateUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    // Basic validation: must have protocol and hostname
    return parsedUrl.protocol && parsedUrl.hostname;
  } catch (error) {
    return false;
  }
};

export { validateUrl };