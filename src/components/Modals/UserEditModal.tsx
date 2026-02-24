import React, { useEffect, useState } from "react";
import { useGetUserDetailsQuery, useUpdateUserMutation } from "@/redux/api/userApi"; // Adjust import path
import Spinner from "../common/Spinner";
import toast from "react-hot-toast";

interface ModalProps {
  onClose: () => void;
  userId: string;
}

const UserEditModal: React.FC<ModalProps> = ({ onClose, userId }) => {
  const { data, isLoading:userLoading } = useGetUserDetailsQuery(userId);
  const [updateUser, { isLoading: isUpdating, isSuccess, isError }] = useUpdateUserMutation();

  // Local state for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Populate form when user data is available
  useEffect(() => {
    if (data) {
      setFormData({
        name: data?.users?.name || "",
        email: data?.users?.email || "",
        phone: data?.users?.phone || "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      console.log('success');
      
      toast.success("User updated successfully")
    }
  }, [isSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ id: userId, body: formData }).unwrap();
      toast.success("User updated successfully");
      onClose(); 
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  if (userLoading) {
    return <Spinner/>;
  }

  return (
    <div
      id="authentication-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Update User
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:bg-gray-200 rounded-lg text-sm w-8 h-8 dark:hover:bg-gray-600"
              onClick={onClose}
            >
              ✖
            </button>
          </div>
          <div className="p-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  User Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  User Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  User Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              {isError&&(<p className="text-dander"></p>)}
              
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5"
              >
                {isUpdating ? "Updating..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
