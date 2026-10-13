import Link from 'next/link';
import Image from 'next/image';
import { PortalPageHeader } from '@/components/public/PortalPageHeader';

const TIMELINE = [
  {
    year: '1894',
    text: 'Músicos locais inspirados pelo entardecer entre as montanhas dão origem à tradição que a banda mantém viva.',
  },
  {
    year: '1910',
    text: 'Criação da Associação Carmelitana Luminarense, consolidando ensino, ensaios e presença na cidade.',
  },
  {
    year: 'Hoje',
    text: 'Formação de alunos, repertório variado e apresentações que conectam gerações em Luminárias e região.',
  },
] as const;

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:py-12">
      <PortalPageHeader
        title="Sobre a banda"
        description="A Banda Carmelitana Luminarense une tradição, formação musical e vida associativa. Este portal é a vitrine pública; a gestão interna fica na área logada, conforme cada perfil."
        actions={
          <Link href="/" className="btn-outline-primary inline-flex min-h-11 items-center gap-1 px-4 text-sm">
            <span className="material-icons text-lg" aria-hidden>
              home
            </span>
            Início
          </Link>
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]">
          <Image src="/imgs/img4.jpg" alt="Banda Carmelitana Luminarense" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div className="space-y-4 text-base leading-relaxed text-[var(--muted)]">
          <p>
            Somos uma instituição musical enraizada em Luminárias, com ensaios, concertos e projetos educativos que
            envolvem a comunidade. O portal público reúne agenda, blog e informações institucionais para quem quer
            acompanhar a banda de perto.
          </p>
          <p>
            Alunos e músicos utilizam o modo de estudo com partitura e áudio; maestros e administradores cuidam de
            pessoas, repertório, patrimônio e comunicação interna.
          </p>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Linha do tempo</h2>
        <ul className="mt-6 space-y-4">
          {TIMELINE.map((item) => (
            <li
              key={item.year}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:gap-6"
            >
              <span className="shrink-0 text-lg font-bold text-[var(--color-brand-strong)] sm:w-24">{item.year}</span>
              <p className="text-[var(--foreground)]">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <Link
          href="/agenda"
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 no-underline shadow-[var(--shadow-soft)] hover:no-underline"
        >
          <span className="material-icons text-3xl text-[var(--primary)]" aria-hidden>
            event
          </span>
          <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Agenda pública</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">Datas, locais e descrições dos próximos eventos.</p>
        </Link>
        <Link
          href="/blog"
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 no-underline shadow-[var(--shadow-soft)] hover:no-underline"
        >
          <span className="material-icons text-3xl text-[var(--primary)]" aria-hidden>
            article
          </span>
          <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Blog</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">Matérias, galerias e avisos para a comunidade.</p>
        </Link>
      </section>
    </div>
  );
}
