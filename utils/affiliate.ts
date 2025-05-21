/**
 * Affiliate URL Manager
 * This module handles the transformation of regular URLs into affiliate URLs
 * by appending tracking parameters.
 */

// In a real application, this would call an actual API
// For demo purposes, we'll simulate the API call with a local function
export const getAffiliateUrl = async (originalUrl: string): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // Parse the URL
    const url = new URL(originalUrl);
    
    // Add affiliate tracking parameters
    // In a real implementation, this would be handled by the backend
    url.searchParams.append('utm_source', 'apPEERance');
    url.searchParams.append('utm_medium', 'app');
    url.searchParams.append('utm_campaign', 'outfit_builder');
    
    // Some stores have specific affiliate parameter formats
    if (url.hostname.includes('asos')) {
      url.searchParams.append('affid', 'APP12345');
    } else if (url.hostname.includes('zara')) {
      url.searchParams.append('partner', 'APP12345');
    } else if (url.hostname.includes('hm')) {
      url.searchParams.append('affiliate', 'APP12345');
    } else {
      // Generic affiliate code for other stores
      url.searchParams.append('aff', 'APP12345');
    }
    
    return url.toString();
  } catch (error) {
    console.error('Error generating affiliate URL:', error);
    // If there's an error, return the original URL as fallback
    return originalUrl;
  }
};

// Function to determine if a URL is a product page
export const isProductPage = (url: string): boolean => {
  const productIdentifiers = [
    '/product/', 
    '/item/', 
    '/pd/', 
    '/shop/', 
    'productid=',
    '/products/',
    '/p/'
  ];
  
  return productIdentifiers.some(identifier => url.includes(identifier));
};