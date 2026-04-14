import type { InstrumentInfo } from '../study/studyUtils';

type Props = {
  available: InstrumentInfo[];
  selectedIds: string[];
  filtered: InstrumentInfo[];
  selectionMatchesApplied: boolean;
  filter: string;
  loading: boolean;
  xmlLoaded: boolean;
  allSelected: boolean;
  onFilterChange: (v: string) => void;
  onToggle: (id: string, checked: boolean) => void;
  onSelectOnly: (id: string) => void;
  onSelectAllChange: (checked: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
  onRestore: () => void;
  onClose: () => void;
};

export function StudyInstrumentPanel({
  available,
  selectedIds,
  filtered,
  selectionMatchesApplied,
  filter,
  loading,
  xmlLoaded,
  allSelected,
  onFilterChange,
  onToggle,
  onSelectOnly,
  onSelectAllChange,
  onApply,
  onCancel,
  onRestore,
  onClose,
}: Props) {
  if (available.length < 1 || !xmlLoaded) return null;

  const selectedSet = new Set(selectedIds);
  const indeterminate =
    selectedIds.length > 0 && selectedIds.length < available.length;

  return (
    <div className="flex flex-col h-full min-h-0 px-0 overflow-hidden bg-white">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-100">
        <h2 className="m-0 text-base font-semibold text-gray-900">Instrumentos</h2>
        <button type="button" className="inline-flex items-center justify-center w-10 h-10 rounded-full border-0 bg-transparent cursor-pointer text-gray-700 hover:bg-gray-200" onClick={onClose} aria-label="Recolher menu">
          <span className="material-icons">chevron_left</span>
        </button>
      </header>

      <div className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-gray-600">
        {selectedIds.length} / {available.length}
      </div>

      <div className="flex-shrink-0 flex flex-wrap gap-2 px-4 pb-3">
        {!selectionMatchesApplied ? (
          <>
            <button
              type="button"
              className="px-3.5 py-2 rounded-lg bg-primary text-white font-medium text-xs cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onApply}
              disabled={loading || !xmlLoaded}
            >
              Gerar com selecionados
            </button>
            <button type="button" className="px-3.5 py-2 rounded-lg bg-white border border-gray-300 font-medium text-xs cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="px-3.5 py-2 rounded-lg bg-white border border-gray-300 font-medium text-xs cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onRestore}
          disabled={loading || !xmlLoaded || selectionMatchesApplied}
        >
          Restaurar
        </button>
      </div>

      <label className="flex-shrink-0 flex flex-col gap-1 px-4 pb-2">
        <span className="text-xs font-medium text-gray-700">Buscar instrumento</span>
        <input
          type="search"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Ex: sax, trompete"
          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </label>

      <div className={`flex-1 min-h-0 overflow-auto px-4 pb-4 flex flex-col gap-1.5 border border-gray-300 rounded-2xl m-4 bg-white ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2 px-1.5 py-1 border-b border-gray-200 mb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = indeterminate;
              }}
              onChange={(e) => onSelectAllChange(e.target.checked)}
              disabled={loading || !xmlLoaded}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Selecionar todos</span>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="px-2 py-2 text-sm text-gray-600">Nenhum instrumento encontrado.</div>
        ) : null}

        {filtered.map((instrument) => (
          <div key={instrument.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-gray-100">
            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selectedSet.has(instrument.id)}
                onChange={(e) => onToggle(instrument.id, e.target.checked)}
                disabled={loading || !xmlLoaded}
                className="w-4 h-4 flex-shrink-0"
              />
              <span className="flex items-center gap-2">
                <img src={`/${instrument.iconPath}`} alt={instrument.title} className="w-5 h-5 object-contain" />
                <span className="text-sm text-gray-700">{instrument.name}</span>
              </span>
            </label>
            <button
              type="button"
              className="text-xs bg-transparent border-0 text-primary cursor-pointer flex-shrink-0 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => onSelectOnly(instrument.id)}
              disabled={loading || !xmlLoaded}
            >
              Somente este
            </button>
          </div>
        ))}
      </div>

      {loading ? <div className="flex-shrink-0 px-4 pb-4 text-xs text-gray-600">Aplicando seleção...</div> : null}
    </div>
  );
}
