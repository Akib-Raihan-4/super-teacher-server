import { EntityManager } from "@mikro-orm/core";

import { Classroom } from "@/common/entities/classrooms.entity";
import { Teacher } from "@/common/entities/teachers.entity";

import { createClassroomDto } from "../helpers/classrooms.helpers";

export async function createClassroomInDb(
  em: EntityManager,
  teacher: Teacher,
  classroomDto = createClassroomDto(),
): Promise<Classroom> {
  const classroom = new Classroom();
  classroom.title = classroomDto.title;
  classroom.subject = classroomDto.subject;
  classroom.classTime = new Date(classroomDto.classTime);
  classroom.days = classroomDto.days;
  classroom.teacher = teacher;

  await em.persistAndFlush(classroom);
  return classroom;
}
