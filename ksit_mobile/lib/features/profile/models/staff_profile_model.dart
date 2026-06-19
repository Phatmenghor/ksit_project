// lib/features/profile/models/staff_profile_model.dart
class StaffProfileModel {
  final int? id;
  final String? username;
  final String? email;
  final List<String>? roles;
  final String? status;
  final String? khmerFirstName;
  final String? khmerLastName;
  final String? englishFirstName;
  final String? englishLastName;
  final String? gender;
  final String? dateOfBirth;
  final String? phoneNumber;
  final String? currentAddress;
  final String? nationality;
  final String? ethnicity;
  final String? placeOfBirth;
  final String? identifyNumber;
  final String? staffId;
  final String? nationalId;
  final String? startWorkDate;
  final String? currentPositionDate;
  final String? employeeWork;
  final String? disability;
  final String? payrollAccountNumber;
  final String? cppMembershipNumber;
  final String? province;
  final String? district;
  final String? commune;
  final String? village;
  final String? officeName;
  final String? currentPosition;
  final String? decreeFinal;
  final String? rankAndClass;
  final StaffDepartmentModel? department;
  final String? profileUrl;
  final String? taughtEnglish;
  final String? threeLevelClass;
  final String? referenceNote;
  final String? technicalTeamLeader;
  final String? assistInTeaching;
  final String? serialNumber;
  final String? twoLevelClass;
  final String? classResponsibility;
  final String? lastSalaryIncrementDate;
  final String? teachAcrossSchools;
  final String? overtimeHours;
  final String? issuedDate;
  final String? suitableClass;
  final String? bilingual;
  final String? academicYearTaught;
  final String? workHistory;
  final String? maritalStatus;
  final String? mustBe;
  final String? affiliatedProfession;
  final String? federationName;
  final String? affiliatedOrganization;
  final String? federationEstablishmentDate;
  final String? wivesSalary;
  final List<TeachersProfessionalRankModel>? teachersProfessionalRank;
  final List<TeacherExperienceModel>? teacherExperience;
  final List<TeacherPraiseOrCriticismModel>? teacherPraiseOrCriticism;
  final List<TeacherEducationModel>? teacherEducation;
  final List<TeacherVocationalModel>? teacherVocational;
  final List<TeacherShortCourseModel>? teacherShortCourse;
  final List<TeacherLanguageModel>? teacherLanguage;
  final List<TeacherFamilyModel>? teacherFamily;
  final String? createdAt;

  const StaffProfileModel({
    this.id,
    this.username,
    this.email,
    this.roles,
    this.status,
    this.khmerFirstName,
    this.khmerLastName,
    this.englishFirstName,
    this.englishLastName,
    this.gender,
    this.dateOfBirth,
    this.phoneNumber,
    this.currentAddress,
    this.nationality,
    this.ethnicity,
    this.placeOfBirth,
    this.identifyNumber,
    this.staffId,
    this.nationalId,
    this.startWorkDate,
    this.currentPositionDate,
    this.employeeWork,
    this.disability,
    this.payrollAccountNumber,
    this.cppMembershipNumber,
    this.province,
    this.district,
    this.commune,
    this.village,
    this.officeName,
    this.currentPosition,
    this.decreeFinal,
    this.rankAndClass,
    this.department,
    this.profileUrl,
    this.taughtEnglish,
    this.threeLevelClass,
    this.referenceNote,
    this.technicalTeamLeader,
    this.assistInTeaching,
    this.serialNumber,
    this.twoLevelClass,
    this.classResponsibility,
    this.lastSalaryIncrementDate,
    this.teachAcrossSchools,
    this.overtimeHours,
    this.issuedDate,
    this.suitableClass,
    this.bilingual,
    this.academicYearTaught,
    this.workHistory,
    this.maritalStatus,
    this.mustBe,
    this.affiliatedProfession,
    this.federationName,
    this.affiliatedOrganization,
    this.federationEstablishmentDate,
    this.wivesSalary,
    this.teachersProfessionalRank,
    this.teacherExperience,
    this.teacherPraiseOrCriticism,
    this.teacherEducation,
    this.teacherVocational,
    this.teacherShortCourse,
    this.teacherLanguage,
    this.teacherFamily,
    this.createdAt,
  });

  factory StaffProfileModel.fromJson(Map<String, dynamic> json) {
    return StaffProfileModel(
      id: json['id'] as int?,
      username: json['username'] as String?,
      email: json['email'] as String?,
      roles: json['roles'] != null
          ? (json['roles'] as List).map((e) => e.toString()).toList()
          : null,
      status: json['status'] as String?,
      khmerFirstName: json['khmerFirstName'] as String?,
      khmerLastName: json['khmerLastName'] as String?,
      englishFirstName: json['englishFirstName'] as String?,
      englishLastName: json['englishLastName'] as String?,
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      currentAddress: json['currentAddress'] as String?,
      nationality: json['nationality'] as String?,
      ethnicity: json['ethnicity'] as String?,
      placeOfBirth: json['placeOfBirth'] as String?,
      identifyNumber: json['identifyNumber'] as String?,
      staffId: json['staffId'] as String?,
      nationalId: json['nationalId'] as String?,
      startWorkDate: json['startWorkDate'] as String?,
      currentPositionDate: json['currentPositionDate'] as String?,
      employeeWork: json['employeeWork'] as String?,
      disability: json['disability'] as String?,
      payrollAccountNumber: json['payrollAccountNumber'] as String?,
      cppMembershipNumber: json['cppMembershipNumber'] as String?,
      province: json['province'] as String?,
      district: json['district'] as String?,
      commune: json['commune'] as String?,
      village: json['village'] as String?,
      officeName: json['officeName'] as String?,
      currentPosition: json['currentPosition'] as String?,
      decreeFinal: json['decreeFinal'] as String?,
      rankAndClass: json['rankAndClass'] as String?,
      department: json['department'] != null
          ? StaffDepartmentModel.fromJson(
              json['department'] as Map<String, dynamic>)
          : null,
      profileUrl: json['profileUrl'] as String?,
      taughtEnglish: json['taughtEnglish'] as String?,
      threeLevelClass: json['threeLevelClass'] as String?,
      referenceNote: json['referenceNote'] as String?,
      technicalTeamLeader: json['technicalTeamLeader'] as String?,
      assistInTeaching: json['assistInTeaching'] as String?,
      serialNumber: json['serialNumber'] as String?,
      twoLevelClass: json['twoLevelClass'] as String?,
      classResponsibility: json['classResponsibility'] as String?,
      lastSalaryIncrementDate: json['lastSalaryIncrementDate'] as String?,
      teachAcrossSchools: json['teachAcrossSchools'] as String?,
      overtimeHours: json['overtimeHours'] as String?,
      issuedDate: json['issuedDate'] as String?,
      suitableClass: json['suitableClass'] as String?,
      bilingual: json['bilingual'] as String?,
      academicYearTaught: json['academicYearTaught'] as String?,
      workHistory: json['workHistory'] as String?,
      maritalStatus: json['maritalStatus'] as String?,
      mustBe: json['mustBe'] as String?,
      affiliatedProfession: json['affiliatedProfession'] as String?,
      federationName: json['federationName'] as String?,
      affiliatedOrganization: json['affiliatedOrganization'] as String?,
      federationEstablishmentDate:
          json['federationEstablishmentDate'] as String?,
      wivesSalary: json['wivesSalary'] as String?,
      teachersProfessionalRank: json['teachersProfessionalRank'] != null
          ? (json['teachersProfessionalRank'] as List)
              .map((e) => TeachersProfessionalRankModel.fromJson(
                  e as Map<String, dynamic>))
              .toList()
          : null,
      teacherExperience: json['teacherExperience'] != null
          ? (json['teacherExperience'] as List)
              .map((e) =>
                  TeacherExperienceModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      teacherPraiseOrCriticism: json['teacherPraiseOrCriticism'] != null
          ? (json['teacherPraiseOrCriticism'] as List)
              .map((e) => TeacherPraiseOrCriticismModel.fromJson(
                  e as Map<String, dynamic>))
              .toList()
          : null,
      teacherEducation: json['teacherEducation'] != null
          ? (json['teacherEducation'] as List)
              .map((e) =>
                  TeacherEducationModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      teacherVocational: json['teacherVocational'] != null
          ? (json['teacherVocational'] as List)
              .map((e) =>
                  TeacherVocationalModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      teacherShortCourse: json['teacherShortCourse'] != null
          ? (json['teacherShortCourse'] as List)
              .map((e) =>
                  TeacherShortCourseModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      teacherLanguage: json['teacherLanguage'] != null
          ? (json['teacherLanguage'] as List)
              .map((e) =>
                  TeacherLanguageModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      teacherFamily: json['teacherFamily'] != null
          ? (json['teacherFamily'] as List)
              .map(
                  (e) => TeacherFamilyModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      createdAt: json['createdAt'] as String?,
    );
  }

  String get displayName {
    if (englishFirstName != null && englishLastName != null) {
      return '$englishFirstName $englishLastName';
    }
    if (khmerFirstName != null && khmerLastName != null) {
      return '$khmerFirstName $khmerLastName';
    }
    return username ?? '';
  }
}

class StaffDepartmentModel {
  final int? id;
  final String? code;
  final String? name;
  final String? urlLogo;
  final String? status;

  const StaffDepartmentModel(
      {this.id, this.code, this.name, this.urlLogo, this.status});

  factory StaffDepartmentModel.fromJson(Map<String, dynamic> json) {
    return StaffDepartmentModel(
      id: json['id'] as int?,
      code: json['code'] as String?,
      name: json['name'] as String?,
      urlLogo: json['urlLogo'] as String?,
      status: json['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'urlLogo': urlLogo,
      'status': status
    };
  }
}

class TeachersProfessionalRankModel {
  final int? id;
  final String? typeOfProfessionalRank;
  final String? description;
  final String? announcementNumber;
  final String? dateAccepted;

  const TeachersProfessionalRankModel(
      {this.id,
      this.typeOfProfessionalRank,
      this.description,
      this.announcementNumber,
      this.dateAccepted});

  factory TeachersProfessionalRankModel.fromJson(Map<String, dynamic> json) {
    return TeachersProfessionalRankModel(
      id: json['id'] as int?,
      typeOfProfessionalRank: json['typeOfProfessionalRank'] as String?,
      description: json['description'] as String?,
      announcementNumber: json['announcementNumber'] as String?,
      dateAccepted: json['dateAccepted'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'typeOfProfessionalRank': typeOfProfessionalRank,
      'description': description,
      'announcementNumber': announcementNumber,
      'dateAccepted': dateAccepted
    };
  }
}

class TeacherExperienceModel {
  final int? id;
  final String? continuousEmployment;
  final String? workPlace;
  final String? startDate;
  final String? endDate;

  const TeacherExperienceModel(
      {this.id,
      this.continuousEmployment,
      this.workPlace,
      this.startDate,
      this.endDate});

  factory TeacherExperienceModel.fromJson(Map<String, dynamic> json) {
    return TeacherExperienceModel(
      id: json['id'] as int?,
      continuousEmployment: json['continuousEmployment'] as String?,
      workPlace: json['workPlace'] as String?,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'continuousEmployment': continuousEmployment,
      'workPlace': workPlace,
      'startDate': startDate,
      'endDate': endDate
    };
  }
}

class TeacherPraiseOrCriticismModel {
  final int? id;
  final String? typePraiseOrCriticism;
  final String? giveBy;
  final String? dateAccepted;

  const TeacherPraiseOrCriticismModel(
      {this.id, this.typePraiseOrCriticism, this.giveBy, this.dateAccepted});

  factory TeacherPraiseOrCriticismModel.fromJson(Map<String, dynamic> json) {
    return TeacherPraiseOrCriticismModel(
      id: json['id'] as int?,
      typePraiseOrCriticism: json['typePraiseOrCriticism'] as String?,
      giveBy: json['giveBy'] as String?,
      dateAccepted: json['dateAccepted'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'typePraiseOrCriticism': typePraiseOrCriticism,
      'giveBy': giveBy,
      'dateAccepted': dateAccepted
    };
  }
}

class TeacherEducationModel {
  final int? id;
  final String? culturalLevel;
  final String? skillName;
  final String? dateAccepted;
  final String? country;

  const TeacherEducationModel(
      {this.id,
      this.culturalLevel,
      this.skillName,
      this.dateAccepted,
      this.country});

  factory TeacherEducationModel.fromJson(Map<String, dynamic> json) {
    return TeacherEducationModel(
      id: json['id'] as int?,
      culturalLevel: json['culturalLevel'] as String?,
      skillName: json['skillName'] as String?,
      dateAccepted: json['dateAccepted'] as String?,
      country: json['country'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'culturalLevel': culturalLevel,
      'skillName': skillName,
      'dateAccepted': dateAccepted,
      'country': country
    };
  }
}

class TeacherVocationalModel {
  final int? id;
  final String? culturalLevel;
  final String? skillOne;
  final String? skillTwo;
  final String? trainingSystem;
  final String? dateAccepted;

  const TeacherVocationalModel(
      {this.id,
      this.culturalLevel,
      this.skillOne,
      this.skillTwo,
      this.trainingSystem,
      this.dateAccepted});

  factory TeacherVocationalModel.fromJson(Map<String, dynamic> json) {
    return TeacherVocationalModel(
      id: json['id'] as int?,
      culturalLevel: json['culturalLevel'] as String?,
      skillOne: json['skillOne'] as String?,
      skillTwo: json['skillTwo'] as String?,
      trainingSystem: json['trainingSystem'] as String?,
      dateAccepted: json['dateAccepted'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'culturalLevel': culturalLevel,
      'skillOne': skillOne,
      'skillTwo': skillTwo,
      'trainingSystem': trainingSystem,
      'dateAccepted': dateAccepted
    };
  }
}

class TeacherShortCourseModel {
  final int? id;
  final String? skill;
  final String? skillName;
  final String? startDate;
  final String? endDate;
  final String? duration;
  final String? preparedBy;
  final String? supportBy;

  const TeacherShortCourseModel(
      {this.id,
      this.skill,
      this.skillName,
      this.startDate,
      this.endDate,
      this.duration,
      this.preparedBy,
      this.supportBy});

  factory TeacherShortCourseModel.fromJson(Map<String, dynamic> json) {
    return TeacherShortCourseModel(
      id: json['id'] as int?,
      skill: json['skill'] as String?,
      skillName: json['skillName'] as String?,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
      duration: json['duration'] as String?,
      preparedBy: json['preparedBy'] as String?,
      supportBy: json['supportBy'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'skill': skill,
      'skillName': skillName,
      'startDate': startDate,
      'endDate': endDate,
      'duration': duration,
      'preparedBy': preparedBy,
      'supportBy': supportBy
    };
  }
}

class TeacherLanguageModel {
  final int? id;
  final String? language;
  final String? reading;
  final String? writing;
  final String? speaking;

  const TeacherLanguageModel(
      {this.id, this.language, this.reading, this.writing, this.speaking});

  factory TeacherLanguageModel.fromJson(Map<String, dynamic> json) {
    return TeacherLanguageModel(
      id: json['id'] as int?,
      language: json['language'] as String?,
      reading: json['reading'] as String?,
      writing: json['writing'] as String?,
      speaking: json['speaking'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'language': language,
      'reading': reading,
      'writing': writing,
      'speaking': speaking
    };
  }
}

class TeacherFamilyModel {
  final int? id;
  final String? nameChild;
  final String? gender;
  final String? dateOfBirth;
  final String? working;

  const TeacherFamilyModel(
      {this.id, this.nameChild, this.gender, this.dateOfBirth, this.working});

  factory TeacherFamilyModel.fromJson(Map<String, dynamic> json) {
    return TeacherFamilyModel(
      id: json['id'] as int?,
      nameChild: json['nameChild'] as String?,
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      working: json['working'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nameChild': nameChild,
      'gender': gender,
      'dateOfBirth': dateOfBirth,
      'working': working
    };
  }
}
