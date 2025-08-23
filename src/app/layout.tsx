import "./globals.css";
import Navvar from '../components/navvar/navvar';

interface RootLayoutProps {
  children: React.ReactNode;
}


export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Navvar></Navvar>
        <div className="layout">
          {children}
        </div>
      </body>
    </html>
  );
}
