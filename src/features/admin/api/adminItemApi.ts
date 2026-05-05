import { apiFetch } from "../../../api/http";
import type { Item } from "../../sharedTypes/Item";

export function getAdminItems(): Promise<Item[]> {
  return apiFetch("/admin/items");
}

/**
 * Get single item (admin)
 */
export function getAdminItem(id: string): Promise<Item> {
  return apiFetch(`/admin/items/${id}`);
}

/**
 * Update item (admin)
 */
export const updateAdminItem = async (
  id: string,
  item: Omit<Item, "id">,
): Promise<Item> => {
  return apiFetch(`/admin/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });
};

/**
 * Delete item (admin)
 */
export function deleteAdminItem(id: string): Promise<void> {
  return apiFetch(`/admin/items/${id}`, {
    method: "DELETE",
  });
}

/**
 * Create item (admin)
 */
export function createAdminItem(item: Omit<Item, "id">): Promise<Item> {
  return apiFetch("/admin/items", {
    method: "POST",
    body: JSON.stringify(item),
  });
}
