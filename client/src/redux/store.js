import { configureStore } from "@reduxjs/toolkit";
import errorReducer from "./errorAlert/errorSlice";
import userReducer from "./user/userSlice";

export default configureStore({
  reducer: {
    error: errorReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
