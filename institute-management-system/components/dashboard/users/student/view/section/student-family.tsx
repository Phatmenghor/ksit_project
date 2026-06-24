import CollapsibleCard from "@/components/shared/collapsibleCard";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import StudentSiblingTable from "./student-sibling";

interface StudentProfileProps {
  student: StudentByIdModel | null;
}

export default function StudentFamily({ student }: StudentProfileProps) {
  const father = student?.studentParent.find((p) => p.parentType === "FATHER");
  const mother = student?.studentParent.find((p) => p.parentType === "MOTHER");

  return (
    <CollapsibleCard title="ព័ត៍មានទាក់ទងនឹងគ្រួសារសិស្ស">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        {/* Father */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 border-b pb-1">ឪពុក</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="text-muted-foreground">ឈ្មោះ</dt>
            <dd>{father?.name || "---"}</dd>
            <dt className="text-muted-foreground">អាយុ</dt>
            <dd>{father?.age || "---"}</dd>
            <dt className="text-muted-foreground">មុខរបរ</dt>
            <dd>{father?.job || "---"}</dd>
            <dt className="text-muted-foreground">លេខទូរស័ព្ទ</dt>
            <dd>{father?.phone || "---"}</dd>
            <dt className="text-muted-foreground">អាសយដ្ឋាន</dt>
            <dd className="break-words">{father?.address || "---"}</dd>
          </dl>
        </div>

        {/* Mother */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 border-b pb-1">ម្ដាយ</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="text-muted-foreground">ឈ្មោះ</dt>
            <dd>{mother?.name || "---"}</dd>
            <dt className="text-muted-foreground">អាយុ</dt>
            <dd>{mother?.age || "---"}</dd>
            <dt className="text-muted-foreground">មុខរបរ</dt>
            <dd>{mother?.job || "---"}</dd>
            <dt className="text-muted-foreground">លេខទូរស័ព្ទ</dt>
            <dd>{mother?.phone || "---"}</dd>
            <dt className="text-muted-foreground">អាសយដ្ឋាន</dt>
            <dd className="break-words">{mother?.address || "---"}</dd>
          </dl>
        </div>
      </div>
    </CollapsibleCard>
  );
}
