import DefaultLayout from "@/components/Layouts/DefaultLayout";
import OrderTable from "@/components/Tables/OrderTable";
import TableOne from "@/components/Tables/TableOne";

export default function page() {
  return (
    <>
      <DefaultLayout>
        <OrderTable />
      </DefaultLayout>
    </>
  );
}
