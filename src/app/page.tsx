'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ACTIONS = [
  { icon: 'event', label: 'Agenda', to: '/agenda', description: 'Próximas apresentações' },
  { icon: 'article', label: 'Blog', to: '/blog', description: 'Notícias e galeria' },
  { icon: 'info', label: 'Sobre', to: '/sobre', description: 'História da banda' },
  { icon: 'login', label: 'Área interna', to: '/login', description: 'Entrar com seu perfil' },
] as const;

const AUTH_ACTIONS = [
  { icon: 'dashboard', label: 'Painel', to: '/gestao', description: 'Módulos do seu perfil' },
  { icon: 'library_music', label: 'Músicas', to: '/gestao/musicas', description: 'Repertório e partituras' },
  { icon: 'event', label: 'Agenda', to: '/agenda', description: 'Apresentações' },
  { icon: 'article', label: 'Blog', to: '/blog', description: 'Portal público' },
] as const;

const GALLERY = [
  { src: '/imgs/img1.jpg', alt: 'Banda Carmelitana Luminarense' },
  { src: '/imgs/img2.jpg', alt: 'Apresentação da Banda' },
  { src: '/imgs/img3.jpg', alt: 'Momentos da Banda' },
  { src: '/imgs/img4.jpg', alt: 'Tradição e música' },
] as const;

const HISTORY = [
  { year: '1894', text: 'Músicos tocando inspirados no entardecer entre as montanhas.' },
  { year: '1910', text: 'Criação da Associação Carmelitana Luminarense.' },
  { year: 'Hoje', text: 'Mais de um século de história e presença em Luminárias.' },
] as const;

const YT_IDS = ['TbUGOc36r9s', 'zgNL45Nl1qA', 'eTjkMqHKOvo', 'sldhCGZ-KgQ', 'jaFIxhNqYnw'];

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function HomePage() {
  const { isLoggedIn, isHydrated } = useAuth();
  // Math.random() na renderização geraria ordens diferentes no servidor e no
  // cliente. Mantemos a ordem fixa até hidratar e só então embaralhamos.
  const shuffledGallery = useMemo(() => (isHydrated ? shuffle(GALLERY) : GALLERY), [isHydrated]);
  const shuffledVideos = useMemo(() => (isHydrated ? shuffle(YT_IDS) : YT_IDS), [isHydrated]);
  const quickActions = isLoggedIn ? AUTH_ACTIONS : PUBLIC_ACTIONS;

  return (
    
    <div className="max-w-12xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div
        className="text-center mb-12 py-16 px-6 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'url(/imgs/img1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/logo.png"
              alt="Logo Banda Carmelitana"
              width={96}
              height={96}
              className="rounded-full"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Banda Carmelitana Luminarense
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Mais de um século de tradição musical em Luminárias, mantendo viva a cultura e a arte da música.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            href={action.to}
            className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <span className="material-icons text-3xl text-primary group-hover:text-primary transition-colors">
                  {action.icon}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Gallery */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Momentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shuffledGallery.map((img, i) => (
            <div key={i} className="aspect-square relative overflow-hidden rounded-lg shadow-sm">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">História</h2>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="space-y-4">
            {HISTORY.map((item, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-20">
                  <span className="text-lg font-semibold text-primary">{item.year}</span>
                </div>
                <p className="text-card-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Videos */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Vídeos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shuffledVideos.slice(0, 3).map((id, i) => (
            <div key={i} className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                title={`Vídeo ${i + 1}`}
                className="w-full h-full rounded-lg shadow-sm"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
