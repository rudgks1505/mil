import "./globals.css";
import Navvar from '../components/navvar/navvar';
import Loader from '../components/loader/loader';
import { Providers } from "@/components/providers";
import Footer from "@/components/footer/footer";

interface RootLayoutProps {
  children: React.ReactNode;
}


export default function RootLayout({ children }: RootLayoutProps) {

  return (
    <html lang="en">
      <body>
        <Navvar></Navvar>
        <div className="layout">
          <Providers>
            <Loader></Loader>
            {children}
          </Providers>
        </div>
        <Footer></Footer>
      </body>
    </html>
  );
}
