import Link from 'next/link';
import styles from "./navvar.module.css";
import Member from '@/components/navvar/member/member';

export default function Page() {


    return (
        <>
            <div className={`${styles.con_wrap} nav`}>
                <div className={styles.con}>
                    <ul className={styles.con_ul}>
                        <li><Link href="/">홈</Link></li>
                        <li><Link href="/search">검색</Link></li>
                    </ul>
                    <ul className={styles.con_ul}>
                        <Member></Member>
                    </ul>
                </div>
            </div>
        </>
    );
}
