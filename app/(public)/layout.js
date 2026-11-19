import Footer from "@/components/layout/Footer";
import PublicNav from "@/components/layout/PublicNav";

export default function layout({ children }) {
  return (
    <>
      <PublicNav />
      <main className="relative flex flex-col flex-1 bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100">
        {children}
      </main>
      <Footer/>
    </>
  );
}
