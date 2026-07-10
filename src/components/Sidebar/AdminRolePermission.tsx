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
    <div className="w-full max-w-4xl bg-white dark:bg-boxdark p-4 sm:p-6 rounded-lg shadow-sm border border-stroke dark:border-strokedark">
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
        Role Permission Manager
      </h2>

      {/* Role selector */}
      <select
        value={selectedRole}
        onChange={e => setSelectedRole(e.target.value)}
        className="border border-stroke dark:border-strokedark dark:bg-boxdark dark:text-white p-3 rounded-lg mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Role</option>
        {roles.map(role => (
          <option key={role} value={role} className="dark:bg-boxdark">
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
                className="border border-stroke dark:border-strokedark rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-800"
              >
                {/* Parent label */}
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {parent.label}
                </div>

                {/* Parent checkbox */}
                {parent.path && (
                  <label className="flex items-center gap-2 ml-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checked[parent.menu_key]}
                      onChange={() => toggle(parent.menu_key)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {parent.label}
                    </span>
                  </label>
                )}

                {/* Children */}
                <div className="space-y-1 ml-4">
                  {childMenus.map(child => (
                    <label
                      key={child.menu_key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!checked[child.menu_key]}
                        onChange={() => toggle(child.menu_key)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
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
          className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Permissions
        </button>
      )}
    </div>
  );
};

export default AdminRolePermission;