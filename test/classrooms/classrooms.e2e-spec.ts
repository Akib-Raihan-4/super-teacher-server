import { HttpStatus, INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { User } from "@/common/entities/users.entity";

import { AppModule } from "../../src/app.module";
import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { UserFactory } from "../utils/factories/users.factory";
import { createClassroomDto } from "../utils/helpers/classrooms.helpers";
import { THttpServer } from "../utils/types";

describe("ClassroomsController (e2e)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer();
    app = appInstance;
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    orm = ormInstance;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    jwtService = moduleFixture.get<JwtService>(JwtService);
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

  describe("POST /classrooms", () => {
    let teacherUser: User;
    let teacherToken: string;
    let studentUser: User;
    let studentToken: string;
    let classroomDto: ReturnType<typeof createClassroomDto>;

    beforeEach(async () => {
      teacherUser = await UserFactory.createTeacher(dbService);
      teacherToken = jwtService.sign({
        id: teacherUser.id,
        firstName: teacherUser.firstName,
        email: teacherUser.email,
        userType: teacherUser.userType,
      });

      studentUser = await UserFactory.createStudent(dbService);
      studentToken = jwtService.sign({
        id: studentUser.id,
        firstName: studentUser.firstName,
        email: studentUser.email,
        userType: studentUser.userType,
      });

      classroomDto = createClassroomDto();
    });

    it("should create a classroom successfully when teacher is authenticated", async () => {
      const response = await request(httpServer)
        .post("/classrooms")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(classroomDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: classroomDto.title,
        subject: classroomDto.subject,
        days: classroomDto.days,
        userId: teacherUser.id,
      });

      expect(Date.parse(response.body.classTime)).not.toBeNaN();
    });

    it("should return 403 Forbidden when student tries to create a classroom", async () => {
      await request(httpServer)
        .post("/classrooms")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(classroomDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      await request(httpServer)
        .post("/classrooms")
        .send(classroomDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 400 Bad Request when required fields are missing", async () => {
      const { subject: _, ...invalidClassroomDto } = classroomDto;
      await request(httpServer)
        .post("/classrooms")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(invalidClassroomDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
