import { faker } from "@faker-js/faker";

export function createClassroomDto() {
  return {
    title: faker.lorem.words(3),
    subject: faker.helpers.arrayElement([
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Literature",
    ]),
    classTime: faker.date.future().toISOString(),
    days: faker.helpers.arrayElements(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], {
      min: 1,
      max: 5,
    }),
  };
}
