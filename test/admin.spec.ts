/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app";
import initialSeed from "../src/util/initalSeed";
import Family from "../src/models/family";
import Spider from "../src/models/spider";
import Image from "../src/models/image";
import Suggestion from "../src/models/suggestion";
import User from "../src/models/user";
import unlinkImg from "../src/util/unlinkImg";

const request = supertest(app);

describe("admin controllers", () => {
  let nonAdminToken: string;
  let adminToken: string;
  let nonAdminBearerToken: string;
  let adminBearerToken: string;

  // const imagePath = "test/img/darownik.jpeg";

  const adminId = 1;
  const notAdminId = 2;

  const imagesToDelete: Array<string> = [];

  before(async () => {
    await initialSeed({ isTesting: true });

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

  it("should get all suggestions", async () => {
    const res = await request
      .get("/admin/suggestion")
      .set("Authorization", adminBearerToken)
      .expect(200);

    expect(res.body.message).to.be.equal("Suggestions received.");
    expect(res.body.suggestions).to.be.lengthOf(1);
    expect(res.body.suggestions[0].isNew).to.be.true;
    expect(res.body.suggestions[0].isFamily).to.be.true;
    expect(res.body.suggestions[0].latinName).to.be.equal("testtest");
  });

  it("should throw a non-admin error", async () => {
    const res = await request
      .get("/admin/suggestion")
      .set("Authorization", nonAdminBearerToken)
      .expect(403);

    expect(res.body.message).to.be.equal("User is not admin.");
  });

  it("should get first suggestion", async () => {
    const res = await request
      .get("/admin/suggestion/1")
      .set("Authorization", adminBearerToken)
      .expect(200);

    expect(res.body.message).to.be.equal("Suggestion received.");
    expect(res.body.suggestion.isNew).to.be.true;
    expect(res.body.suggestion.isFamily).to.be.true;
    expect(res.body.suggestion.name).to.be.equal("krzyżakowats");
  });

  it("should accept a suggestion of creating family without changes", async () => {
    const res = await request
      .post("/admin/accept/1")
      .set("Authorization", adminBearerToken)
      .expect(201);

    expect(res.body.message).to.be.equal("Resource created.");

    const createdFamily = await Family.findOne({
      where: { latinName: "testtest" },
      include: Family.associations.image,
    });
    const acceptedSuggestion = await Suggestion.findByPk(1, {
      include: Suggestion.associations.image,
    });

    if (createdFamily) {
      expect(createdFamily.adminId).to.be.equal(adminId);
      expect(createdFamily.userId).to.be.equal(notAdminId);
      expect(createdFamily.latinName).to.be.equal(
        acceptedSuggestion?.latinName
      );
      expect(createdFamily.appearanceDesc).to.be.equal(
        acceptedSuggestion?.appearanceDesc
      );
      expect(createdFamily.image?.src).to.be.equal(
        acceptedSuggestion?.image?.src
      );
      expect(createdFamily.image.author).to.be.equal("Bartosz Orzechowski");
    } else {
      throw new chai.AssertionError("Created family not found!");
    }
    if (acceptedSuggestion) {
      expect(acceptedSuggestion.adminId).to.be.equal(adminId);
      expect(acceptedSuggestion.accepted).to.be.true;
      expect(acceptedSuggestion.image?.author).to.be.equal(
        "Bartosz Orzechowski"
      );
    }
  });

  after(async () => {
    await Image.drop();
    await Spider.drop();
    await Family.drop();
    await Suggestion.drop();
    await User.drop();
    imagesToDelete.forEach((src) => {
      unlinkImg(src);
    });
  });
});
