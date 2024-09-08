import Dashboard from "@/components/Dashboard";
import RouteProtector from "@/components/RouteProtector";

const DashboardPage = () => {
  return (
    <RouteProtector authRequired={true}>
      <Dashboard />
    </RouteProtector>
  );
};

export default DashboardPage;
