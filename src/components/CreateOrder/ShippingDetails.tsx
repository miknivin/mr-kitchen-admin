// components/ShippingDetailsForm.tsx
import React from "react";
import { TextField, Button } from "@mui/material";
import { Order } from '@/types/order';

interface ShippingDetailsFormProps {
  orderData: Order;
  handleNextStep: () => void;
  updateOrderData: (data: Partial<Order>) => void;
}

const ShippingDetailsForm: React.FC<ShippingDetailsFormProps> = ({
  orderData,
  handleNextStep,
  updateOrderData,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateOrderData({
      shippingInfo: {
        ...orderData.shippingInfo,
        [name]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <TextField
        fullWidth
        label="Name"
        name="name"
        value={orderData.shippingInfo.fullName}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        label="Phone Number"
        name="phoneNo"
        value={orderData.shippingInfo.phoneNo}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        label="Address"
        name="address"
        value={orderData.shippingInfo.address}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        label="City"
        name="city"
        value={orderData.shippingInfo.city}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        label="Pin Code"
        name="pinCode"
        value={orderData.shippingInfo.zipCode}
        onChange={handleChange}
        required
      />
      <Button variant="contained" onClick={handleNextStep}>
        Next
      </Button>
    </div>
  );
};

export default ShippingDetailsForm;