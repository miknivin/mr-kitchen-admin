// src/redux/features/couponSlice.js
import { createSlice } from '@reduxjs/toolkit';

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    showModal: false,
  },
  reducers: {
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
  },
});

export const { setShowModal } = couponSlice.actions;
export default couponSlice.reducer;