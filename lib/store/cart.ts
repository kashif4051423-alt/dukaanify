import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types/models'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  // Items keyed by businessSlug so carts are isolated per store
  items: Record<string, CartItem[]>

  addItem: (slug: string, product: Product) => void
  removeItem: (slug: string, productId: string) => void
  updateQuantity: (slug: string, productId: string, quantity: number) => void
  clearCart: (slug: string) => void

  // Derived helpers
  getItems: (slug: string) => CartItem[]
  getCount: (slug: string) => number
  getTotal: (slug: string) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      addItem(slug, product) {
        set((state) => {
          const current = state.items[slug] ?? []
          const existing = current.find((i) => i.product.id === product.id)
          const updated = existing
            ? current.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, product.stock_quantity) }
                  : i
              )
            : [...current, { product, quantity: 1 }]
          return { items: { ...state.items, [slug]: updated } }
        })
      },

      removeItem(slug, productId) {
        set((state) => ({
          items: {
            ...state.items,
            [slug]: (state.items[slug] ?? []).filter((i) => i.product.id !== productId),
          },
        }))
      },

      updateQuantity(slug, productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(slug, productId)
          return
        }
        set((state) => ({
          items: {
            ...state.items,
            [slug]: (state.items[slug] ?? []).map((i) =>
              i.product.id === productId
                ? { ...i, quantity: Math.min(quantity, i.product.stock_quantity) }
                : i
            ),
          },
        }))
      },

      clearCart(slug) {
        set((state) => ({ items: { ...state.items, [slug]: [] } }))
      },

      getItems(slug) {
        return get().items[slug] ?? []
      },

      getCount(slug) {
        return (get().items[slug] ?? []).reduce((sum, i) => sum + i.quantity, 0)
      },

      getTotal(slug) {
        return (get().items[slug] ?? []).reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        )
      },
    }),
    {
      name: 'dukaanify-cart',
      // Only persist the items map
      partialize: (state) => ({ items: state.items }),
    }
  )
)
