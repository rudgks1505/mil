'use client';

import styles from "../page.module.css";
import { useRouter } from 'next/navigation';
import { UuidUpdate } from "@/lib/adm/utils";
import Search from "@/components/search/search";


export default function Page() {

    const router = useRouter();
    const { uuidUpdate } = UuidUpdate();


    const handleChildSearch = (val: string) => {
        handleSubmit(val);
    }

    const handleSubmit = async (val: string) => {
        try {
            if (!val) {
                alert('검색어를 입력해주세요');
                return
            }
            if (!Number(val)) {
                alert('숫자를 입력해주세요');
                return
            }
            const uuid = await uuidUpdate(Number(val));
            if (!uuid) throw new Error('유효성 검사 실패');

            router.push(`/adm/chapters/${uuid}`);
        } catch (err: unknown) {
            if (err instanceof Error) alert(err.message);
            else console.error(err);
            return
        };

    };




    return (
        <>
            <div className={styles.con} style={{ padding: '100px 50px' }}>
                <Search onChildSearch={handleChildSearch} holder='책 고유번호를 입력해주세요'></Search>
            </div>

        </>
    );
}
