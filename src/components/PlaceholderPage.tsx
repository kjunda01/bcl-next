interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="px-4 py-8 md:py-16 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 max-w-2xl mb-6">
        Esta área ainda não foi portada do app Angular; rota e shell já estão
        configurados.
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="material-icons text-yellow-400">info</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Em desenvolvimento
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Esta funcionalidade está sendo migrada para a nova versão do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}