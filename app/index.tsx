import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Sample store data
const STORES = [
  { id: '1', name: 'Zara', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/2560px-Zara_Logo.svg.png', url: 'https://www.zara.com/' },
  { id: '2', name: 'ASOS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Asos_logo.svg/2560px-Asos_logo.svg.png', url: 'https://www.asos.com/' },
  { id: '3', name: 'H&M', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png', url: 'https://www2.hm.com/' },
  { id: '4', name: 'Mango', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Mango_%28retailer%29_logo.svg/2560px-Mango_%28retailer%29_logo.svg.png', url: 'https://shop.mango.com/' },
  { id: '5', name: 'Uniqlo', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/1280px-UNIQLO_logo.svg.png', url: 'https://www.uniqlo.com/' },
  { id: '6', name: 'Topshop', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Topshop_logo.svg/2560px-Topshop_logo.svg.png', url: 'https://us.topshop.com/' },
  { id: '7', name: 'Urban Outfitters', logo: 'https://1000logos.net/wp-content/uploads/2020/04/Urban-Outfitters-Logo.png', url: 'https://www.urbanoutfitters.com/' },
  { id: '8', name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/2560px-Logo_NIKE.svg.png', url: 'https://www.nike.com/' },
  { id: '9', name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png', url: 'https://www.adidas.com/' },
];

export default function StoreGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredStores = STORES.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStorePress = (store) => {
    router.push({
      pathname: '/webview',
      params: { 
        url: store.url,
        name: store.name,
        logo: store.logo
      }
    });
  };

  const renderStoreItem = ({ item, index }) => {
    const animationDelay = index * 100;
    
    return (
      <Animated.View 
        entering={FadeInUp.delay(animationDelay).duration(400)}
        style={styles.storeCardContainer}
      >
        <TouchableOpacity 
          style={styles.storeCard} 
          onPress={() => handleStorePress(item)}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: item.logo }} 
              style={styles.storeLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.storeName}>{item.name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop by Store</Text>
        <TouchableOpacity style={styles.searchIcon}>
          <Search color="#333" size={24} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredStores}
        renderItem={renderStoreItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.storeGrid}
        showsVerticalScrollIndicator={false}
      />
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
  searchIcon: {
    padding: 6,
  },
  storeGrid: {
    padding: 12,
  },
  storeCardContainer: {
    width: '50%',
    padding: 8,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    height: 160,
  },
  logoContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeLogo: {
    width: '80%',
    height: '80%',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
});