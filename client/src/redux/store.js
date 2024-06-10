import { configureStore } from "@reduxjs/toolkit";
import errorReducer from "./errorAlert/errorSlice";

export default configureStore({
  reducer: {
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
