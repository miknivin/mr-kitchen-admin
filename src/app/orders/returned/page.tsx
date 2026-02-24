export const dynamic = "force-dynamic";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ReturnedOrdersTable from "@/components/Tables/ReturnedOrderTable";

export default function page() {
  return (
    <>
      <DefaultLayout>
        <ReturnedOrdersTable />
      </DefaultLayout>
    </>
  );
}
