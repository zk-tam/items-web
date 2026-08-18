"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  artistName: string;
  name: string;
  priceLabels: string[];
  quantity: number;
  slug: string;
  thumbnail: string | null;
  thumbnailAlt: string;
};

export type CartItemInput = Omit<CartItem, "quantity">;

type CartState = {
  items: CartItem[];
  addItem: (item: CartItemInput) => void;
  decrementItem: (slug: string) => void;
  incrementItem: (slug: string) => void;
  removeItem: (slug: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((entry) => entry.slug === item.slug);
        if (!existingItem) {
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }

        return {
          items: state.items.map((entry) => entry.slug === item.slug ? { ...entry, quantity: entry.quantity + 1 } : entry)
        };
      }),
      decrementItem: (slug) => set((state) => ({
        items: state.items.flatMap((item) => {
          if (item.slug !== slug) return [item];
          if (item.quantity <= 1) return [];
          return [{ ...item, quantity: item.quantity - 1 }];
        })
      })),
      incrementItem: (slug) => set((state) => ({
        items: state.items.map((item) => item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item)
      })),
      removeItem: (slug) => set((state) => ({
        items: state.items.filter((item) => item.slug !== slug)
      }))
    }),
    {
      name: "items-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items })
    }
  )
);
