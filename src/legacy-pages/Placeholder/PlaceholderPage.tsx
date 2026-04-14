import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="px-4 py-8 md:py-16 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 max-w-2xl mb-6">
        Esta área ainda não foi portada do app Angular; rota e shell já estão
        configurados.
      </p>
      <Link to="/home" className="inline-block text-primary font-medium hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
