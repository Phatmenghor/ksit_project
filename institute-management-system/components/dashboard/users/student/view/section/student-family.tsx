import CollapsibleCard from "@/components/shared/collapsibleCard";
import InfoGrid from "../../../shared/user-personal-history";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import StudentSiblingTable from "./student-sibling";

interface StudentProfileProps {
  student: StudentByIdModel | null;
}

export default function StudentFamily({ student }: StudentProfileProps) {
  const father = student?.studentParent.find((p) => p.parentType === "FATHER");
  const mother = student?.studentParent.find((p) => p.parentType === "MOTHER");

  const fatherItems = [
    { label: "ឈ្មោះ", value: father?.name },
    { label: "អាយុ", value: father?.age },
    { label: "មុខរបរ", value: father?.job },
    { label: "លេខទូរស័ព្ទ", value: father?.phone },
    { label: "អាសយដ្ឋាន", value: father?.address },
  ];

  const motherItems = [
    { label: "ឈ្មោះ", value: mother?.name },
    { label: "អាយុ", value: mother?.age },
    { label: "មុខរបរ", value: mother?.job },
    { label: "លេខទូរស័ព្ទ", value: mother?.phone },
    { label: "អាសយដ្ឋាន", value: mother?.address },
  ];

  return (
    <CollapsibleCard title="ព័ត៍មានទាក់ទងនឹងគ្រួសារសិស្ស">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground border-b pb-1">ឪពុក</h4>
          <InfoGrid data={fatherItems} columns={1} />
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground border-b pb-1">ម្ដាយ</h4>
          <InfoGrid data={motherItems} columns={1} />
        </div>
      </div>
      <div className="mt-6">
        <StudentSiblingTable student={student} />
      </div>
    </CollapsibleCard>
  );
}
