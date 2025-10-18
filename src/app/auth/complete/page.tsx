'use client';

import styles from "../page.module.css";
import { useRouter } from 'next/navigation';

export default function Page(): React.ReactElement {

    const router = useRouter();

    return (
        <>
            <h1>회원가입이 완료되었습니다.</h1>
            <p>&nbsp;</p>
            <div className={styles.btnCon}>
                <button onClick={() => { router.push('/') }}>홈으로</button>
            </div>
        </>
    )
};