import { EntityManager } from "@mikro-orm/core";

import { Student } from "@/common/entities/students.entity";
import { Teacher } from "@/common/entities/teachers.entity";
import { User } from "@/common/entities/users.entity";

export async function createStudentInDb(
  em: EntityManager,
  user: User,
  student: Student,
): Promise<User> {
  await em.persistAndFlush([user, student]);
  return user;
}

export async function createTeacherInDb(
  em: EntityManager,
  user: User,
  teacher: Teacher,
): Promise<User> {
  await em.persistAndFlush([user, teacher]);
  return user;
}
