class PaginatedResponse<T> {
  final List<T> content;
  final int pageNo;
  final int pageSize;
  final int totalElements;
  final int totalPages;
  final bool last;
  final bool first;

  const PaginatedResponse({
    required this.content,
    required this.pageNo,
    required this.pageSize,
    required this.totalElements,
    required this.totalPages,
    this.last = false,
    this.first = true,
  });

  Map<String, dynamic> toJson(Map<String, dynamic> Function(T) toJsonT) {
    return {
      'content': content.map(toJsonT).toList(),
      'pageNo': pageNo,
      'pageSize': pageSize,
      'totalElements': totalElements,
      'totalPages': totalPages,
      'last': last,
      'first': first,
    };
  }

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return PaginatedResponse<T>(
      content: (json['content'] as List<dynamic>)
          .map((e) => fromJsonT(e as Map<String, dynamic>))
          .toList(),
      pageNo: (json['pageNo'] as num).toInt(),
      pageSize: (json['pageSize'] as num).toInt(),
      totalElements: (json['totalElements'] as num).toInt(),
      totalPages: (json['totalPages'] as num).toInt(),
      last: json['last'] as bool? ?? false,
      first: json['first'] as bool? ?? true,
    );
  }

  PaginatedResponse<T> copyWith({
    List<T>? content,
    int? pageNo,
    int? pageSize,
    int? totalElements,
    int? totalPages,
    bool? last,
    bool? first,
  }) {
    return PaginatedResponse<T>(
      content: content ?? this.content,
      pageNo: pageNo ?? this.pageNo,
      pageSize: pageSize ?? this.pageSize,
      totalElements: totalElements ?? this.totalElements,
      totalPages: totalPages ?? this.totalPages,
      last: last ?? this.last,
      first: first ?? this.first,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PaginatedResponse<T> &&
        _listEquals(other.content, content) &&
        other.pageNo == pageNo &&
        other.pageSize == pageSize &&
        other.totalElements == totalElements &&
        other.totalPages == totalPages &&
        other.last == last &&
        other.first == first;
  }

  @override
  int get hashCode {
    return content.hashCode ^
        pageNo.hashCode ^
        pageSize.hashCode ^
        totalElements.hashCode ^
        totalPages.hashCode ^
        last.hashCode ^
        first.hashCode;
  }

  @override
  String toString() {
    return 'PaginatedResponse<$T>(content: $content, pageNo: $pageNo, pageSize: $pageSize, totalElements: $totalElements, totalPages: $totalPages, last: $last, first: $first)';
  }

  bool _listEquals<U>(List<U> a, List<U> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }
}
