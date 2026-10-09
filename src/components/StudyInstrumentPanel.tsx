import type { InstrumentInfo } from '../study/studyUtils';

type Props = {
  available: InstrumentInfo[];
  selectedIds: string[];
  midiSelectedIds: string[];
  filtered: InstrumentInfo[];
  selectionMatchesApplied: boolean;
  filter: string;
  loading: boolean;
  xmlLoaded: boolean;
  allSelected: boolean;
  midiAllSelected: boolean;
  onFilterChange: (v: string) => void;
  onToggle: (id: string, checked: boolean) => void;
  onToggleMidi: (id: string, checked: boolean) => void;
  onSelectAllChange: (checked: boolean) => void;
  onSelectAllMidiChange: (checked: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
  onRestore: () => void;
  onClose: () => void;
};

export function StudyInstrumentPanel({
  available,
  selectedIds,
  midiSelectedIds,
  filtered,
  selectionMatchesApplied,
  filter,
  loading,
  xmlLoaded,
  allSelected,
  midiAllSelected,
  onFilterChange,
  onToggle,
  onToggleMidi,
  onSelectAllChange,
  onSelectAllMidiChange,
  onApply,
  onCancel,
  onRestore,
  onClose,
}: Props) {
  if (available.length < 1 || !xmlLoaded) return null;

  const selectedSet = new Set(selectedIds);
  const midiSelectedSet = new Set(midiSelectedIds);
  const indeterminate =
    selectedIds.length > 0 && selectedIds.length < available.length;
  const midiIndeterminate =
    midiSelectedIds.length > 0 && midiSelectedIds.length < available.length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--card)] text-[var(--foreground)]">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card-secondary)] px-4 py-3">
        <h2 className="m-0 text-base font-semibold">Instrumentos</h2>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--secondary)]" onClick={onClose} aria-label="Recolher menu">
          <span className="material-icons">chevron_left</span>
        </button>
      </header>

      <div className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-[var(--muted)]">
        Pauta {selectedIds.length}/{available.length} · MIDI {midiSelectedIds.length}/{available.length}
      </div>

      <div className="flex-shrink-0 flex flex-wrap gap-2 px-4 pb-3">
        {!selectionMatchesApplied ? (
          <>
            <button
              type="button"
              className="btn-primary min-h-11 text-xs disabled:cursor-not-allowed"
              onClick={onApply}
              disabled={loading || !xmlLoaded}
            >
              Gerar com selecionados
            </button>
            <button type="button" className="btn-outline-primary min-h-11 text-xs disabled:cursor-not-allowed" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="btn-outline-primary min-h-11 text-xs disabled:cursor-not-allowed"
          onClick={onRestore}
          disabled={loading || !xmlLoaded || selectionMatchesApplied}
        >
          Restaurar
        </button>
      </div>

      <label className="flex-shrink-0 flex flex-col gap-1 px-4 pb-2">
        <span className="text-xs font-medium text-[var(--muted)]">Buscar instrumento</span>
        <input
          type="search"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Ex: sax, trompete"
          className="w-full text-sm"
        />
      </label>

      <div className={`m-4 flex min-h-0 flex-1 flex-col gap-1.5 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 pb-4 ${loading ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="mb-1 grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-2 border-b border-[var(--border)] px-1.5 py-2 text-xs font-medium text-[var(--muted)]">
          <span>Instrumento</span>
          <span className="text-center">Pauta</span>
          <span className="text-center">MIDI</span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-2 px-1.5 py-1">
          <span className="text-sm">Selecionar todos</span>
          <TriStateCheckbox
            label="Selecionar todas as pautas"
            checked={allSelected}
            indeterminate={indeterminate}
            disabled={loading || !xmlLoaded}
            onChange={onSelectAllChange}
          />
          <TriStateCheckbox
            label="Selecionar todos os instrumentos do MIDI"
            checked={midiAllSelected}
            indeterminate={midiIndeterminate}
            disabled={loading || !xmlLoaded}
            onChange={onSelectAllMidiChange}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="px-2 py-2 text-sm text-[var(--muted)]">Nenhum instrumento encontrado.</div>
        ) : null}

        {filtered.map((instrument) => (
          <div key={instrument.id} className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-2 rounded-lg px-1.5 hover:bg-[var(--card-secondary)]">
            <span className="flex min-w-0 items-center gap-2">
              <img src={`/${instrument.iconPath}`} alt="" className="h-5 w-5 shrink-0 object-contain" />
              <span className="truncate text-sm">{instrument.name}</span>
            </span>
            <TriStateCheckbox
              label={`Mostrar ${instrument.name} na partitura`}
              checked={selectedSet.has(instrument.id)}
              disabled={loading || !xmlLoaded}
              onChange={(checked) => onToggle(instrument.id, checked)}
            />
            <TriStateCheckbox
              label={`Tocar ${instrument.name} no MIDI`}
              checked={midiSelectedSet.has(instrument.id)}
              disabled={loading || !xmlLoaded}
              onChange={(checked) => onToggleMidi(instrument.id, checked)}
            />
          </div>
        ))}
      </div>

      {loading ? <div className="flex-shrink-0 px-4 pb-4 text-xs text-[var(--muted)]">Aplicando seleção...</div> : null}
    </div>
  );
}

function TriStateCheckbox({
  label,
  checked,
  indeterminate = false,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        ref={(element) => {
          if (element) element.indeterminate = indeterminate;
        }}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        aria-label={label}
        className="h-4 w-4"
      />
    </label>
  );
}
