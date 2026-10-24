import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  genericName?: string;
  category?: string;
  price: number;
  costPrice?: number;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discountPercent: number;
  taxPercent: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD';
}

const initialState: CartState = {
  items: [],
  discountPercent: 0,
  taxPercent: 0,
  customerName: '',
  customerPhone: '',
  paymentMethod: 'CASH',
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        if (existing.quantity < existing.stock) {
          existing.quantity += 1;
        }
      } else {
        if (action.payload.stock > 0) {
          state.items.push({ ...action.payload, quantity: 1 });
        }
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        const safeQty = Math.max(1, Math.min(action.payload.quantity, existing.stock));
        existing.quantity = safeQty;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.discountPercent = 0;
      state.customerName = '';
      state.customerPhone = '';
    },
    setCustomerInfo: (
      state,
      action: PayloadAction<{ name?: string; phone?: string; paymentMethod?: CartState['paymentMethod'] }>
    ) => {
      if (action.payload.name !== undefined) state.customerName = action.payload.name;
      if (action.payload.phone !== undefined) state.customerPhone = action.payload.phone;
      if (action.payload.paymentMethod !== undefined)
        state.paymentMethod = action.payload.paymentMethod;
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discountPercent = Math.max(0, Math.min(100, action.payload));
    },
    setTax: (state, action: PayloadAction<number>) => {
      state.taxPercent = Math.max(0, Math.min(100, action.payload));
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCustomerInfo,
  setDiscount,
  setTax,
} = cartSlice.actions;

export default cartSlice.reducer;
