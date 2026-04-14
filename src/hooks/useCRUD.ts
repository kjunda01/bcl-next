import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface UseCRUDReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  itemToDelete: T | null;
  itemToEdit: T | null;
  setItems: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setItemToDelete: (item: T | null) => void;
  setItemToEdit: (item: T | null) => void;
  openDeleteModal: (item: T) => void;
  openEditModal: (item: T) => void;
  closeModals: () => void;
  deleteItem: (id: string | number, idKey: keyof T) => void;
  addItem: (item: T) => void;
  updateItem: (item: T, idKey: keyof T) => void;
}

export interface UseEntityCRUDReturn<T, K extends keyof T = 'id' & keyof T> extends UseCRUDReturn<T> {
  loadItems: () => Promise<void>;
  createItem: (item: Omit<T, K>) => Promise<T>;
  updateItemOnServer: (item: T) => Promise<T>;
  deleteItemOnServer: (id: string | number) => Promise<void>;
}

/**
 * Hook genérico para gerenciar CRUD de qualquer entidade em memória
 */
export function useCRUD<T>(): UseCRUDReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [itemToEdit, setItemToEdit] = useState<T | null>(null);

  const openDeleteModal = useCallback((item: T) => {
    setItemToDelete(item);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setItemToEdit(item);
  }, []);

  const closeModals = useCallback(() => {
    setItemToDelete(null);
    setItemToEdit(null);
  }, []);

  const deleteItem = useCallback(
    (id: string | number, idKey: keyof T) => {
      setItems((prev) => prev.filter((item) => String(item[idKey]) !== String(id)));
      closeModals();
    },
    [closeModals]
  );

  const addItem = useCallback(
    (item: T) => {
      setItems((prev) => [...prev, item]);
      closeModals();
    },
    [closeModals]
  );

  const updateItem = useCallback(
    (item: T, idKey: keyof T) => {
      setItems((prev) =>
        prev.map((existing) =>
          String(existing[idKey]) === String(item[idKey]) ? item : existing
        )
      );
      closeModals();
    },
    [closeModals]
  );

  return {
    items,
    loading,
    error,
    itemToDelete,
    itemToEdit,
    setItems,
    setLoading,
    setError,
    setItemToDelete,
    setItemToEdit,
    openDeleteModal,
    openEditModal,
    closeModals,
    deleteItem,
    addItem,
    updateItem,
  };
}

export function useEntityCRUD<
  T extends object,
  K extends keyof T = 'id' & keyof T
>(
  resource: string,
  idKey: K = 'id' as K
): UseEntityCRUDReturn<T, K> {
  const crud = useCRUD<T>();

  const loadItems = useCallback(async () => {
    try {
      crud.setLoading(true);
      const items = await apiFetch<T[]>(`/${resource}`);
      crud.setItems(items);
    } catch (error) {
      crud.setError(String(error) || 'Erro ao carregar itens');
    } finally {
      crud.setLoading(false);
    }
  }, [resource, crud]);

  const createItem = useCallback(
    async (item: Omit<T, K>) => {
      try {
        crud.setLoading(true);
        const data = await apiFetch<T>(`/${resource}`, {
          method: 'POST',
          body: JSON.stringify(item),
        });
        crud.addItem(data);
        return data;
      } finally {
        crud.setLoading(false);
      }
    },
    [resource, crud]
  );

  const updateItemOnServer = useCallback(
    async (item: T) => {
      try {
        crud.setLoading(true);
        const data = await apiFetch<T>(`/${resource}/${String(item[idKey])}`, {
          method: 'PUT',
          body: JSON.stringify(item),
        });
        crud.updateItem(data, idKey);
        return data;
      } finally {
        crud.setLoading(false);
      }
    },
    [resource, idKey, crud]
  );

  const deleteItemOnServer = useCallback(
    async (id: string | number) => {
      try {
        crud.setLoading(true);
        await apiFetch<void>(`/${resource}/${id}`, {
          method: 'DELETE',
        });
        crud.deleteItem(id, idKey);
      } catch (error) {
        crud.setError(String(error) || 'Erro ao excluir item');
      } finally {
        crud.setLoading(false);
      }
    },
    [resource, idKey, crud]
  );

  return {
    ...crud,
    loadItems,
    createItem,
    updateItemOnServer,
    deleteItemOnServer,
  };
}
