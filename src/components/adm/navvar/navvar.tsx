import Link from 'next/link';
import styles from "./navvar.module.css";

export default function Page() {
    return (
        <>
            <div className={styles.con}>
                <ul>
                    <li><Link href="/adm/mainvisual">Mainvisual</Link></li>
                    <li><Link href="/adm">관리자페이지</Link></li>
                </ul>
            </div>
        </>
    );
}
