import Link from 'next/link';
import styles from "./navvar.module.css";

export default function Page() {
    return (
        <>
            <div className={styles.con}>
                <ul>
                    <li><Link href="/adm/mainvisual">Mainvisual</Link></li>
                    <li><Link href="/adm/books">Books</Link></li>
                    <li><Link href="/adm/bookCovers">BookCovers</Link></li>
                    <li><Link href="/adm/chapters">Chapters</Link></li>
                    <li><Link href="/adm/member">Member</Link></li>
                </ul>
            </div>
        </>
    );
}
