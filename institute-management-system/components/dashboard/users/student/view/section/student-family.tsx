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
      <div className="grid grid-cols-6 gap-4 text-sm">
        {/* Father's Name */}
        <div className="text-muted-foreground col-span-1">ឈ្មោះឪពុក</div>
        <div className="col-span-1">{father?.name || "---"}</div>

        {/* Spacer */}
        <div className="col-span-1"></div>

        {/* Mother's Name */}
        <div className="text-muted-foreground col-span-1">ឈ្មោះម្ដាយ</div>
        <div className="col-span-1">{mother?.name || "---"}</div>
        <div className="col-span-1"></div>

        {/* Father's Age */}
        <div className="text-muted-foreground col-span-1">អាយុឪពុក</div>
        <div className="col-span-1">{father?.age || "---"}</div>

        <div className="col-span-1"></div>

        {/* Mother's Age */}
        <div className="text-muted-foreground col-span-1">អាយុម្ដាយ</div>
        <div className="col-span-1">{mother?.age || "---"}</div>
        <div className="col-span-1"></div>

        {/* Repeat this pattern for other fields: job, phone, address, etc. */}
        <div className="text-muted-foreground col-span-1">មុខរបរឪពុក</div>
        <div className="col-span-1">{father?.job || "---"}</div>
        <div className="col-span-1"></div>
        <div className="text-muted-foreground col-span-1">មុខរបរម្ដាយ</div>
        <div className="col-span-1">{mother?.job || "---"}</div>
        <div className="col-span-1"></div>

        <div className="text-muted-foreground col-span-1">លេខទូរស័ព្ទឪពុក</div>
        <div className="col-span-1">{father?.phone || "---"}</div>
        <div className="col-span-1"></div>
        <div className="text-muted-foreground col-span-1">លេខទូរស័ព្ទម្ដាយ</div>
        <div className="col-span-1">{mother?.phone || "---"}</div>
        <div className="col-span-1"></div>

        <div className="text-muted-foreground col-span-1">
          អាសយដ្ឋានបច្ចុប្បន្នឪពុក
        </div>
        <div className="col-span-1">{father?.address || "---"}</div>
        <div className="col-span-1"></div>
        <div className="text-muted-foreground col-span-1">
          អាសយដ្ឋានបច្ចុប្បន្នម្ដាយ
        </div>
        <div className="col-span-1">{mother?.address || "---"}</div>
        <div className="col-span-1"></div>

        {/* NOTED: NOT SURE */}
        {/* <div className="text-muted-foreground col-span-1">
          ចំនួនបងប្អូនបង្កើត
        </div>
        <div className="col-span-1">{student?.numberOfSiblings || "---"}</div>
        <div className="col-span-1"></div>
        <div className="text-muted-foreground col-span-1">
          ចំនួនបងប្អូនបង្កើតស្រី
        </div>
        <div className="col-span-1">{student?.memberSiblings || "---"}</div>
        <div className="col-span-1"></div> */}
      </div>
    </CollapsibleCard>
  );
}
