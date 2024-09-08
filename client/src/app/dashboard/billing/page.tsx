import BillingForm from "@/components/BillingForm";
import RouteProtector from "@/components/RouteProtector";

const Page = async () => {
  return (
    <RouteProtector authRequired={true}>
      <BillingForm />
    </RouteProtector>
  );
};

export default Page;
