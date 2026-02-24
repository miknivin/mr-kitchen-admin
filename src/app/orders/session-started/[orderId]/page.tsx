import DefaultLayout from "@/components/Layouts/DefaultLayout";
import OrderDetails from "@/components/SessionSOrderDetails";

// Define the type for params
interface OrderPageProps {
  params: {
    orderId: string;
  };
}

const SessionStarted: React.FC<OrderPageProps> = ({ params }) => {
  const { orderId } = params;
  // console.log(orderId, "orderId");

  return (
    <DefaultLayout>
      <OrderDetails orderId={orderId} />
    </DefaultLayout>
  );
};

export default SessionStarted;
