'use client';

import styles from "./search.module.css";
import { useState } from 'react';

type ChildProps = {
    onChildSearch: (value: string) => void;
    holder: string
};

export default function Page({ onChildSearch, holder }: ChildProps) {

    const [search, setSearch] = useState<string>('');

    const searchSend = () => {
        if (!search) {
            alert('검색어를 입력해주세요.');
            return
        }
        onChildSearch(search);
    };

    return (
        <>
            <div className={styles.inpCon}>
                <input onChange={(event) => {
                    setSearch(event.target.value)
                }}
                    type="text"
                    value={search}
                    placeholder={holder}
                />
                <button onClick={searchSend}>찾기</button>
            </div>
        </>
    );
}
