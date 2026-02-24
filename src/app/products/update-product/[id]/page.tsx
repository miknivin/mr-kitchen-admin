import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UpdateProductStepper from "@/components/UpdateProductStepper";

interface PageProps {
  params: { id: string }; 
}

export default function Page({ params }: PageProps) {
  const { id } = params; 

  return (
    <DefaultLayout>
      <UpdateProductStepper productId={id} />
    </DefaultLayout>
  );
}
