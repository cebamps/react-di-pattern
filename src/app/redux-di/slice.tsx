import { combineReducers, createSlice } from "@reduxjs/toolkit";

import { RootState } from "../store";

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

const makeCounterSlice = (name: string) =>
  createSlice({
    name: `redux-di/${name}/counter`,
    initialState,
    reducers: {
      increment: (state) => {
        state.value += 1;
      },
      decrement: (state) => {
        state.value -= 1;
      },
    },
  });

const slice = {
  a: makeCounterSlice("A"),
  b: makeCounterSlice("B"),
};

export const selectReduxDiState = (state: RootState) => state.reduxDi;
export const selectACount = (state: RootState) => state.reduxDi.a.value;
export const selectBCount = (state: RootState) => state.reduxDi.b.value;

export const reduxDiReducer = combineReducers({
  a: slice.a.reducer,
  b: slice.b.reducer,
});

export const { increment: incrementA, decrement: decrementA } = slice.a.actions;
export const { increment: incrementB, decrement: decrementB } = slice.b.actions;
