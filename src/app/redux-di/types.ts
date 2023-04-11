import { Action } from "@reduxjs/toolkit";

import { RootState } from "../store";

export type DiContext = {
  selectValue: (state: RootState) => number;
  increment: () => Action;
  decrement: () => Action;
};
