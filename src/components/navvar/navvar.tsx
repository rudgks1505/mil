import Link from 'next/link';
import styles from "./navvar.module.css";
import Member from '@/components/navvar/member/member';

export default function Page() {


    return (
        <>
            <div className={styles.con_wrap}>
                <div className={styles.con}>
                    <ul className={styles.con_ul}>
                        <li><Link href="/">홈</Link></li>
                        <Member></Member>
                        <li><Link href="/adm">관리자페이지</Link></li>
                    </ul>
                </div>
            </div>
        </>
    );
}
