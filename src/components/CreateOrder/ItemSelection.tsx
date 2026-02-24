// components/ItemsSelection.tsx
import React, { useState, useEffect } from "react";
import { Button, Autocomplete, TextField } from "@mui/material";
import { useGetProductsQuery } from "@/redux/api/productsApi";
import { Order, OrderItem } from "@/types/order";
import { Product } from "@/interfaces/product";

interface ItemsSelectionProps {
  orderData: Order;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  updateOrderData: (data: Partial<Order>) => void;
}

const ItemsSelection: React.FC<ItemsSelectionProps> = ({
  orderData,
  handleNextStep,
  handlePrevStep,
  updateOrderData,
}) => {
  const { data: products } = useGetProductsQuery(null);
  const [selectedItems, setSelectedItems] = useState<any[]>(
    orderData.orderItems,
  );

  const handleItemChange = (
    event: React.SyntheticEvent,
    newValue: Product[],
  ) => {
    setSelectedItems(
      newValue.map((item) => ({
        name: item.name,
        price: item.variants[0].discountPrice ?? 0, // Ensure price is always a number
        image: item.images[0]?.url || "", // Ensure image is always a string
        uploadedImage: "",
        quantity: 1,
        product: item._id ?? "", // Ensure product is always a string
      })),
    );
  };

  const handleNext = () => {
    updateOrderData({ orderItems: selectedItems });
    handleNextStep();
  };

  return (
    <div className="space-y-4">
      <Autocomplete
        multiple
        options={products || []}
        getOptionLabel={(option: Product) => option.name}
        value={selectedItems}
        onChange={handleItemChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Items"
            placeholder="Search products"
          />
        )}
      />
      <div className="flex justify-between">
        <Button variant="outlined" onClick={handlePrevStep}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default ItemsSelection;
