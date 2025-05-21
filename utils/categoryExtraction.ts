import { ProductCategory } from './store';

/**
 * Category Extraction
 * This module provides functions to detect product categories from URLs and product data
 */

// Keywords associated with different product categories
const categoryKeywords = {
  [ProductCategory.TOP]: [
    'shirt', 'tshirt', 't-shirt', 'top', 'blouse', 'sweater', 'sweatshirt', 
    'hoodie', 'tank', 'cardigan', 'jacket', 'blazer', 'pullover', 'polo'
  ],
  [ProductCategory.BOTTOM]: [
    'pant', 'trouser', 'jean', 'denim', 'short', 'skirt', 'legging', 'jogger',
    'chino', 'cargo', 'capri', 'culottes'
  ],
  [ProductCategory.DRESS]: [
    'dress', 'gown', 'jumpsuit', 'romper', 'playsuit', 'overall'
  ],
  [ProductCategory.SHOE]: [
    'shoe', 'sneaker', 'sandal', 'boot', 'heel', 'flat', 'loafer', 'slipper',
    'trainer', 'footwear', 'espadrille', 'oxford'
  ],
  [ProductCategory.ACCESSORY]: [
    'accessory', 'hat', 'bag', 'purse', 'wallet', 'belt', 'scarf', 'glove',
    'jewel', 'necklace', 'ring', 'bracelet', 'earring', 'watch', 'sunglasses',
    'glasses', 'sock', 'tights', 'handbag', 'backpack', 'clutch'
  ]
};

/**
 * Attempts to determine product category from a product title and URL
 */
export const extractProductCategory = (
  title: string = '',
  url: string = '',
  jsonLdData: string = ''
): ProductCategory => {
  // Normalize input to lowercase for consistent matching
  const normalizedTitle = title.toLowerCase();
  const normalizedUrl = url.toLowerCase();
  const normalizedJsonLd = jsonLdData.toLowerCase();
  
  // Combine all text for keyword matching
  const allText = `${normalizedTitle} ${normalizedUrl} ${normalizedJsonLd}`;
  
  // Check for category keywords in all the text
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      // Check for whole word match to avoid partial matches 
      // (e.g., "shirt" in "t-shirt")
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(allText)) {
        return category as ProductCategory;
      }
    }
  }
  
  // Check URL patterns for category hints
  if (normalizedUrl.includes('/clothing/tops') || normalizedUrl.includes('/shirts')) {
    return ProductCategory.TOP;
  } else if (normalizedUrl.includes('/clothing/bottoms') || normalizedUrl.includes('/pants')) {
    return ProductCategory.BOTTOM;
  } else if (normalizedUrl.includes('/clothing/dresses')) {
    return ProductCategory.DRESS;
  } else if (normalizedUrl.includes('/shoes') || normalizedUrl.includes('/footwear')) {
    return ProductCategory.SHOE;
  } else if (normalizedUrl.includes('/accessories')) {
    return ProductCategory.ACCESSORY;
  }
  
  // Default to OTHER if no category can be determined
  return ProductCategory.OTHER;
};