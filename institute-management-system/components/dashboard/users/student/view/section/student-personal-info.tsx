import CollapsibleCard from "@/components/shared/collapsibleCard";
import InfoGrid from "../../../shared/user-personal-history";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";

interface StudentProfileProps {
  student: StudentByIdModel | null;
}

export default function StudentPersonalInfo({ student }: StudentProfileProps) {
  const khmerName =
    student?.khmerFirstName || student?.khmerLastName
      ? `${student?.khmerFirstName ?? ""} ${student?.khmerLastName ?? ""}`.trim()
      : null;

  const englishName =
    student?.englishFirstName || student?.englishLastName
      ? `${student?.englishFirstName ?? ""} ${student?.englishLastName ?? ""}`.trim()
      : null;

  const infoItems = [
    { label: "គោត្តនាម និងនាម", value: khmerName },
    { label: "អក្សរឡាតាំង", value: englishName },
    { label: "អត្តលេខនិស្សិត", value: student?.identifyNumber },
    { label: "ភេទ", value: student?.gender },
    { label: "ថ្ងៃខែឆ្នាំកំណើត", value: student?.dateOfBirth },
    { label: "ជនជាតិ", value: student?.ethnicity },
    { label: "សញ្ជាតិ", value: student?.nationality },
    { label: "កម្រឺតសិក្សា", value: student?.studentClass?.degree },
    { label: "ដេប៉ាតឺម៉ង", value: student?.studentClass?.major?.department?.name },
    { label: "ជំនាញសិក្សា", value: student?.studentClass?.major?.name },
    { label: "លេខទូរស័ព្ទ", value: student?.phoneNumber },
    { label: "អ៊ីមែល", value: student?.email },
    { label: "ទីកន្លែងកំណើត", value: student?.placeOfBirth },
    { label: "អាសយដ្ឋានបច្ចុប្បន្ន", value: student?.currentAddress },
  ];

  return (
    <CollapsibleCard title="ព័ត៌មានផ្ទាល់ខ្លួនរបស់និស្សិត">
      <InfoGrid data={infoItems} />
    </CollapsibleCard>
  );
}
