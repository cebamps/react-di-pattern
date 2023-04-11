import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import { reduxDiReducer } from "./redux-di/slice";

export const store = configureStore({
  reducer: {
    reduxDi: reduxDiReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
