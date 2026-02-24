import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EnquiriesTable from "@/components/Tables/EnquiriesTable";
import UserTable from "@/components/Tables/UserTable";

export default function page() {
    return (
        <>
      <DefaultLayout>
      <EnquiriesTable />
      </DefaultLayout>
    </>
    );
}