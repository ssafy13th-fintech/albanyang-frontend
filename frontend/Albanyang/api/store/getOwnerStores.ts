import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface Store {
  id: string;
  name: string;
}

// 전체 매장 리스트 조회
export async function getOwnerStores(): Promise<Store[]> {
  const token = await loadToken();
  return handleResponse<{ stores: Store[] }>(
    api.get("/v1/stores", {
      headers: {
        Authorization: token,
      }
    })
  ).then(res => res.stores);
}
