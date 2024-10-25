import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";

import { Student } from "@/common/entities/students.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";
import { EEducationLevel, EMedium } from "@/common/enums/students.enums";
import { EUserType } from "@/common/enums/users.enums";

export class UserFactory {
  static async createStudent(educationLevel: EEducationLevel = EEducationLevel.SCHOOL): Promise<{
    user: User;
    student: Student;
    plainTextPassword: string;
  }> {
    const plainTextPassword = "TestPassword123!";
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email();
    user.password = hashedPassword;
    user.gender = faker.person.gender();
    user.userType = EUserType.STUDENT;

    const student = new Student();
    student.user = user;
    student.educationLevel = educationLevel;
    student.phoneNo = faker.phone.number();
    student.address = faker.location.streetAddress();
    student.medium =
      educationLevel !== EEducationLevel.UNIVERSITY
        ? faker.helpers.arrayElement(Object.values(EMedium))
        : EMedium.NONE;

    if (educationLevel === EEducationLevel.SCHOOL || educationLevel === EEducationLevel.COLLEGE) {
      student.class = faker.helpers.arrayElement(["8", "9", "10", "11", "12"]);
    } else if (educationLevel === EEducationLevel.UNIVERSITY) {
      student.degree = faker.helpers.arrayElement(["Bachelor", "Master"]);
      student.degreeName = faker.helpers.arrayElement([
        "Computer Science",
        "Economics",
        "Business Administration",
        "Electrical Engineering",
      ]);
      student.semester = faker.helpers.arrayElement(["1", "2", "3", "4", "5", "6", "7", "8"]);
    }

    return { user, student, plainTextPassword };
  }

  static async createTeacher(): Promise<{
    user: User;
    teacher: Teacher;
    plainTextPassword: string;
  }> {
    const plainTextPassword = "TestPassword123!";
    const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email();
    user.password = hashedPassword;
    user.gender = faker.person.gender();
    user.userType = EUserType.TEACHER;

    const teacher = new Teacher();
    teacher.user = user;
    teacher.highestEducationLevel = faker.helpers.arrayElement(["Bachelors", "Masters", "PhD"]);
    teacher.majorSubject = faker.helpers.arrayElement([
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
    ]);
    teacher.subjectsToTeach = faker.helpers.arrayElements(
      ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
      { min: 1, max: 3 },
    );

    return { user, teacher, plainTextPassword };
  }
}
