// src/lib/token.ts
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "./api";

const KEY_ACCESS = "ACCESS_TOKEN";
const KEY_REFRESH = "REFRESH_TOKEN";

export async function saveTokens(accessToken: string, refreshToken?: string) {
  await SecureStore.setItemAsync(KEY_ACCESS, accessToken);
  if (refreshToken) await SecureStore.setItemAsync(KEY_REFRESH, refreshToken);
  setAuthToken(accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  const t = await SecureStore.getItemAsync(KEY_ACCESS);
  if (t) setAuthToken(t);
  return t;
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(KEY_ACCESS);
  await SecureStore.deleteItemAsync(KEY_REFRESH);
  setAuthToken(null);
}
