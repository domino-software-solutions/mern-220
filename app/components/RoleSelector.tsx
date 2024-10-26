import React from 'react';

interface RoleSelectorProps {
  role: string;
  setRole: (role: string) => void;
  allowedRoles: string[];
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, setRole, allowedRoles }) => {
  return (
    <div>
      <label htmlFor="role" className="block mb-1">Role</label>
      <select
        id="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      >
        {allowedRoles.map((r) => (
          <option key={r} value={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelector;
