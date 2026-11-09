import { useCallback, useEffect, useState } from "react";
import { getAdminItems } from "../../api/adminItemApi";

type AdminItems = Awaited<ReturnType<typeof getAdminItems>>;

export default function useAdminItems() {
  const [items, setItems] = useState<AdminItems>([]);
  const [visibleItemIds, setVisibleItemIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const itemData = await getAdminItems();

      setItems(itemData);

      setVisibleItemIds((previous) => {
        const next = new Set(
          itemData
            .filter((item) => previous.has(item.id))
            .map((item) => item.id),
        );

        itemData.forEach((item) => {
          if (!previous.has(item.id)) {
            next.add(item.id);
          }
        });

        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load items"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  // Toggle item visibility
  const toggleItem = useCallback((id: string) => {
    setVisibleItemIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  return {
    items,
    visibleItemIds,
    loading,
    error,
    toggleItem,
    refreshItems: fetchItems,
  };
}
