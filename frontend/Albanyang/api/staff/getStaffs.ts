import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface Staff {
  id: number;
  name: string;
  nickname: string;
  status: string;
}


export async function getStaffs(storeId: string): Promise<Staff[]> {
  const token = await loadToken();
  return handleResponse<{ staffInfoRes: Staff[] }>(
    api.get(`/v1/stores/${storeId}/staffs`, {
      headers: {
        Authorization: token
      }
    })
  ).then(res => res.staffInfoRes);
}

