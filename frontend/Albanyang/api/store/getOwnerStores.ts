import { api, handleResponse } from "../Api";

export interface Store {
  id: string;
  name: string;
}

// 전체 매장 리스트 조회
export async function getStores(): Promise<Store[]> {
  return handleResponse<{ stores: Store[] }>(
    api.get("/v1/stores")
  ).then(res => res.stores);
}
