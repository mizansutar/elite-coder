import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminProtectedRoute({ children }) {

  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  if (user === undefined)
    return <div style={{ padding: 30 }}>Checking authentication...</div>;

  if (!user)
    return <Navigate to="/admin/login" replace />;

  return children;
}