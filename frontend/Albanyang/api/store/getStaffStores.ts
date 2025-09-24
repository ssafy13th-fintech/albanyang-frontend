// src/services/storeService.ts
import { api, handleResponse } from "../api";

export interface Store {
  id: string;
  name: string;
}

export async function getStaffStores(): Promise<Store[]> {
  return handleResponse<{ stores: Store[] }>(
    api.get("/v1/stores/me")
  ).then(res => res.stores);
}
