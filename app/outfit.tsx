import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useOutfitStore, ProductCategory } from '@/utils/store';
import { X, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInUp, SlideInRight, SlideOutRight } from 'react-native-reanimated';

export default function OutfitBuilder() {
  const { 
    items, 
    getItemsByCategory, 
    removeItem, 
    toggleSelected,
    toggleMultipleAllowed,
    multipleAllowed,
    getSelectedItems,
    clearSelectedItems
  } = useOutfitStore();
  
  const categories = Object.values(ProductCategory);
  
  // Check if any items are selected
  const hasSelectedItems = getSelectedItems().length > 0;
  
  const handleTryOnPress = () => {
    if (hasSelectedItems) {
      router.push('/try-on');
    }
  };
  
  const handleReset = () => {
    clearSelectedItems();
  };
  
  // Render a category section if it has items
  const renderCategory = (category: ProductCategory) => {
    const categoryItems = getItemsByCategory(category);
    
    if (categoryItems.length === 0) return null;
    
    return (
      <Animated.View 
        key={category}
        entering={FadeInUp.delay(100).duration(300)}
        style={styles.categorySection}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>
            {category} ({categoryItems.length})
          </Text>
          <View style={styles.categoryControls}>
            <Text style={styles.multipleText}>Allow multiple</Text>
            <Switch
              value={multipleAllowed[category]}
              onValueChange={(value) => toggleMultipleAllowed(category, value)}
              trackColor={{ false: '#d0d0d0', true: '#c2e0ff' }}
              thumbColor={multipleAllowed[category] ? '#FF385C' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemsRow}
        >
          {categoryItems.map((item) => (
            <Animated.View
              key={item.id}
              entering={SlideInRight.duration(300)}
              exiting={SlideOutRight.duration(300)}
              layout
            >
              <TouchableOpacity
                style={[
                  styles.itemCard,
                  item.isSelected && styles.selectedItemCard
                ]}
                onPress={() => toggleSelected(item.id, item.category)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <Image 
                    source={{ uri: item.storeLogo }} 
                    style={styles.storeLogoSmall}
                    resizeMode="contain"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <X size={16} color="#FFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Outfit</Text>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleReset}
        >
          <RefreshCw size={20} color="#777" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Your outfit builder is empty. Browse stores and add items to create your outfit!
            </Text>
          </View>
        ) : (
          categories.map((category) => renderCategory(category))
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          Select one item per category, then tap Try On Outfit
        </Text>
        <TouchableOpacity 
          style={[
            styles.tryOnButton,
            !hasSelectedItems && styles.disabledButton
          ]}
          onPress={handleTryOnPress}
          disabled={!hasSelectedItems}
        >
          <Text style={styles.tryOnButtonText}>Try On Outfit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  categoryControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  multipleText: {
    fontSize: 12,
    color: '#777777',
    marginRight: 8,
  },
  itemsRow: {
    paddingBottom: 8,
  },
  itemCard: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  selectedItemCard: {
    borderWidth: 2,
    borderColor: '#FF385C',
  },
  itemImage: {
    width: '100%',
    height: 120,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  storeLogoSmall: {
    width: 20,
    height: 20,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerHint: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 12,
  },
  tryOnButton: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tryOnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 24,
  },
});