import { apiFetch } from "../../../../api/http";
import type { Item } from "../../../sharedTypes/Item";

export function getItems(): Promise<Item[]> {
  return apiFetch<Item[]>("/items");
}

export function getItem(itemId: string): Promise<Item> {
  return apiFetch<Item>(`/items/${itemId}`);
}
