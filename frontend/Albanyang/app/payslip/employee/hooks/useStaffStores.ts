import { useEffect, useState } from "react";
import { getStaffStores, Store } from "@/api/store/getStaffStores";

export const staffStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const storeList = await getStaffStores();
        setStores(storeList);
      } catch (err: any) {
        console.error("store 조회 오류 : ", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
};
