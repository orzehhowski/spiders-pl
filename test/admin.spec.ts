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

    // suggestion with taken latin name, id = 2
    const createFamilySuggestion = await Suggestion.create({
      userId: 2,
      isNew: true,
      isFamily: true,
      name: "krzyżakowats",
      latinName: "araneidae",
      appearanceDesc: "majom krzyz na dupie",
      behaviorDesc: "dzieci na sieci",
      sources:
        "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
    });
    await createFamilySuggestion.$create("image", {
      src: "img/krzyzak2.jpg",
      author: "Bartosz Orzechowski",
    });

    // update family, id = 3
    await Suggestion.create({
      userId: 2,
      resourceId: 1,
      isNew: false,
      isFamily: true,
      latinName: "araneidae",
      behaviorDesc: "dzieci na sieci",
      appearanceDesc: "",
    });
    // id = 4
    const createSpiderSuggestion = await Suggestion.create({
      userId: 2,
      isNew: true,
      isFamily: false,
      name: "krzyżak wodny",
      latinName: "Larinioides cornutus",
      appearanceDesc: "takie skromne",
      behaviorDesc: "nad wodom siedzom",
    });
    await createSpiderSuggestion.$create("image", {
      src: "/img/krzyzak.jpg",
      author: "Jan Matejko",
    });
    // update spider, id = 5
    await Suggestion.create({
      userId: 2,
      resourceId: 1,
      isNew: false,
      isFamily: false,
      name: "krzyżak podwodny",
      latinName: "Larinioides cornut",
    });

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
    expect(res.body.suggestions).to.be.lengthOf(5);
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

  it("should throw an error because latin name is taken", async () => {
    const res = await request
      .post("/admin/accept/2")
      .set("Authorization", adminBearerToken)
      .expect(422);

    expect(res.body.message).to.be.equal("Latin name is taken.");
  });

  it("should accept a suggestion of creating family with changes", async () => {
    const res = await request
      .post("/admin/accept/2")
      .field("latinName", "testidae")
      .field("sources", "www.google.com")
      .set("Authorization", adminBearerToken)
      .expect(201);

    expect(res.body.message).to.be.equal("Resource created.");

    const createdFamily = await Family.findOne({
      where: { latinName: "testidae" },
      include: Family.associations.image,
    });
    const acceptedSuggestion = await Suggestion.findByPk(2, {
      include: Suggestion.associations.image,
    });

    if (createdFamily) {
      expect(createdFamily.adminId).to.be.equal(adminId);
      expect(createdFamily.userId).to.be.equal(notAdminId);
      expect(createdFamily.appearanceDesc).to.be.equal(
        acceptedSuggestion?.appearanceDesc
      );
      expect(createdFamily.sources).to.be.equal("www.google.com");
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

  it("should throw an error because suggestion is allready accepted.", async () => {
    const res = await request
      .post("/admin/accept/1")
      .set("Authorization", adminBearerToken)
      .expect(400);

    expect(res.body.message).to.be.equal("Suggestion outdated.");
  });

  it("should accept a suggestion of creating spider without changes", async () => {
    const res = await request
      .post("/admin/accept/4")
      .set("Authorization", adminBearerToken)
      .expect(201);

    expect(res.body.message).to.be.equal("Resource created.");

    const createdSpider = await Spider.findOne({
      where: { latinName: "Larinioides cornutus" },
      include: Spider.associations.images,
    });
    const acceptedSuggestion = await Suggestion.findByPk(4, {
      include: Suggestion.associations.image,
    });

    if (createdSpider) {
      expect(createdSpider.adminId).to.be.equal(adminId);
      expect(createdSpider.userId).to.be.equal(notAdminId);
      expect(createdSpider.appearanceDesc).to.be.equal(
        acceptedSuggestion?.appearanceDesc
      );
      if (createdSpider.images) {
        expect(createdSpider.images[0].src).to.be.equal(
          acceptedSuggestion?.image?.src
        );
        expect(createdSpider.images[0].author).to.be.equal("Jan Matejko");
      }
    } else {
      throw new chai.AssertionError("Created family not found!");
    }
    if (acceptedSuggestion) {
      expect(acceptedSuggestion.adminId).to.be.equal(adminId);
      expect(acceptedSuggestion.accepted).to.be.true;
      expect(acceptedSuggestion.image?.author).to.be.equal("Jan Matejko");
    }
  });

  it("should accept a suggestion of editing family without changes", async () => {
    const res = await request
      .post("/admin/accept/3")
      .set("Authorization", adminBearerToken)
      .expect(200);

    expect(res.body.message).to.be.equal("Resource updated.");

    const editedFamily = await Family.findByPk(1, {
      include: Family.associations.image,
    });
    const acceptedSuggestion = await Suggestion.findByPk(3);

    if (editedFamily) {
      expect(editedFamily.behaviorDesc).to.be.equal("dzieci na sieci");
      expect(editedFamily.appearanceDesc).to.be.equal("");
      expect(editedFamily.name).to.be.equal("krzyżakowate");
      expect(editedFamily.image?.src).to.be.equal("img/krzyzak.jpg");
    } else {
      throw new chai.AssertionError("no edited family found");
    }
    if (acceptedSuggestion) {
      expect(acceptedSuggestion.accepted).to.be.true;
      expect(acceptedSuggestion.adminId).to.be.equal(adminId);
    }
  });

  it("should accept a suggestion of editing spider with changes", async () => {
    const res = await request
      .post("/admin/accept/5")
      .set("Authorization", adminBearerToken)
      .field("latinName", "bestius idkaus")
      .field("name", "")
      .field("appearanceDesc", "dlugi czy cos")
      .field("familyId", 2)
      .expect(200);

    expect(res.body.message).to.be.equal("Resource updated.");

    const editedSpider = await Spider.findByPk(1, {
      include: Spider.associations.image,
    });
    const acceptedSuggestion = await Suggestion.findByPk(3);

    if (editedSpider) {
      expect(editedSpider.appearanceDesc).to.be.equal("dlugi czy cos");
      expect(editedSpider.name).to.be.equal("");
      expect(editedSpider.latinName).to.be.equal("bestius idkaus");
      expect(editedSpider.familyId).to.be.equal(2);
      if (editedSpider.images) {
        expect(editedSpider.images[0].src).to.be.equal("img/krzyzak.jpg");
      }
    } else {
      throw new chai.AssertionError("no edited spider found");
    }
    if (acceptedSuggestion) {
      expect(acceptedSuggestion.accepted).to.be.true;
      expect(acceptedSuggestion.adminId).to.be.equal(adminId);
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
