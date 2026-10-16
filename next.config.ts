import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem isso o Next bloqueia /_next/* quando o celular acessa o dev server
  // pelo IP da rede local, o React não hidrata e os onClick não respondem.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  // Arquivos lidos em runtime pelas rotas de mock e do PDF do livro.
  outputFileTracingIncludes: {
    '/bcl-api': ['./src/domains/seed/mock-api.json'],
    '/bcl-api/[[...path]]': ['./src/domains/seed/mock-api.json'],
    '/historia/livro': ['./src/assets/**/*.pdf'],
  },
  // Pacotes CommonJS / browser-only usados só no cliente (modo estudo).
  serverExternalPackages: [
    "@music-i18n/musicxml-player",
    "opensheetmusicdisplay",
  ],
};

export default nextConfig;
