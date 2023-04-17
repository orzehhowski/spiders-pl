/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app";
import User from "../src/models/user";
import initalSeed from "../src/util/initalSeed";

const request = supertest(app);

describe("owner controllers", () => {
  let nonAdminToken: string;
  let adminToken: string;
  let nonAdminBearerToken: string;
  let adminBearerToken: string;

  before(async () => {
    await initalSeed({ isTesting: true });

    const res = await request
      .post("/auth/login")
      .send({ email: "admin@admin.pl", password: "wlodzimierzbialy123" })
      .expect(200);

    adminToken = res.body.token;
    adminBearerToken = `Bearer ${adminToken}`;

    const secondRes = await request
      .post("/auth/login")
      .send({ email: "test@test.pl", password: "jeremiaszruzowy321" })
      .expect(200);

    nonAdminToken = secondRes.body.token;
    nonAdminBearerToken = `Bearer ${nonAdminToken}`;
  });

  it("should throw 403 error cuz user is not owner", async () => {
    const res = await request
      .post("/sudo/set-admin/2")
      .set("Authorization", nonAdminBearerToken)
      .expect(403);

    expect(res.body.message).to.be.equal("Only Owner can edit Admin rights.");
  });

  it("should add and remove admin rights", async () => {
    const res = await request
      .post("/sudo/set-admin/2")
      .set("Authorization", adminBearerToken)
      .expect(200);

    expect(res.body.message).to.be.equal("User admin rights changed.");

    const user = await User.findByPk(2);
    if (user) {
      expect(user.isAdmin).to.be.true;
    }

    const secondRes = await request
      .post("/sudo/set-admin/2?undo")
      .set("Authorization", adminBearerToken)
      .expect(200);

    expect(secondRes.body.message).to.be.equal("User admin rights changed.");

    const userAgain = await User.findByPk(2);

    if (userAgain) {
      expect(userAgain.isAdmin).to.be.false;
    }
  });

  it("should throw 400 errors cuz user allready is/isn't admin", async () => {
    const res = await request
      .post("/sudo/set-admin/1")
      .set("Authorization", adminBearerToken)
      .expect(400);

    expect(res.body.message).to.be.equal("This user allready is admin.");

    const secondRes = await request
      .post("/sudo/set-admin/2?undo")
      .set("Authorization", adminBearerToken)
      .expect(400);

    expect(secondRes.body.message).to.be.equal("This user isn't admin.");
  });
});
