import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CouponsTable from "@/components/Tables/CouponTable";


export default function page() {
    return (
        <>
      <DefaultLayout>
      <CouponsTable />
      </DefaultLayout>
    </>
    );
}