import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ActivityIndicator,
  Dimensions,
  Animated as RNAnimated
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, PlusCircle, ShoppingBag } from 'lucide-react-native';
import { useOutfitStore, ProductCategory, ProductItem } from '@/utils/store';
import { getAffiliateUrl, isProductPage } from '@/utils/affiliate';
import { extractProductCategory } from '@/utils/categoryExtraction';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';

// Web scraping script to extract product data from the page
const EXTRACT_PRODUCT_SCRIPT = `
  (function() {
    // Try to get product data from JSON-LD
    let jsonLdData = '';
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLdScripts.length > 0) {
      jsonLdData = jsonLdScripts[0].textContent || '';
    }

    // Get the main product image
    let productImage = '';
    // Try open graph image first
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      productImage = ogImage.getAttribute('content') || '';
    } 
    // Fallback to first large image
    if (!productImage) {
      const images = Array.from(document.querySelectorAll('img')).filter(img => {
        const { width, height } = img.getBoundingClientRect();
        return width > 200 && height > 200;
      });
      if (images.length > 0) {
        productImage = images[0].src;
      }
    }
    
    // Get product name
    let productName = '';
    // Try open graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      productName = ogTitle.getAttribute('content') || '';
    }
    // Fallback to page title
    if (!productName) {
      productName = document.title;
    }
    
    // Get product price
    let productPrice = '';
    // Look for price elements
    const possiblePriceElements = document.querySelectorAll('[class*="price"], [id*="price"], .price, #price');
    for (const element of possiblePriceElements) {
      const text = element.textContent.trim();
      if (/[$£€]\\s*\\d+(\\.\\d{2})?/.test(text)) {
        productPrice = text;
        break;
      }
    }
    
    // Return the extracted data
    return {
      imageUrl: productImage,
      name: productName,
      price: productPrice,
      jsonLdData: jsonLdData
    };
  })();
`;

export default function WebViewScreen() {
  const params = useLocalSearchParams();
  const { url, name, logo } = params;
  
  const [currentUrl, setCurrentUrl] = useState(url as string);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isProductDetected, setIsProductDetected] = useState(false);
  
  const webViewRef = useRef(null);
  const { addItem, getTotalItemCount } = useOutfitStore();
  const itemCount = getTotalItemCount();
  
  const tooltipOpacity = useRef(new RNAnimated.Value(0)).current;
  
  useEffect(() => {
    // Show tooltip after a short delay on first render
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true);
      RNAnimated.timing(tooltipOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Hide tooltip after a few seconds
      const hideTimer = setTimeout(() => {
        RNAnimated.timing(tooltipOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          setShowTooltip(false);
        });
      }, 5000);
      
      return () => clearTimeout(hideTimer);
    }, 1500);
    
    return () => clearTimeout(tooltipTimer);
  }, []);
  
  // Handle URL changes and convert to affiliate links
  const handleNavigationStateChange = async (navState) => {
    const newUrl = navState.url;
    
    // Only process if URL has changed
    if (newUrl !== currentUrl) {
      setCurrentUrl(newUrl);
      
      // Check if this is a product page
      const isProduct = isProductPage(newUrl);
      setIsProductDetected(isProduct);
      
      // Get affiliate URL if needed
      try {
        const affiliateUrl = await getAffiliateUrl(newUrl);
        
        // Only reload if the URL has changed to avoid infinite loops
        if (affiliateUrl !== newUrl) {
          webViewRef.current?.injectJavaScript(
            `window.location.href = "${affiliateUrl}";`
          );
        }
      } catch (error) {
        console.error('Failed to get affiliate URL:', error);
      }
    }
    
    setIsLoading(navState.loading);
  };
  
  // Add current product to outfit
  const addToOutfit = async () => {
    if (!webViewRef.current) return;
    
    try {
      // Extract product data using injected JavaScript
      webViewRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage(JSON.stringify(${EXTRACT_PRODUCT_SCRIPT}));
        true;
      `);
    } catch (error) {
      console.error('Failed to extract product data:', error);
      setSnackbarMessage('Failed to add product. Please try again.');
      setShowSnackbar(true);
    }
  };
  
  // Handle messages from the WebView
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Get affiliate URL for this product
      const affiliateUrl = await getAffiliateUrl(currentUrl);
      
      // Determine product category
      const category = extractProductCategory(
        data.name, 
        currentUrl,
        data.jsonLdData
      );
      
      // Create product item
      const productItem: ProductItem = {
        id: '', // Will be assigned by the store
        name: data.name || 'Product',
        imageUrl: data.imageUrl || logo as string, // Fallback to store logo
        price: data.price || '$0.00',
        category,
        storeName: name as string,
        storeLogo: logo as string,
        productUrl: currentUrl,
        affiliateUrl,
      };
      
      // Add to outfit store
      addItem(productItem);
      
      // Show success message
      setSnackbarMessage('✅ Added to Outfit Builder');
      setShowSnackbar(true);
      
      // Hide snackbar after a few seconds
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error handling WebView message:', error);
      setSnackbarMessage('Failed to add product. Please try again.');
      setShowSnackbar(true);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Image 
            source={{ uri: logo as string }} 
            style={styles.storeLogo}
            resizeMode="contain"
          />
          <Text style={styles.title} numberOfLines={1}>
            {name as string}
          </Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.webViewContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF385C" />
          </View>
        )}
        
        {Platform.OS === 'web' ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafbfc' }}>
            <Text style={{ color: '#FF385C', fontWeight: '600', fontSize: 16, textAlign: 'center', padding: 32 }}>
              In-app WebView is not supported on web preview.\n\nPlease use the Expo Go app or a real device to browse stores in-app.
            </Text>
            <TouchableOpacity style={{ marginTop: 16, backgroundColor: '#FF385C', borderRadius: 8, padding: 12 }} onPress={() => router.back()}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Back to Stores</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            style={styles.webView}
          />
        )}
      </View>
      
      {/* Floating Add to Outfit button */}
      {isProductDetected && Platform.OS !== 'web' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addToOutfit}
        >
          <PlusCircle size={24} color="#FFF" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Add to Outfit</Text>
        </TouchableOpacity>
      )}
      
      {/* First tap tooltip */}
      {showTooltip && Platform.OS !== 'web' && (
        <RNAnimated.View 
          style={[
            styles.tooltip,
            { opacity: tooltipOpacity }
          ]}
        >
          <Text style={styles.tooltipText}>
            Tap to save this item to your Outfit Builder
          </Text>
        </RNAnimated.View>
      )}
      
      {/* Snackbar notification */}
      {showSnackbar && Platform.OS !== 'web' && (
        <Animated.View 
          style={styles.snackbar}
          entering={SlideInUp.duration(300)}
          exiting={SlideOutDown.duration(300)}
        >
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
        </Animated.View>
      )}
      
      {/* Outfit Tray Button */}
      <TouchableOpacity 
        style={styles.outfitTrayButton}
        onPress={() => router.push('/outfit')}
      >
        <ShoppingBag size={20} color="#FFF" />
        <Text style={styles.outfitTrayText}>Outfit Builder</Text>
        {itemCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{itemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  storeLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF99',
    zIndex: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tooltip: {
    position: 'absolute',
    bottom: 140,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: 180,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
  snackbar: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snackbarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  outfitTrayButton: {
    position: 'absolute',
    bottom: 16,
    left: width / 2 - 85,
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  outfitTrayText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#FFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  countText: {
    color: '#FF385C',
    fontSize: 12,
    fontWeight: '600',
  },
});