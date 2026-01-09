class Student {
  final String id;
  final String name;
  final String admissionNumber;
  final String? studentClass;
  final String? house;
  final dynamic mealCardValidity;
  final double feeBalance;
  final String? status;

  Student({
    required this.id,
    required this.name,
    required this.admissionNumber,
    this.studentClass,
    this.house,
    this.mealCardValidity,
    this.feeBalance = 0.0,
    this.status,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'N/A',
      admissionNumber: json['admission_number'] ?? json['admissionNumber'] ?? json['adm_no'] ?? json['reg_no'] ?? json['registration_number'] ?? json['registrationNo'] ?? json['code'] ?? json['qr_code'] ?? 'N/A',
      studentClass: json['student_class'] ?? json['class'] ?? json['grade'] ?? json['form'] ?? json['stream'],
      house: json['house'],
      mealCardValidity: json['meal_card_validity'] ?? json['mealCardValidity'] ?? json['meal_status'] ?? json['validity'],
      feeBalance: double.tryParse((json['fee_balance'] ?? json['feeBalance']).toString()) ?? 0.0,
      status: json['status'],
    );
  }

  Student copyWith({
    String? id,
    String? name,
    String? admissionNumber,
    String? studentClass,
    String? house,
    dynamic mealCardValidity,
    double? feeBalance,
    String? status,
  }) {
    return Student(
      id: id ?? this.id,
      name: name ?? this.name,
      admissionNumber: admissionNumber ?? this.admissionNumber,
      studentClass: studentClass ?? this.studentClass,
      house: house ?? this.house,
      mealCardValidity: mealCardValidity ?? this.mealCardValidity,
      feeBalance: feeBalance ?? this.feeBalance,
      status: status ?? this.status,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'admissionNumber': admissionNumber,
      'class': studentClass,
      'house': house,
      'mealCardValidity': mealCardValidity,
      'feeBalance': feeBalance,
      'status': status,
    };
  }
}
