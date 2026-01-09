import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";

axios.defaults.withCredentials = true;

interface MenuPermission {
  menu_key: string;
  label: string;
  parent_key: string | null;
  path: string | null;
  checked: number;
  sort_order?: number;
}

const AdminRolePermission = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [menus, setMenus] = useState<MenuPermission[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  /* Load roles */
  useEffect(() => {
    axios
      .get(`${BASE_URL}api/dynamic/getAllRoles`)
      .then(res => setRoles(res.data))
      .catch(console.error);
  }, []);

  /* Load permissions */
  useEffect(() => {
    if (!selectedRole) return;

    axios
      .get(`${BASE_URL}api/dynamic/getRoleMenuPermissions/${selectedRole}`)
      .then(res => {
        let filtered: MenuPermission[] = res.data.filter(
          (m: MenuPermission) =>
            m.menu_key !== "master" &&
            !m.menu_key.startsWith("master.")
        );

        const dedupedMap: Record<string, MenuPermission> = {};
        filtered.forEach(m => {
          if (!dedupedMap[m.menu_key] || m.checked === 1) {
            dedupedMap[m.menu_key] = m;
          }
        });

        filtered = Object.values(dedupedMap).sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );

        setMenus(filtered);

        const map: Record<string, boolean> = {};
        filtered.forEach(m => (map[m.menu_key] = m.checked === 1));
        setChecked(map);
      })
      .catch(console.error);
  }, [selectedRole]);

  const toggle = (menuKey: string) => {
    setChecked(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const save = async () => {
    try {
      await axios.post(`${BASE_URL}api/dynamic/saveRolePermissions`, {
        role: selectedRole,
        permissions: Object.keys(checked).filter(k => checked[k]),
      });
      alert("Permissions updated");
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert("Failed to update permissions");
    }
  };

  const parents = menus.filter(m => !m.parent_key);
  const children = menus.filter(m => m.parent_key);

  return (
    <div className="w-full max-w-4xl bg-white p-4 sm:p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        Role Permission Manager
      </h2>

      {/* Role selector */}
      <select
        value={selectedRole}
        onChange={e => setSelectedRole(e.target.value)}
        className="border p-2 rounded mb-6 w-full"
      >
        <option value="">Select Role</option>
        {roles.map(role => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      {/* Permission Tree */}
      {selectedRole && (
        <div className="space-y-4">
          {parents.map(parent => {
            const childMenus = children.filter(
              c => c.parent_key === parent.menu_key
            );

            return (
              <div
                key={parent.menu_key}
                className="border rounded-lg p-3 sm:p-4"
              >
                {/* Parent label */}
                <div className="font-semibold text-gray-800 mb-2">
                  {parent.label}
                </div>

                {/* Parent checkbox */}
                {parent.path && (
                  <label className="flex items-center gap-2 ml-2 mb-2">
                    <input
                      type="checkbox"
                      checked={!!checked[parent.menu_key]}
                      onChange={() => toggle(parent.menu_key)}
                    />
                    <span className="text-sm">
                      {parent.label}
                    </span>
                  </label>
                )}

                {/* Children */}
                <div className="space-y-1 ml-4">
                  {childMenus.map(child => (
                    <label
                      key={child.menu_key}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={!!checked[child.menu_key]}
                        onChange={() => toggle(child.menu_key)}
                      />
                      <span className="text-sm">
                        {child.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save button */}
      {selectedRole && (
        <button
          onClick={save}
          className="mt-6 w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Save Permissions
        </button>
      )}
    </div>
  );
};

export default AdminRolePermission;