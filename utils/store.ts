import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Product categories
export enum ProductCategory {
  TOP = 'Tops',
  BOTTOM = 'Bottoms',
  DRESS = 'Dresses',
  SHOE = 'Shoes',
  ACCESSORY = 'Accessories',
  OTHER = 'Other',
}

// Product item interface
export interface ProductItem {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  category: ProductCategory;
  storeName: string;
  storeLogo: string;
  productUrl: string;
  affiliateUrl?: string;
  isSelected?: boolean;
}

// Store state interface
interface OutfitState {
  items: ProductItem[];
  
  // Actions
  addItem: (item: ProductItem) => void;
  removeItem: (id: string) => void;
  toggleSelected: (id: string, category: ProductCategory) => void;
  toggleMultipleAllowed: (category: ProductCategory, allowed: boolean) => void;
  clearSelectedItems: () => void;
  getItemsByCategory: (category: ProductCategory) => ProductItem[];
  getSelectedItems: () => ProductItem[];
  getTotalItemCount: () => number;
  
  // Multiple selection settings
  multipleAllowed: Record<ProductCategory, boolean>;
}

// Create the store
export const useOutfitStore = create<OutfitState>()(
  persist(
    (set, get) => ({
      items: [],
      multipleAllowed: {
        [ProductCategory.TOP]: false,
        [ProductCategory.BOTTOM]: false,
        [ProductCategory.DRESS]: false,
        [ProductCategory.SHOE]: false,
        [ProductCategory.ACCESSORY]: false,
        [ProductCategory.OTHER]: false,
      },
      
      // Add a new item to the outfit
      addItem: (item) => {
        const newItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isSelected: false,
        };
        
        set((state) => ({
          items: [...state.items, newItem],
        }));
        
        return newItem.id;
      },
      
      // Remove an item from the outfit
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      // Toggle item selection, respecting category rules
      toggleSelected: (id, category) => {
        const { items, multipleAllowed } = get();
        const allowMultiple = multipleAllowed[category];
        
        set({
          items: items.map((item) => {
            // If this is the item being toggled
            if (item.id === id) {
              return { ...item, isSelected: !item.isSelected };
            }
            
            // If multiple selection is not allowed for this category
            // and this item is in the same category as the one being toggled
            // and the clicked item is being selected (not deselected)
            const clickedItem = items.find((i) => i.id === id);
            if (
              !allowMultiple &&
              item.category === category &&
              clickedItem &&
              !clickedItem.isSelected &&
              item.id !== id
            ) {
              return { ...item, isSelected: false };
            }
            
            return item;
          }),
        });
      },
      
      // Toggle whether multiple items can be selected in a category
      toggleMultipleAllowed: (category, allowed) => {
        set((state) => ({
          multipleAllowed: {
            ...state.multipleAllowed,
            [category]: allowed,
          },
        }));
      },
      
      // Clear all selected items
      clearSelectedItems: () => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, isSelected: false })),
        }));
      },
      
      // Get items by category
      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category);
      },
      
      // Get selected items
      getSelectedItems: () => {
        return get().items.filter((item) => item.isSelected);
      },
      
      // Get total count of items
      getTotalItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'outfit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);