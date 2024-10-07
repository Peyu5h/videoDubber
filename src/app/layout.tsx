import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import { MantineProvider } from "@/components/MantineProvider";
import { Notifications } from "@mantine/notifications";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider>
          <Notifications w={400} autoClose={2000} />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
