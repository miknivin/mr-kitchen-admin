import CreateOrder from "@/components/CreateOrder";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function page() {
  return (
    <>
      <DefaultLayout>
        <CreateOrder />
      </DefaultLayout>
    </>
  );
}
