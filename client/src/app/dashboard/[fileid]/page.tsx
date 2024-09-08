import DetailedFile from "@/components/DetailedFile";
import RouteProtector from "@/components/RouteProtector";

interface DashboardDetailPageProps {
  params: {
    fileid: string;
  };
}

const DashboardDetailPage = ({ params }: DashboardDetailPageProps) => {
  const { fileid } = params;

  return (
    <RouteProtector authRequired={true}>
      <DetailedFile fileId={fileid} />
    </RouteProtector>
  );
};

export default DashboardDetailPage;
