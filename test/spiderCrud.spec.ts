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

describe("spider controllers", () => {
  let nonAdminToken: string;
  let adminToken: string;
  let nonAdminBearerToken: string;
  let adminBearerToken: string;

  const imagePath = "test/img/darownik.jpeg";

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

  it("GET - should get first spider with no errors", async () => {
    const res = await request.get("/spider/1").expect(200);
    expect(res.body.latinName).to.be.equal("araneidae ogrodae");
    expect(res.body.resources).to.be.lengthOf(1);
    expect(res.body.images).to.be.lengthOf(2);
  });

  it("GET - should throw 404 error cuz spider with given id wasn't found", async () => {
    const res = await request.get("/spider/4").expect(404);
    expect(res.body.message).to.equal("Spider not found.");
  });

  it("GET - should throw non-numeric id validation error", async () => {
    const res = await request.get("/spider/hejka").expect(422);
    expect(res.body.message).to.be.equal("ID must be a number!");
  });

  it("POST - should add a new spider", async () => {
    const res = await request
      .post("/spider")
      .set("Authorization", adminBearerToken)
      .attach("image", imagePath)
      .field("latinName", "testus maximus")
      .field("familyId", 1)
      .field("name", "darownik przedziwny")
      .expect(201);

    imagesToDelete.push(res.body.spider.image.src);

    expect(res.body.message).to.be.equal("Spider created.");

    const spider = await Spider.findOne({
      where: { latinName: "testus maximus" },
      include: Spider.associations.images,
    });

    expect(spider).to.not.be.equal(null);
    if (spider) {
      expect(spider.name).to.be.equal("darownik przedziwny");
      expect(spider.userId).to.be.equal(adminId);
      expect(spider.adminId).to.be.equal(adminId);
      expect(spider.images).to.be.lengthOf(1);
      if (spider.images) {
        expect(spider.images[0].src).to.include("darownik.jpeg");
      }
    }
  });

  it("POST - should add a suggestion of creating spider", async () => {
    const res = await request
      .post("/spider")
      .set("Authorization", nonAdminBearerToken)
      .attach("image", imagePath)
      .field("latinName", "testus maximusus")
      .field("familyId", 1)
      .field("name", "darownik przedziwny")
      .field("imageAuthor", "Bartosz Orzechowski")
      .expect(200);
    imagesToDelete.push(res.body.spider.image.src);

    expect(res.body.message).to.be.equal("Create spider suggestion sent.");

    const suggestion = await Suggestion.findOne({
      where: { latinName: "testus maximusus" },
      include: Suggestion.associations.image,
    });
    expect(suggestion).not.to.be.equal(null);
    if (suggestion) {
      expect(suggestion.name).to.be.equal("darownik przedziwny");
      expect(suggestion.userId).to.be.equal(notAdminId);
      expect(suggestion.isNew).to.be.equal(true);
      expect(suggestion.isFamily).to.be.equal(false);
      expect(suggestion.image).not.to.be.equal(null);
      if (suggestion.image) {
        expect(suggestion.image.src).to.include("darownik.jpeg");
        expect(suggestion.image.author).to.be.equal("Bartosz Orzechowski");
      }
    }
  });

  it("POST - should throw 422 error cuz no image was provided", async () => {
    const res = await request
      .post("/spider")
      .set("Authorization", adminBearerToken)
      .field("latinName", "testus maximusus")
      .field("familyId", 1)
      .field("name", "darownik przedziwny")
      .expect(422);
    expect(res.body.message).to.be.equal("Image is required.");
  });

  it("POST - should throw validation error cuz latin name is taken", async () => {
    const res = await request
      .post("/spider")
      .set("Authorization", adminBearerToken)
      .attach("image", imagePath)
      .field("familyId", 1)
      .field("latinName", "testus maximus")
      .expect(422);
    expect(res.body.message).to.be.equal(
      "Spider with this latin name allready exists."
    );
  });

  it("PUT - should edit spider correctly", async () => {
    const res = await request
      .put("/spider/3")
      .set("Authorization", adminBearerToken)
      .field("latinName", "testus maximus")
      .field("resources", ["https://google.com", "https://wikipedia.org"])
      .field("name", "")
      .expect(200);
    expect(res.body.message).to.be.equal("Spider updated.");

    const spider = await Spider.findOne({
      where: { latinName: "testus maximus" },
    });
    expect(spider).to.not.be.equal(null);
    if (spider) {
      expect(spider.name).to.be.equal("");
      expect(spider.resources).to.be.equal(
        "https://google.com https://wikipedia.org "
      );
      expect(spider.userId).to.be.equal(adminId);
    }
  });

  // -------------------TODO----------------------

  // it("PUT - should add a suggestion of editing spider", async () => {
  //   const res = await request
  //     .put("/spider/3")
  //     .set("Authorization", nonAdminBearerToken)
  //     .field("latinName", "Pardosa amentata")
  //     .field("name", "wałęsak zwyczajny")
  //     .field("it", "doesn't exist lol")
  //     .field("resources", "")
  //     .expect(200);

  //   expect(res.body.message).to.be.equal("Update spider suggestion sent.");

  //   const suggestions = await Suggestion.findAll();
  //   console.log("--------all suggestions--------------");
  //   console.log(suggestions);
  //   const suggestion = suggestions[2];
  //   console.log("--------third suggestion------------");
  //   console.log(suggestion);
  //   expect(suggestion).not.to.be.equal(null);
  //   if (suggestion) {
  //     expect(suggestion.name).to.be.equal("wałęsak zwyczajny");
  //     expect(suggestion.resources).to.be.equal("");
  //     expect(suggestion.userId).to.be.equal(notAdminId);
  //   }
  // });

  it("PUT - should throw validation error cuz latin name is taken", async () => {
    const res = await request
      .put("/spider/3")
      .set("Authorization", adminBearerToken)
      .field("latinName", "Metellina segmentata")
      .expect(422);
    expect(res.body.message).to.be.equal(
      "Spider with this latin name allready exists."
    );
  });

  it("DELETE - should delete spider with images correctly", async () => {
    const res = await request
      .delete("/spider/3?includeImages")
      .set("Authorization", adminBearerToken)
      .expect(200);
    expect(res.body.message).to.be.equal("Spider deleted.");
    const deleted = await Spider.findOne({
      where: { latinName: "Pardosa amentata" },
    });
    expect(deleted).to.be.null;

    const images = await Image.findOne({ where: { spiderId: 3 } });
    const aloneImages = await Image.findOne({
      where: { spiderId: null, familyId: null, suggestionId: null },
    });

    expect(images).to.be.null;
    expect(aloneImages).to.be.null;
  });

  it("DELETE - should delete spider without images correctly", async () => {
    const res = await request
      .delete("/spider/2")
      .set("Authorization", adminBearerToken)
      .expect(200);
    expect(res.body.message).to.be.equal("Spider deleted.");
    const deleted = await Spider.findOne({
      where: { latinName: "Metellina segmentata" },
    });
    expect(deleted).to.be.null;

    // find image with no assigned objects - it's the one from deleted spider
    const images = await Image.findOne({
      where: { spiderId: null, familyId: null, suggestionId: null },
    });

    expect(images).not.to.be.null;
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
