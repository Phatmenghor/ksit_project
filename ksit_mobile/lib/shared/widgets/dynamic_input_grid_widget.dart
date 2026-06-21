// lib/shared/widgets/dynamic_input_grid_widget.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/shared/widgets/custom_text_field.dart';

class DynamicInputGrid extends StatefulWidget {
  final String title;
  final List<String> labels;
  final List<DynamicFieldConfig> fields;
  final List<Map<String, dynamic>> initialData;
  final Function(List<Map<String, dynamic>>) onDataChanged;
  final bool isEditable;
  final int defaultRows;
  final bool isCollapsible;
  final bool initiallyExpanded;
  final bool isReadOnly;

  const DynamicInputGrid({
    super.key,
    required this.title,
    required this.labels,
    required this.fields,
    required this.initialData,
    required this.onDataChanged,
    this.isEditable = true,
    this.defaultRows = 1,
    this.isCollapsible = true,
    this.initiallyExpanded = true,
    this.isReadOnly = false,
  });

  @override
  State<DynamicInputGrid> createState() => _DynamicInputGridState();
}

class _DynamicInputGridState extends State<DynamicInputGrid> {
  late List<Map<String, dynamic>> _data;
  late List<Map<String, TextEditingController>> _controllers;
  late bool _isExpanded;

  @override
  void initState() {
    super.initState();
    // Default to expanded (true) - sections open by default
    _isExpanded = widget.initiallyExpanded;
    _initializeData();
  }

  void _initializeData() {
    if (widget.initialData.isEmpty) {
      _data = List.generate(
        widget.defaultRows,
        (_) => {
          for (var field in widget.fields) field.name: null,
        },
      );
    } else {
      _data = List.from(widget.initialData);
    }
    _initializeControllers();
  }

  void _initializeControllers() {
    _controllers = [];
    for (var row in _data) {
      Map<String, TextEditingController> rowControllers = {};
      for (var field in widget.fields) {
        final value = row[field.name];
        rowControllers[field.name] = TextEditingController(
          text: value?.toString() ?? '',
        );
      }
      _controllers.add(rowControllers);
    }
  }

  @override
  void dispose() {
    for (var rowControllers in _controllers) {
      for (var controller in rowControllers.values) {
        controller.dispose();
      }
    }
    super.dispose();
  }

  void _addRow() {
    setState(() {
      Map<String, dynamic> newRow = {};
      Map<String, TextEditingController> newControllers = {};

      for (var field in widget.fields) {
        newRow[field.name] = null;
        newControllers[field.name] = TextEditingController();
      }

      _data.add(newRow);
      _controllers.add(newControllers);
      _updateParentData();
    });
  }

  void _removeRow(int index) {
    if (_data.length <= 1) return;

    setState(() {
      for (var controller in _controllers[index].values) {
        controller.dispose();
      }

      _data.removeAt(index);
      _controllers.removeAt(index);
      _updateParentData();
    });
  }

  void _updateParentData() {
    List<Map<String, dynamic>> updatedData = [];

    for (int i = 0; i < _data.length; i++) {
      Map<String, dynamic> row = {};

      if (_data[i]['id'] != null) {
        row['id'] = _data[i]['id'];
      }

      for (var field in widget.fields) {
        final controller = _controllers[i][field.name];
        final value = controller?.text;

        if (value != null && value.isNotEmpty) {
          row[field.name] = value;
        }
      }

      if (row.keys.length > (_data[i]['id'] != null ? 1 : 0)) {
        updatedData.add(row);
      }
    }

    widget.onDataChanged(updatedData);
  }

  Widget _buildFieldInput(
    DynamicFieldConfig field,
    TextEditingController controller,
    int rowIndex,
  ) {
    switch (field.type) {
      case DynamicFieldType.text:
        return CustomTextField(
          controller: controller,
          hint: field.placeholder,
          fillColor: Colors.white,
          borderRadius: BorderRadius.circular(4),
          onChanged: (_) => _updateParentData(),
          enabled: widget.isEditable && !widget.isReadOnly,
        );

      case DynamicFieldType.date:
        return CustomTextField(
          controller: controller,
          hint: field.placeholder,
          fillColor: Colors.white,
          borderRadius: BorderRadius.circular(4),
          readOnly: true,
          enabled: widget.isEditable && !widget.isReadOnly,
          suffixIcon: const Icon(Icons.calendar_month, size: 20),
          onTap: (widget.isEditable && !widget.isReadOnly)
              ? () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(1900),
                    lastDate: DateTime(2100),
                  );

                  if (picked != null) {
                    controller.text =
                        '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                    _updateParentData();
                  }
                }
              : null,
        );

      case DynamicFieldType.select:
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: controller.text.isEmpty ? null : controller.text,
              hint: Text(
                field.placeholder,
                style: const TextStyle(fontSize: 14),
              ),
              isExpanded: true,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              items: field.options?.map((option) {
                    return DropdownMenuItem(
                      value: option,
                      child: Text(option),
                    );
                  }).toList() ??
                  [],
              onChanged: (widget.isEditable && !widget.isReadOnly)
                  ? (value) {
                      controller.text = value ?? '';
                      _updateParentData();
                    }
                  : null,
            ),
          ),
        );
    }
  }

  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _data.length,
          itemBuilder: (context, rowIndex) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.body,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Item ${rowIndex + 1}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                          fontSize: 13,
                        ),
                      ),
                      if (widget.isEditable &&
                          !widget.isReadOnly &&
                          _data.length > 1)
                        IconButton(
                          icon: const Icon(
                            Icons.delete_outline,
                            color: AppColors.error,
                            size: 18,
                          ),
                          onPressed: () => _removeRow(rowIndex),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...widget.fields.asMap().entries.map((entry) {
                    final fieldIndex = entry.key;
                    final field = entry.value;
                    final label = widget.labels[fieldIndex];
                    final controller = _controllers[rowIndex][field.name]!;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            label,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 3),
                          _buildFieldInput(field, controller, rowIndex),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            );
          },
        ),
        if (widget.isEditable && !widget.isReadOnly)
          Center(
            child: TextButton.icon(
              onPressed: _addRow,
              icon: const Icon(Icons.add_circle_outline, size: 18),
              label: Text('Add ${widget.title}'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isCollapsible) {
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            title: Text(
              widget.title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            initiallyExpanded: _isExpanded,
            onExpansionChanged: (expanded) {
              setState(() {
                _isExpanded = expanded;
              });
            },
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                child: _buildContent(),
              ),
            ],
          ),
        ),
      );
    } else {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            _buildContent(),
          ],
        ),
      );
    }
  }
}

class DynamicFieldConfig {
  final String name;
  final DynamicFieldType type;
  final String placeholder;
  final List<String>? options;

  const DynamicFieldConfig({
    required this.name,
    required this.type,
    required this.placeholder,
    this.options,
  });
}

enum DynamicFieldType {
  text,
  date,
  select,
}
