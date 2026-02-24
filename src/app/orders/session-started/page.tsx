export const dynamic = "force-dynamic";
import CreateOrder from "@/components/CreateOrder";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SessionStartedOrders from "@/components/Tables/SessionStartedOrder";

export default function page() {
  return (
    <>
      <DefaultLayout>
        <SessionStartedOrders />
      </DefaultLayout>
    </>
  );
}
