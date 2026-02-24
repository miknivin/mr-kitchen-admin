import DefaultLayout from "@/components/Layouts/DefaultLayout";
import OrderDetails from "@/components/OrderDetails";

// Define the type for params
interface OrderPageProps {
  params: {
    orderId: string;
  };
}

// This is a Next.js page component
const OrderPage: React.FC<OrderPageProps> = ({ params }) => {
  const { orderId } = params;

  return (
    <DefaultLayout>
      <OrderDetails orderId={orderId} />
    </DefaultLayout>
  );
};

export default OrderPage;
