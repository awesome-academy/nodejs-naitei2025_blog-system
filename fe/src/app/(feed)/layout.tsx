import Navbar from "@/components/navbar/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4 gap-5 grid">{children}</main>
    </>
  );
}
