// components/UserSelection.tsx
import React, { useState } from "react";
import { Button, Autocomplete, TextField } from "@mui/material";
import { useRegisterMutation } from "@/redux/api/authApi";
import { Order } from "@/types/order";
import { User } from "@/types/user";

import { useGetAdminUsersQuery } from "@/redux/api/userApi";

interface UserSelectionProps {
  orderData: Order;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  updateOrderData: (data: Partial<Order>) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({
  orderData,
  handleNextStep,
  handlePrevStep,
  updateOrderData,
}) => {
  const { data: users } = useGetAdminUsersQuery(null);
  const [createUser] = useRegisterMutation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserEmail, setNewUserEmail] = useState<string>("");

  const handleUserChange = (
    event: React.SyntheticEvent,
    newValue: User | null,
  ) => {
    setSelectedUser(newValue);
    updateOrderData({ user: newValue?._id || "" });
  };

  const handleCreateUser = async () => {
    if (newUserEmail) {
      try {
        const newUser = await createUser({ email: newUserEmail }).unwrap();
        setSelectedUser(newUser);
        updateOrderData({ user: newUser._id });
        setNewUserEmail("");
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Autocomplete
        options={users || []}
        getOptionLabel={(option: User) => option?.email || ""}
        value={selectedUser}
        onChange={handleUserChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select User"
            placeholder="Search users"
          />
        )}
      />
      <div className="flex space-x-2">
        <TextField
          fullWidth
          label="New User Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
        />
        <Button variant="outlined" onClick={handleCreateUser}>
          Register
        </Button>
      </div>
      <div className="flex justify-between">
        <Button variant="outlined" onClick={handlePrevStep}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNextStep}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default UserSelection;
