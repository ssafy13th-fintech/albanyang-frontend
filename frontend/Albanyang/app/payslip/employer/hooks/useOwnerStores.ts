import { useState, useEffect } from "react";
import { getOwnerStores, Store } from "@/api/store/getOwnerStores";

export const ownerStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const storeList = await getOwnerStores();
        setStores(storeList);
      } catch (err: any) {
        
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
};
