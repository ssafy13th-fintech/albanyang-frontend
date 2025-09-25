import { api, handleResponse } from "../Api";

export interface Staff {
  id: number;
  name: string;
  nickname: string;
  status: string;
}


export async function getStaffs(storeId: string): Promise<Staff[]> {
  return handleResponse<{ staffInfoRes: Staff[] }>(
    api.get(`/v1/stores/${storeId}/staffs`)
  ).then(res => res.staffInfoRes);
}

