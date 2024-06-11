import { combineReducers, configureStore } from "@reduxjs/toolkit";
import errorReducer from "./errorAlert/errorSlice";
import userReducer from "./user/userSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Kết hợp các reducer lại với nhau
const rootReducer = combineReducers({
  user: userReducer,
  error: errorReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
