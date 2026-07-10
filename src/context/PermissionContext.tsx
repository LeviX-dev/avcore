import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../public/config';

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  loading: true,
});

export const PermissionProvider = ({ role, children }: any) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role) return;

    axios
      .get(`${BASE_URL}api/dynamic/getRolePermissions/${role}`, { withCredentials: true })
      .then(res => setPermissions(res.data))
      .finally(() => setLoading(false));
  }, [role]);

  return (
    <PermissionContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
