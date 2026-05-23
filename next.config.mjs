/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export para Firebase Hosting (la app es 100% client-side).
  output: "export",
  // Firebase Hosting sirve archivos estáticos sin el optimizador de imágenes de Next.
  images: { unoptimized: true },
  // Genera /ruta/index.html en vez de /ruta.html (mejor con Hosting).
  trailingSlash: true,
  // No bloquear el build si hay warnings de ESLint en CI.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
