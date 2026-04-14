import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './SharedTable.module.scss';

export interface ColumnConfig<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  sortKey?: keyof T | string;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface TableAction<T = unknown> {
  label: string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'warn' | 'success';
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  tooltip?: string;
}

export interface SharedTableProps<T = unknown> {
  data: T[];
  columns: ColumnConfig<T>[];
  actions?: TableAction<T>[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
  canAdd?: boolean;
  onAdd?: () => void;
  searchPlaceholder?: string;
  hideableColumns?: (keyof T | string)[];
  className?: string;
}

export function SharedTable<T extends object>({
  data,
  columns,
  actions = [],
  title,
  loading = false,
  emptyMessage = 'Nenhum item encontrado.',
  canAdd = false,
  onAdd,
  searchPlaceholder = 'Buscar...',
  hideableColumns = [],
  className = '',
}: SharedTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);
  const columnsDropdownRef = useRef<HTMLDivElement | null>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!isColumnsDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) {
        setIsColumnsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isColumnsDropdownOpen]);

  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnKey)) {
        next.delete(columnKey);
      } else {
        next.add(columnKey);
      }
      return next;
    });
  };

  // Filtrar dados baseado na busca
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      columns.some(column => {
        const value = item[column.key as keyof T];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const column = columns.find((col) => String(col.key) === sortColumn);
    const sortKey = column?.sortKey ?? column?.key ?? sortColumn;

    const normalizeValue = (value: unknown) => {
      if (value == null) return '';
      if (typeof value === 'string') return value.trim().toLocaleLowerCase();
      if (typeof value === 'number') return value;
      if (value instanceof Date) return value.toISOString();
      return String(value).trim().toLocaleLowerCase();
    };

    return [...filteredData].sort((a, b) => {
      const aValue = normalizeValue(a[sortKey as keyof T]);
      const bValue = normalizeValue(b[sortKey as keyof T]);

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const compare = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
        return sortDirection === 'asc' ? compare : -compare;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginar dados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        {title && (
          <div className={styles.header}>
            <h2>{title}</h2>
          </div>
        )}
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span className={styles.loadingText}>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      {(title || canAdd || hideableColumns.length > 0) && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>
              {title && <h2>{title}</h2>}
              <p>{sortedData.length} item(s) encontrado(s)</p>
            </div>
            <div className={styles.headerActions}>
              {hideableColumns.length > 0 && (
                <div className={styles.dropdownWrapper} ref={columnsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsColumnsDropdownOpen((prev) => !prev)}
                    className="inline-flex items-center px-3 py-2 border border-border rounded-md text-sm font-medium btn-info"
                  >
                    <span className="material-icons text-sm mr-1">visibility</span>
                    Colunas
                  </button>
                  {isColumnsDropdownOpen && (
                    <div className={styles.columnsDropdown}>
                      {hideableColumns.map((columnKey) => {
                        const column = columns.find((col) => col.key === columnKey);
                        if (!column) return null;
                        const isHidden = hiddenColumns.has(columnKey as string);

                        return (
                          <label key={String(columnKey)} className={styles.columnOption}>
                            <input
                              type="checkbox"
                              checked={!isHidden}
                              onChange={() => toggleColumnVisibility(String(columnKey))}
                            />
                            <span>{column.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {canAdd && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <span className="material-icons text-sm mr-2">add</span>
                  Adicionar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className={styles.searchBar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchIcon}>
            <span className="material-icons">search</span>
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns
                .filter(column => !hiddenColumns.has(column.key as string))
                .map((column) => (
                  <th
                    key={column.key as string}
                    className={styles.th}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key as string)}
                  >
                    <div className={`${styles.THCell} ${column.sortable ? styles.sortable : ''}`} style={{
                      justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start'
                    }}>
                      <span>{column.label}</span>
                      {column.sortable && (
                        <span className={styles.sortIcon}>
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? (
                              <span className="material-icons">arrow_upward</span>
                            ) : (
                              <span className="material-icons">arrow_downward</span>
                            )
                          ) : (
                            <span className="material-icons">unfold_more</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              {actions.length > 0 && (
                <th className={styles.th} style={{ textAlign: 'right' }}>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {paginatedData.length === 0 ? (
              <tr className={styles.tr}>
                <td
                  colSpan={columns.filter(col => !hiddenColumns.has(col.key as string)).length + (actions.length > 0 ? 1 : 0)}
                  className={styles.tdEmpty}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={index} className={styles.tr}>
                  {columns
                    .filter(column => !hiddenColumns.has(column.key as string))
                    .map((column) => (
                      <td
                        key={column.key as string}
                        className={`${styles.td} ${column.align === 'center' ? styles['tdAlign-center'] : column.align === 'right' ? styles['tdAlign-right'] : ''}`}
                      >
                        {column.render
                          ? column.render(item[column.key as keyof T], item)
                          : String(item[column.key as keyof T] || '')
                        }
                      </td>
                    ))}
                  {actions.length > 0 && (
                    <td className={`${styles.td} ${styles.tdActions}`}>
                      <div className={styles.actionButtons}>
                        {actions.map((action, actionIndex) => {
                          const isDisabled = action.disabled?.(item) ?? false;
                          const actionColorClass = `action-${action.color || 'primary'}`;
                          return (
                            <button
                              key={actionIndex}
                              type="button"
                              onClick={() => !isDisabled && action.onClick(item)}
                              disabled={isDisabled}
                              className={`${styles.actionBtn} ${styles[actionColorClass]}`}
                              title={action.tooltip || action.label}
                            >
                              <span className="material-icons">
                                {action.icon || 'more_vert'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.footer}>
          <div className={styles.paginationInfo}>
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} resultados
          </div>
          <div className={styles.paginationControls}>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.paginationBtn}
            >
              Anterior
            </button>
            <span className={styles.pageInfo}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={styles.paginationBtn}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}