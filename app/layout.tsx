import "./globals.css";
export const metadata = { title: "FST Assignment 2" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><main>{children}</main></body></html>;
}
