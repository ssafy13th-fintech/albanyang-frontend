import { useState } from "react";
import { getNotification } from "@/api/notification/getNotification";

export const useGetNotification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const getNotice = async (storeId: number, notificationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotification(storeId, notificationId);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getNotice, loading, error, data };
};
