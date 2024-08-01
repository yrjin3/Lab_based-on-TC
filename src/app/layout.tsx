import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { ConfigProvider } from "antd";

export const metadata = {
  title: "자막번역",
  description: "TC 기반 자막 페이지",
  icons: {
    icon: "/images/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <link rel="icon" href="/images/favicon.svg" sizes="any" />
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              components: {},
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
