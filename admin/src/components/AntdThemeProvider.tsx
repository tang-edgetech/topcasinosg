"use client";

import { ConfigProvider, App as AntApp, theme as antdTheme } from "antd";
import { useThemeContext } from "@/lib/theme-context";

// Maps our Figma-extracted brand tokens into antd's theme so its components
// (Table, Form, Upload, DatePicker, ...) read as part of the same design
// system instead of stock antd-blue bolted on top. Algorithm switches with
// the same light/dark state that drives our Tailwind `.dark` class.
export default function AntdThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeContext();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1a1e71", // primary-900
          colorLink: "#38439e", // primary-600
          colorLinkHover: "#2f3a92", // primary-700
          colorInfo: "#1a1e71",
          colorError: "#ff4553", // danger
          colorSuccess: "#00bb9e", // success
          colorWarning: "#f7b500", // secondary-600
          borderRadius: 6,
          fontFamily: "var(--font-figtree), sans-serif",
        },
      }}
    >
      {/* antd's App context — required for the static message/notification/
          Modal APIs to consume the ConfigProvider theme above instead of
          antd's own defaults. */}
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
