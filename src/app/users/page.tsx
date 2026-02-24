import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserTable from "@/components/Tables/UserTable";

export default function page() {
    return (
        <>
      <DefaultLayout>
      <UserTable />
      </DefaultLayout>
    </>
    );
}