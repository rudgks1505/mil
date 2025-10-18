import { configureStore } from "@reduxjs/toolkit";
import loaderSlice from "@/store/loaderSlice";
import genreSlic from "@/store/genreSlice";

export const store = configureStore({
    reducer: {
        loader: loaderSlice,
        genre: genreSlic,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
