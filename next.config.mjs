/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone çıktı → Docker imajı küçük ve bağımsız çalışır.
  output: "standalone",
  reactStrictMode: true,
  // Worker ile paylaşılan node-only paketler (googleapis, postgres) bundle'a girmesin.
  serverExternalPackages: ["postgres", "googleapis"],
  // ESM-stili `./x.js` import'ları .ts kaynağa çözülsün (tsx/NodeNext ile uyumlu konvansiyon).
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
