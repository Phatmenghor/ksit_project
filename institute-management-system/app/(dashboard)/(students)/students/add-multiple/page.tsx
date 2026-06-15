import GenerateMultiStudentForm from "@/components/dashboard/users/student/generate-multi-Student/student-multi-generate";
import { CardHeaderSection } from "@/components/shared/layout/card-header-section";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTE } from "@/constants/routes";

export default function AddMultipleStudentsPage() {
  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-6 space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROUTE.DASHBOARD}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Add multiple students</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
          <h3 className="text-xl font-bold">Add multi students</h3>
        </CardContent>
      </Card>
      <GenerateMultiStudentForm />
    </div>
  );
}
