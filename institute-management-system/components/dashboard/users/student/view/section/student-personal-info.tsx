// components/student/StudentPersonalInfo.tsx
import CollapsibleCard from "@/components/shared/collapsibleCard";
import InfoGrid from "../../../shared/user-personal-history";
import { StudentByIdModel } from "@/model/user/student/student.respond.model";
import { formatValue } from "@/utils/map-helper/student";

interface StudentProfileProps {
  student: StudentByIdModel | null;
}

export default function StudentPersonalInfo({ student }: StudentProfileProps) {
  // Helper function to combine names and handle empty values

  const infoItems = [
    {
      label: "គោត្តនាម និងនាម",
      value: formatValue(
        `${student?.khmerFirstName ?? ""} ${
          student?.khmerLastName ?? ""
        }`.trim()
      ),
    },
    {
      label: "អក្សរឡាតាំង",
      value: formatValue(
        `${student?.englishFirstName ?? ""} ${
          student?.englishLastName ?? ""
        }`.trim()
      ),
    },
    {
      label: "អត្តលេខនិស្សិត",
      value: formatValue(student?.identifyNumber),
    },
    { label: "ភេទ", value: formatValue(student?.gender) },
    { label: "ថ្ងៃខែឆ្នាំកំណើត", value: formatValue(student?.dateOfBirth) },
    { label: "ជនជាតិ", value: formatValue(student?.ethnicity) },
    { label: "សញ្ជាតិ", value: formatValue(student?.nationality) },
    {
      label: "កម្រឺតសិក្សា",
      value: formatValue(student?.studentClass?.degree),
    },
    {
      label: "ដេប៉ាតឺម៉ង",
      value: formatValue(student?.studentClass?.major?.department?.name),
    },
    {
      label: "ជំនាញសិក្សា",
      value: formatValue(student?.studentClass?.major?.name),
    },
    { label: "លេខទូរស័ព្ទ", value: formatValue(student?.phoneNumber) },
    { label: "អ៊ីមែល", value: formatValue(student?.email) },
    { label: "ទីកន្លែងកំណើត", value: formatValue(student?.placeOfBirth) },
    {
      label: "អាសយដ្ឋានបច្ចុប្បន្ន",
      value: formatValue(student?.currentAddress),
    },
  ];

  return (
    <CollapsibleCard title="ព័ត៌មានផ្ទាល់ខ្លួនរបស់និស្សិត">
      <InfoGrid data={infoItems} columns={2} />
    </CollapsibleCard>
  );
}
