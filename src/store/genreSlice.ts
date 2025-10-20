import { createSlice } from "@reduxjs/toolkit";


interface LoaderState {
    genres: { value: string, label: string }[];
}

const initialState: LoaderState = {
    genres: [
        { value: "판타지", label: "판타지" },
        { value: "SF", label: "SF" },
        { value: "로맨스", label: "로맨스" },
        { value: "미스터리", label: "미스터리" },
        { value: "스릴러", label: "스릴러" },
        { value: "호러", label: "호러" },
        { value: "역사소설", label: "역사소설" },
        { value: "성장소설", label: "성장소설" },
        { value: "드라마", label: "드라마" },
        { value: "철학", label: "철학" },
        { value: "무협", label: "무협" },
        { value: "라이트노벨", label: "라이트노벨" },
    ],
};

const genreSlice = createSlice({
    name: "genres",
    initialState,
    reducers: {},
});


export default genreSlice.reducer;
