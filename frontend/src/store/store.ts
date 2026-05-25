import { configureStore } from "@reduxjs/toolkit";
import { householdApi } from "@/store/householdApi";

export const store = configureStore({
  reducer: {
    [householdApi.reducerPath]: householdApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(householdApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;