import { Input } from "@/components/ui/input";
import { Mode } from "@/constants/constant";
import { Controller, useFormContext } from "react-hook-form";

export default function TeachingDetailForm() {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <div className="space-y-3">
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="rankingsAndClass"
            className="mb-1 block text-sm font-bold"
          >
            ឋាននន្តរស័ក្តិ និងថ្នាក់
          </label>
          <Controller
            name="rankAndClass"
            control={control}
            render={({ field }) => (
              <Input
                id="rankingsAndClass"
                disabled={isSubmitting}
                {...field}
                placeholder="ឋាននន្តរស័ក្តិ និងថ្នាក់..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="teaching-english"
            className="mb-1 block text-sm font-bold"
          >
            បង្រៀនភាសាអង់គ្លេស
          </label>
          <Controller
            name="taughtEnglish"
            control={control}
            render={({ field }) => (
              <Input
                id="teaching-english"
                disabled={isSubmitting}
                {...field}
                placeholder="បង្រៀនភាសាអង់គ្លេស..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="threeLevelClass"
            className="mb-1 block text-sm font-bold"
          >
            ថ្នាក់គួបបីកម្រិត
          </label>
          <Controller
            name="threeLevelClass"
            control={control}
            render={({ field }) => (
              <Input
                id="threeLevelClass"
                disabled={isSubmitting}
                {...field}
                placeholder="ថ្នាក់គួបបីកម្រិត..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="reference" className="mb-1 block text-sm font-bold">
            យោង
          </label>
          <Controller
            name="referenceNote"
            control={control}
            render={({ field }) => (
              <Input
                id="reference"
                {...field}
                disabled={isSubmitting}
                placeholder="យោង..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="technical-team-lead"
            className="mb-1 block text-sm font-bold"
          >
            ប្រធានក្រុមបច្ចេកទេស
          </label>
          <Controller
            name="technicalTeamLeader"
            control={control}
            render={({ field }) => (
              <Input
                id="technical-team-lead"
                {...field}
                disabled={isSubmitting}
                placeholder="ប្រធានក្រុមបច្ចេកទេស..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="assistInTeaching"
            className="mb-1 block text-sm font-bold"
          >
            ជួយបង្រៀន
          </label>
          <Controller
            name="assistInTeaching"
            control={control}
            render={({ field }) => (
              <Input
                id="assistInTeaching"
                {...field}
                disabled={isSubmitting}
                placeholder="ជួយបង្រៀន..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="serialNumber"
            className="mb-1 block text-sm font-bold"
          >
            លេខរៀង
          </label>
          <Controller
            name="serialNumber"
            control={control}
            render={({ field }) => (
              <Input
                id="serialNumber"
                {...field}
                disabled={isSubmitting}
                placeholder="លេខរៀង..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="two-classes" className="mb-1 block text-sm font-bold">
            ពីរថ្នាក់ណីរពេល
          </label>
          <Controller
            name="twoLevelClass"
            control={control}
            render={({ field }) => (
              <Input
                id="two-class"
                {...field}
                disabled={isSubmitting}
                placeholder="ពីរថ្នាក់ណីរពេល..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="classResponsibility"
            className="mb-1 block text-sm font-bold"
          >
            ទទួលបន្ទុកថ្នាក់
          </label>
          <Controller
            name="classResponsibility"
            control={control}
            render={({ field }) => (
              <Input
                id="classResponsibility"
                {...field}
                disabled={isSubmitting}
                placeholder="ទទួលបន្ទុកថ្នាក់..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="lastSalaryIncrease"
            className="mb-1 block text-sm font-bold"
          >
            ថ្ងៃខែឡើងការប្រាក់ចុងក្រោយ
          </label>
          <Controller
            name="lastSalaryIncrementDate"
            control={control}
            render={({ field }) => (
              <Input
                id="lastSalaryIncrease"
                type="date"
                {...field}
                disabled={isSubmitting}
                placeholder="ថ្ងៃខែឡើងការប្រាក់ចុងក្រោយ..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="teachAcrossSchools"
            className="mb-1 block text-sm font-bold"
          >
            បង្រៀនឆ្លងសាលា
          </label>
          <Controller
            name="teachAcrossSchools"
            control={control}
            render={({ field }) => (
              <Input
                id="teachAcrossSchools"
                {...field}
                disabled={isSubmitting}
                placeholder="បង្រៀនឆ្លងសាលា..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="overtimeHours"
            className="mb-1 block text-sm font-bold"
          >
            ម៉ោងលើស
          </label>
          <Controller
            name="overtimeHours"
            control={control}
            render={({ field }) => (
              <Input
                id="overtimeHours"
                {...field}
                disabled={isSubmitting}
                placeholder="ម៉ោងលើស..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="issuedDate" className="mb-1 block text-sm font-bold">
            ចុះថ្ងៃទី
          </label>
          <Controller
            name="issuedDate"
            control={control}
            render={({ field }) => (
              <Input
                id="issuedDate"
                type="date"
                disabled={isSubmitting}
                {...field}
                placeholder="ចុះថ្ងៃទី..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="suitableClass"
            className="mb-1 block text-sm font-bold"
          >
            ថ្នាក់គួប
          </label>
          <Controller
            name="suitableClass"
            control={control}
            render={({ field }) => (
              <Input
                id="suitableClass"
                {...field}
                disabled={isSubmitting}
                placeholder="ថ្នាក់គួប..."
                className="bg-gray-100"
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="bilingual" className="mb-1 block text-sm font-bold">
            ពីរភាសា
          </label>
          <Controller
            name="bilingual"
            control={control}
            render={({ field }) => (
              <Input
                id="bilingual"
                {...field}
                disabled={isSubmitting}
                placeholder="ពីរភាសា..."
                className="bg-gray-100"
              />
            )}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="academicYearTaught"
          className="mb-1 block text-sm font-bold"
        >
          បង្រៀននៅឆ្នាំសិក្សា
        </label>
        <Controller
          name="academicYearTaught"
          control={control}
          render={({ field }) => (
            <Input
              id="academicYearTaught"
              disabled={isSubmitting}
              {...field}
              placeholder="បង្រៀននៅឆ្នាំសិក្សា..."
              className="bg-gray-100"
            />
          )}
        />
      </div>
    </div>
  );
}
