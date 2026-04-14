interface CRUDModalProps {
  title: string;
  message: string;
  itemName?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function CRUDModal({
  title,
  message,
  itemName,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: CRUDModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl p-6 text-card-foreground">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {message}
          {itemName && <> <strong>{itemName}</strong></>}?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-card-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
