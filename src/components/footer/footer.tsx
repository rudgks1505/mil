import styles from "./footer.module.css";

export default function Page() {
    return (
        <div className={styles.con}>
            <div>
                <p>Next.js 15 · Supabase · Vercel</p>
                <p><span>Email: rudgks1505@gmail.com ·</span>&nbsp;
                    <a
                        href="https://github.com/rudgks1505/milpor"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub: https://github.com/rudgks1505/milpor
                    </a>
                </p>
            </div>
        </div >
    );
}
