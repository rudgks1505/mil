import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoaderState {
    value: number;
}

const initialState: LoaderState = { value: 0 };

const loaderSlice = createSlice({
    name: "loader",
    initialState,
    reducers: {
        on: (state) => { state.value = 1 },
        off: (state) => { state.value = 0 },
    },
});

export const { on, off } = loaderSlice.actions;
export default loaderSlice.reducer;
