import 'package:ksit_mobile/core/utils/enums_utils.dart';

class AttendanceHistoryFilterRequest {
  final Semester? semester;
  final int? academyYear;
  final int pageNo;
  final int pageSize;

  const AttendanceHistoryFilterRequest({
    this.semester,
    this.academyYear,
    this.pageNo = 1,
    this.pageSize = 10,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'pageNo': pageNo,
      'pageSize': pageSize,
      'finalizationStatus': 'FINAL'
    };

    if (semester != null) {
      data['semester'] = semester!.name;
    }

    if (academyYear != null) {
      data['academyYear'] = academyYear;
    }

    return data;
  }

  AttendanceHistoryFilterRequest copyWith({
    Semester? semester,
    int? academyYear,
    int? pageNo,
    int? pageSize,
  }) {
    return AttendanceHistoryFilterRequest(
      semester: semester ?? this.semester,
      academyYear: academyYear ?? this.academyYear,
      pageNo: pageNo ?? this.pageNo,
      pageSize: pageSize ?? this.pageSize,
    );
  }
}
