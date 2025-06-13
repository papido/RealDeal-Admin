import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

const useFetchData = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionName: string,
  constraints: ((
    ref: FirebaseFirestoreTypes.Query<T>
  ) => FirebaseFirestoreTypes.Query<T>)[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionName) return;

    let ref: FirebaseFirestoreTypes.Query<T> = firestore().collection(
      collectionName
    ) as FirebaseFirestoreTypes.Query<T>;

    // Apply query constraints (like where, orderBy, etc.)
    constraints.forEach((applyConstraint) => {
      ref = applyConstraint(ref);
    });

    const fetchData = async () => {
      try {
        const snapshot = await ref.get();
        const docs: T[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(docs);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, constraints]);

  return { data, loading, error };
};

export default useFetchData;
