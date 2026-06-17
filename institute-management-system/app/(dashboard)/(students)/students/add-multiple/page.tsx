import GenerateMultiStudentForm from "@/components/dashboard/users/student/generate-multi-Student/student-multi-generate";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";

export default function AddMultipleStudentsPage() {
  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-6 space-y-3">
          <PageBreadcrumb items={[{ label: "Add multiple students" }]} />
          <h3 className="text-xl font-bold">Add multi students</h3>
        </CardContent>
      </Card>
      <GenerateMultiStudentForm />
    </div>
  );
}
