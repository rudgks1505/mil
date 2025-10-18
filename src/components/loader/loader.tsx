"use client"

import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { on, off } from "@/store/loaderSlice";
import { useEffect } from 'react';


export default function Page() {

    const dispatch = useAppDispatch();
    const loader = useAppSelector((state) => state.loader.value);

    useEffect(() => {
        dispatch(off());
    }, [])


    return (
        <>
            {loader == 1 && (
                <div className="loaderWrap">
                    <div className="loader"></div>
                </div>
            )}
        </>
    );
}
