// lib/features/attendance/widgets/attendance_details_widget.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/attandance/controllers/attendance_controller.dart';
import 'package:ksit_mobile/features/attandance/models/attendance_models.dart';

class AttendanceDetailsWidget extends StatelessWidget {
  final AttendanceHistoryModel attendance;
  final AttendanceController controller;

  const AttendanceDetailsWidget({
    super.key,
    required this.attendance,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const Text(
                  'Attendance Details',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),

          const Divider(),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: controller
                          .getStatusColor(attendance.statusColor)
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: controller
                            .getStatusColor(attendance.statusColor)
                            .withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          attendance.isPresent
                              ? Icons.check_circle
                              : Icons.cancel,
                          size: 48,
                          color:
                              controller.getStatusColor(attendance.statusColor),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          attendance.displayStatus,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: controller
                                .getStatusColor(attendance.statusColor),
                          ),
                        ),
                        if (attendance.displayAttendanceType != 'Regular')
                          Text(
                            '(${attendance.displayAttendanceType})',
                            style: TextStyle(
                              fontSize: 14,
                              color: controller.getStatusColor(
                                  attendance.attendanceTypeColor),
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Course Information
                  _buildDetailSection('Course Information', [
                    _buildDetailRow(
                        'Course Name', attendance.displayCourseName),
                    _buildDetailRow(
                        'Course Code', attendance.courseCode ?? 'N/A'),
                    _buildDetailRow('Credits', '${attendance.credit ?? 0}'),
                    _buildDetailRow('T/E/A',
                        '${attendance.theory ?? 0}/${attendance.execute ?? 0}/${attendance.apply ?? 0}'),
                    _buildDetailRow(
                        'Total Hours', '${attendance.totalHour ?? 0}'),
                  ]),

                  const SizedBox(height: 16),

                  // Class Information
                  _buildDetailSection('Class Information', [
                    _buildDetailRow('Class Code', attendance.displayClassCode),
                    _buildDetailRow('Day', attendance.displayDay),
                    _buildDetailRow('Time',
                        '${attendance.displayStartTime} - ${attendance.displayEndTime}'),
                    _buildDetailRow('Room', attendance.displayRoomName),
                    _buildDetailRow('Teacher', attendance.displayTeacherName),
                  ]),

                  const SizedBox(height: 16),

                  // Academic Information
                  _buildDetailSection('Academic Information', [
                    _buildDetailRow(
                        'Academy Year', '${attendance.academyYear ?? 'N/A'}'),
                    _buildDetailRow('Semester', attendance.displaySemester),
                    _buildDetailRow(
                        'Year Level', attendance.yearLevel ?? 'N/A'),
                  ]),

                  const SizedBox(height: 24),

                  // Attendance Information
                  _buildDetailSection('Attendance Information', [
                    _buildDetailRow(
                        'Student ID', attendance.identifyNumber ?? 'N/A'),
                    _buildDetailRow(
                        'Student Name', attendance.studentName ?? 'N/A'),
                    if (attendance.recordedTime != null &&
                        attendance.recordedTime!.isNotEmpty)
                      _buildDetailRow(
                          'Recorded Time', attendance.displayRecordedTime),
                    _buildDetailRow(
                        'Status', attendance.displayFinalizationStatus),
                    if (attendance.comment != null &&
                        attendance.comment!.isNotEmpty)
                      _buildDetailRow('Comment', attendance.comment!),
                  ]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
