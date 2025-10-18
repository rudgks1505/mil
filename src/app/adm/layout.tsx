import Admnav from '@/components/adm/navvar/navvar';
import AuthChangeWrapper from '@/components/AuthChangeWrapper/AuthChangeWrapper';

interface RootLayoutProps {
    children: React.ReactNode;
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
