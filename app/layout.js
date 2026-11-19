import Providers from "@/providers/Providers";
import "./globals.css";
import "react-day-picker/style.css";

export const metadata = {
  title: "Hotel Proj",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
