import styles from "./page.module.css";
import Image from 'next/image';
import AuthChangeWrapper from '@/components/AuthChangeWrapper/AuthChangeWrapper';
import type { ReactNode } from "react";

interface RootLayoutProps {
    children: ReactNode;
}
export default function RootLayout({ children }: RootLayoutProps) {

    return (
        <>
            <style>
                {`
            .layout{max-width:none !important; padding:0 !important;}
            .nav{display:none !important;}
            `}
            </style>

            <div className={styles.con}>
                <div className={styles.loginImg}>
                    <Image
                        src='/login.jpg'
                        alt="로그인"
                        fill
                    />
                </div>
                <div className={styles.loginCon}>
                    {children}
                </div>
            </div>
            <AuthChangeWrapper />
        </>
    )
};