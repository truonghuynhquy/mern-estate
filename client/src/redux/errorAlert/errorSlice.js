import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  success: null,
};

const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
  },
});

export const { setLoading, setError, setSuccess } = errorSlice.actions;
export default errorSlice.reducer;
