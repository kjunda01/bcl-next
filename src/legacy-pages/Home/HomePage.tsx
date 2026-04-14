import { useMemo } from 'react';
import { Link } from 'react-router-dom';

const QUICK_ACTIONS = [
  { icon: 'menu_book', label: 'Partituras', to: '/study', description: 'Estudar e praticar' },
  { icon: 'school', label: 'Alunos', to: '/students', description: 'Cadastro de alunos' },
  { icon: 'library_music', label: 'Repertório', to: '/songs', description: 'Músicas e repertório' },
  { icon: 'photo_library', label: 'Galeria', to: '/gallery-view', description: 'Fotos e vídeos' },
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

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function HomePage() {
  const videos = useMemo(() => shuffle([...YT_IDS]).slice(0, 4), []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-screen ml-[calc(50%-50vw)] min-h-[52vh] flex items-center overflow-x-clip" aria-labelledby="hero-title">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover" src="/imgs/img1.jpg" alt="" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 to-black/55" />
        </div>
        <div className="relative z-10 w-full px-4 py-12 center max-w-4xl mx-auto text-center">
          <div className="max-w-2xl text-white drop-shadow-lg flex flex-col items-center gap-4">
            <img src="/assets/logo.png" alt="" className="block mb-4 drop-shadow-2xl w-30 h-30" width={120} height={120} />
            <h1 id="hero-title" className="m-0 mb-2 text-4xl md:text-5xl font-bold text-white">
              Banda Carmelitana Luminarense
            </h1>
            <p className="m-0 mb-6 opacity-95 text-lg">Desde 1894 · Cultura e patrimônio de Luminárias, MG</p>
            <div className="flex flex-wrap gap-3">
              <Link 
                to="/study" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-primary text-white no-underline border-2 border-transparent hover:opacity-90"
              >
                <span className="material-icons">menu_book</span>
                Partituras
              </Link>
              <Link 
                to="/songs" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-white/15 text-white border-2 border-white/60 no-underline backdrop-blur hover:bg-white/25"
              >
                <span className="material-icons">library_music</span>
                Repertório
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Quick Actions */}
        <section className="py-8" aria-labelledby="quick-heading">
          <h2 id="quick-heading" className="text-2xl font-semibold my-8">
            Acesso rápido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <Link 
                key={a.to}
                to={a.to}
                className="flex flex-col gap-1.5 p-5 rounded-2xl border border-gray-200 bg-white text-gray-700 no-underline shadow-sm hover:shadow-lg hover:translate-y-[-2px] transition-all duration-150"
                aria-label={a.label}
              >
                <span className="material-icons text-4xl text-primary">{a.icon}</span>
                <span className="font-semibold text-lg">{a.label}</span>
                <span className="text-sm text-gray-600">{a.description}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section className="py-8" aria-labelledby="gallery-heading">
          <h2 id="gallery-heading" className="text-2xl font-semibold my-8">
            Momentos
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl">Alguns registros da nossa história e das nossas apresentações.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY.map((item) => (
              <div key={item.src} className="rounded-2xl overflow-hidden relative aspect-video">
                <img src={item.src} alt={item.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs text-white bg-gradient-to-t from-black/70 to-transparent">{item.alt}</div>
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        <section className="py-8" aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-2xl font-semibold my-8">
            Nossa História
          </h2>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <div className="rounded-2xl overflow-hidden">
              <img src="/imgs/img2.jpg" alt="Banda Carmelitana Luminarense" className="w-full rounded-2xl object-cover" />
            </div>
            <div className="space-y-4">
              {HISTORY.map((h) => (
                <div key={h.year} className="mb-4">
                  <span className="inline-block font-bold text-primary mr-2">{h.year}</span>
                  <p className="text-gray-700">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Videos */}
        <section className="py-8" aria-labelledby="videos-heading">
          <h2 id="videos-heading" className="text-2xl font-semibold my-8">
            Vídeos
          </h2>
          <p className="text-gray-600 mb-6">Seleção do canal no YouTube.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((id) => (
              <div key={id} className="rounded-2xl overflow-hidden bg-black aspect-video">
                <iframe
                  title={`YouTube ${id}`}
                  src={`https://www.youtube.com/embed/${id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
