import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Bunker OS",
  description: "Agentic operations platform", // ürün-seviyesi; tenant markası config'ten gelir
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#0b0e14",
          color: "#e6e6e6",
        }}
      >
        {children}
      </body>
    </html>
  );
}
