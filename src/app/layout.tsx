import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "./globals.css";
import { MantineProvider } from "@/components/MantineProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
