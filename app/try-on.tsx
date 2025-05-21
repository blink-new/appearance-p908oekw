import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions,
  Share
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, RefreshCw, Share2, Bookmark } from 'lucide-react-native';
import { useOutfitStore } from '@/utils/store';
import Animated, { FadeIn } from 'react-native-reanimated';

// Mock AI generation service
// In a real app, this would call an AI service API
const generateOutfitImage = async (selectedItems) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Return a placeholder image URL
  // In a real implementation, this would be the URL of the generated image
  return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470&h=2000&fit=crop';
};

export default function TryOnScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  
  const { getSelectedItems } = useOutfitStore();
  const selectedItems = getSelectedItems();
  
  useEffect(() => {
    generateTryOnImage();
  }, []);
  
  const generateTryOnImage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const imageUrl = await generateOutfitImage(selectedItems);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error('Error generating outfit image:', err);
      setError('Failed to generate try-on image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSharePress = async () => {
    if (!generatedImage) return;
    
    try {
      await Share.share({
        message: 'Check out my outfit from apPEERance!',
        url: generatedImage,
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };
  
  const handleSavePress = () => {
    // In a real app, this would save the image to a user's saved collection
    // For demo purposes, we'll just show a console log
    console.log('Saved outfit to collection:', generatedImage);
  };
  
  const handleTryAgainPress = () => {
    router.push('/outfit');
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
        <Text style={styles.headerTitle}>Your Styled Look</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF385C" />
            <Text style={styles.loadingText}>Styling your look...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={generateTryOnImage}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View 
            style={styles.imageContainer}
            entering={FadeIn.duration(500)}
          >
            <Image 
              source={{ uri: generatedImage }}
              style={styles.generatedImage}
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </View>
      
      {!isLoading && !error && (
        <>
          <View style={styles.toolbar}>
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleSavePress}
            >
              <Bookmark size={24} color="#333" />
              <Text style={styles.toolbarButtonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleSharePress}
            >
              <Share2 size={24} color="#333" />
              <Text style={styles.toolbarButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleTryAgainPress}
            >
              <RefreshCw size={24} color="#333" />
              <Text style={styles.toolbarButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerText}>
            Powered by AI fashion styling
          </Text>
        </>
      )}
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF385C',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: width,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  toolbarButton: {
    alignItems: 'center',
    padding: 8,
  },
  toolbarButtonText: {
    marginTop: 6,
    fontSize: 12,
    color: '#333333',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
});