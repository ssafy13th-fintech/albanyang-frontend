import { AxiosError } from "axios";
import { api, ApiResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

interface CreateStoreReqeust{
    name: string;
    address: string;
    officeNumber: string;
    payDay: number;
    scale: number;
}

interface CreateStoreResponse{
    id: number;
    name: string;
    address: string;
    officeNumber: string;
    payDay: number;
    scale: number;
}


function handleAxiosError(err: unknown): never {
  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;
    throw new Error(
      `Request failed${status ? ` (status ${status})` : ''}: ${
        (data && (data as any).message) || axiosErr.message
      }`
    );
  }
  throw err;
}

export async function createStore(body: CreateStoreReqeust) {
    if (!body.name || !body.address || !body.officeNumber || !body.payDay || !body.scale) {
    throw new Error('All fields in StoreRequestBody are required');
  }

    try {
        const token = await loadToken();
        const res = await api.post<ApiResponse<CreateStoreResponse>>(
          `/v1/stores`,
          body,
          {
              headers: {
                  Authorization: token,
              },
          }
        );
        return res.data.data;
    } catch (err) {
        console.error(err);
        handleAxiosError(err);
    }
}
