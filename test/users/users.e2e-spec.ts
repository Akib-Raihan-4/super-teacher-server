import { HttpStatus, INestApplication } from "@nestjs/common";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { EEducationLevel } from "@/common/enums/students.enums";
import { EUserType } from "@/common/enums/users.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { UserFactory } from "../utils/factories/users.factory";
import { getAccessToken } from "../utils/helpers/access-token.helpers";
import { createUser } from "../utils/helpers/auth.helpers";
import { createStudentInDb, createTeacherInDb } from "../utils/helpers/create-user-in-db.helpers";
import { THttpServer } from "../utils/types";

describe("UsersController (e2e)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer();
    app = appInstance;
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    orm = ormInstance;
  });

  afterAll(async () => {
    await truncateTables(dbService);
    await orm.close();
    await httpServer.close();
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dbService);
  });

  describe("GET /users/user-details", () => {
    it("should return correct details for a school student", async () => {
      const { user, student, plainTextPassword } = await UserFactory.createStudent(
        EEducationLevel.SCHOOL,
      );
      const createdUser = await createStudentInDb(dbService, user, student);

      const token = await getAccessToken(httpServer, createdUser.email, plainTextPassword);

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          gender: createdUser.gender,
          userType: "student",
          student: expect.objectContaining({
            educationLevel: EEducationLevel.SCHOOL,
            medium: expect.any(String),
            class: expect.any(String),
            phoneNo: expect.any(String),
            address: expect.any(String),
          }),
        }),
      );

      expect(response.body.student).not.toHaveProperty("degree");
      expect(response.body.student).not.toHaveProperty("degreeName");
      expect(response.body.student).not.toHaveProperty("semester");
    });

    it("should return correct details for a university student", async () => {
      const { user, student, plainTextPassword } = await UserFactory.createStudent(
        EEducationLevel.UNIVERSITY,
      );
      const createdUser = await createStudentInDb(dbService, user, student);

      const token = await getAccessToken(httpServer, createdUser.email, plainTextPassword);

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          gender: createdUser.gender,
          userType: "student",
          student: expect.objectContaining({
            educationLevel: EEducationLevel.UNIVERSITY,
            degree: expect.any(String),
            degreeName: expect.any(String),
            semester: expect.any(String),
            phoneNo: expect.any(String),
            address: expect.any(String),
          }),
        }),
      );

      expect(response.body.student).not.toHaveProperty("class");
    });

    it("should return correct details for a teacher", async () => {
      const { user, teacher, plainTextPassword } = await UserFactory.createTeacher();
      const createdUser = await createTeacherInDb(dbService, user, teacher);

      const token = await getAccessToken(httpServer, createdUser.email, plainTextPassword);

      const response = await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          gender: createdUser.gender,
          userType: "teacher",
          teacher: expect.objectContaining({
            highestEducationLevel: expect.any(String),
            majorSubject: expect.any(String),
            subjectsToTeach: expect.arrayContaining([expect.any(String)]),
          }),
        }),
      );

      expect(response.body).not.toHaveProperty("student");
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer).get("/users/user-details").expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 401 Unauthorized when an invalid token is provided", async () => {
      await request(httpServer)
        .get("/users/user-details")
        .set("Authorization", "Bearer invalidtoken")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("GET /users/me", () => {
    it("should return user information when authenticated", async () => {
      const user = await createUser(dbService, EUserType.STUDENT);

      const token = await getAccessToken(httpServer, user.email, "password123");

      const response = await request(httpServer)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        userType: user.userType,
      });
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer).get("/users/me").expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 401 Unauthorized when an invalid token is provided", async () => {
      await request(httpServer)
        .get("/users/me")
        .set("Authorization", "Bearer invalidtoken")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
