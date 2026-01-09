import React, { useState } from 'react';
import Add_user from './Add_user';
import User_list from './User_list';

const UsersContainer = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleAddOrUpdateUser = (userDetails) => {
    if (isEditMode) {
      setUsers(users.map(user => (user.email === userDetails.email ? userDetails : user)));
      setIsEditMode(false);
    } else {
      setUsers([...users, userDetails]);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);
  };

  const handleDeleteUser = (user) => {
    setUsers(users.filter(u => u.email !== user.email));
  };

  return (
    <div>
      <Add_user
        selectedUser={selectedUser}
        handleAddOrUpdateUser={handleAddOrUpdateUser}
        isEditMode={isEditMode}
      />
      <User_list
        handleEditUser={handleEditUser}
        handleDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default UsersContainer;
