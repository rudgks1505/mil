import Admnav from '@/components/adm/navvar/navvar';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <>
            <Admnav></Admnav>
            {children}
        </>
    );
}
