import Admnav from '@/components/adm/navvar/navvar';
import AuthChangeWrapper from '@/components/AuthChangeWrapper/AuthChangeWrapper';
import type { ReactNode } from "react";

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <>
            <Admnav></Admnav>
            {children}
            <AuthChangeWrapper />
        </>
    );
}
