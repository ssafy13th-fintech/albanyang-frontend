import { useState } from "react";
import { writeNotification, NotificationRequest } from "@/api/notification/WriteNotification";

export const registerNotification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const register = async (storeId: number, body: NotificationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await writeNotification(storeId, body);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, data };
};
