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

describe("family controllers", () => {
  let nonAdminToken: string;
  let adminToken: string;
  const imagePath = "test/darownik.jpeg";
  const secondImagePath = "test/walesak.jpeg";
  const imagesToDelete: Array<string> = [];

  before((done) => {
    initialSeed({ isTesting: true })
      .then(() => {
        request
          .post("/auth/login")
          .send({ email: "admin@admin.pl", password: "wlodzimierzbialy123" })
          .expect(200)
          .end((err, res) => {
            if (err) done(err);
            adminToken = res.body.token;
          });
      })
      .then(() => {
        request
          .post("/auth/login")
          .send({ email: "test@test.pl", password: "jeremiaszruzowy321" })
          .expect(200)
          .end((err, res) => {
            if (err) done(err);
            nonAdminToken = res.body.token;
            done();
          });
      })
      .catch((err) => {
        done(err);
      });
  });

  it("GET - should get all two families with no errors", (done) => {
    request
      .get("/family")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.families.length).to.be.equal(2);
        expect(res.body.families[0].latinName).to.be.equal("araneidae");
        done();
      });
  });

  it("GET - should get first family with no errors", (done) => {
    request
      .get("/family/1")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.latinName).to.be.equal("araneidae");
        expect(res.body.spiders).to.be.lengthOf(1);
        done();
      });
  });

  it("GET - should throw 404 error cuz family with given id wasn't found", (done) => {
    request
      .get("/family/4")
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.equal("Family not found.");
        done();
      });
  });

  it("GET - should throw non-numeric id validation error", (done) => {
    request
      .get("/family/hejka")
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.be.equal("ID must be a number!");
        done();
      });
  });

  it("POST - should add a new family", (done) => {
    request
      .post("/family")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("image", imagePath)
      .field("latinName", "testus maximus")
      .field("name", "darownik przedziwny")
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        imagesToDelete.push(res.body.family.image);
        expect(res.body.message).to.be.equal("Family created.");
        expect(res.body.family.name).to.be.equal("darownik przedziwny");
        done();
      });
  });

  it("POST - should add a suggestion of creating spider", (done) => {
    request
      .post("/family")
      .set("Authorization", `Bearer ${nonAdminToken}`)
      .attach("image", "test/darownik.jpeg")
      .field("latinName", "testus maximus")
      .field("name", "darownik przedziwny")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        imagesToDelete.push(res.body.family.image);
        expect(res.body.message).to.be.equal("Create family suggestion sent.");
        expect(res.body.family.name).to.be.equal("darownik przedziwny");
        done();
      });
  });

  it("POST - should throw 422 error cuz no image was provided", (done) => {
    request
      .post("/family")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("latinName", "testus maximus")
      .field("name", "darownik przedziwny")
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.be.equal("Image is required.");
        done();
      });
  });

  it("PUT - should edit family correctly without image", (done) => {
    request
      .put("/family/3")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("latinName", "testus minimus")
      .field("resources", ["https://google.com", "https://wikipedia.org"])
      .field("name", "")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.be.equal("Family updated.");
        expect(res.body.family.name).to.be.equal("");
        expect(res.body.family.image).to.include("darownik.jpeg");
        done();
      });
  });

  it("PUT - should edit family correctly with image", (done) => {
    request
      .put("/family/3")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("image", secondImagePath)
      .field("latinName", "Pardosa amentata")
      .field("name", "wałęsak zwyczajny")
      .field("resources", "")
      .expect(200)
      .end((err, res) => {
        imagesToDelete.push(res.body.family.image);
        if (err) return done(err);
        expect(res.body.message).to.be.equal("Family updated.");
        expect(res.body.family.name).to.be.equal("wałęsak zwyczajny");
        expect(res.body.family.image).to.include("walesak.jpeg");
        expect(res.body.family.resources).to.be.equal("");
        done();
      });
  });

  it("PUT - should add a suggestion of editing a family", (done) => {
    request
      .put("/family/3")
      .set("Authorization", `Bearer ${nonAdminToken}`)
      .attach("image", secondImagePath)
      .field("latinName", "Pardosa amentata")
      .field("name", "wałęsak zwyczajny")
      .field("it", "doesn't exist lol")
      .field("resources", "")
      .expect(200)
      .end((err, res) => {
        imagesToDelete.push(res.body.family.image);
        if (err) return done(err);
        expect(res.body.message).to.be.equal("Edit family suggestion sent.");
        expect(res.body.family.name).to.be.equal("wałęsak zwyczajny");
        expect(res.body.family.image).to.include("walesak.jpeg");
        expect(res.body.family.resources).to.be.equal("");
        done();
      });
  });

  after(async (done) => {
    try {
      Image.drop();
      Spider.drop();
      Family.drop();
      Suggestion.drop();
      User.drop();
      done();
      imagesToDelete.forEach((src) => {
        unlinkImg(src);
      });
    } catch (err) {
      done(err);
    }
  });
});
