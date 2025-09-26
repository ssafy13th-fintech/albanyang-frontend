import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface Store {
  id: string;
  name: string;
}

export async function getStaffStores(): Promise<Store[]> {
  const token = await loadToken();
  return handleResponse<{ stores: Store[] }>(
    api.get("/v1/stores/me", {
      headers: {
        Authorization: token
      }
    })
    
  ).then(res => res.stores);
}
