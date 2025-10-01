import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ menuItems }) => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;