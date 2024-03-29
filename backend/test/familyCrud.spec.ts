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
import Source from "../src/models/source";

const request = supertest(app);

describe("family controllers", () => {
  let nonAdminToken: string;
  let adminToken: string;
  let nonAdminBearerToken: string;
  let adminBearerToken: string;

  const imagePath = "test/img/darownik.jpeg";
  const secondImagePath = "test/img/walesak.jpeg";

  const adminId = 1;
  const notAdminId = 2;

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
            adminBearerToken = `Bearer ${adminToken}`;
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
            nonAdminBearerToken = `Bearer ${nonAdminToken}`;
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
      .set("Authorization", adminBearerToken)
      .attach("image", imagePath)
      .field("latinName", "testus maximus")
      .field("name", "darownik przedziwny")
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        imagesToDelete.push(res.body.family.image.src);

        expect(res.body.message).to.be.equal("Family created.");

        Family.findOne({ where: { latinName: "testus maximus" } })
          .then((family) => {
            expect(family).to.not.be.equal(null);
            if (family) {
              expect(family.name).to.be.equal("darownik przedziwny");
              expect(family.userId).to.be.equal(adminId);
              expect(family.adminId).to.be.equal(adminId);
            }
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("POST - should add a suggestion of creating family", (done) => {
    request
      .post("/family")
      .set("Authorization", nonAdminBearerToken)
      .attach("image", imagePath)
      .field("latinName", "testus maximusus")
      .field("name", "darownik przedziwny")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        imagesToDelete.push(res.body.family.image.src);

        expect(res.body.message).to.be.equal("Create family suggestion sent.");

        Suggestion.findOne({ where: { latinName: "testus maximusus" } })
          .then((suggestion) => {
            expect(suggestion).not.to.be.equal(null);
            if (suggestion) {
              expect(suggestion.name).to.be.equal("darownik przedziwny");
              expect(suggestion.userId).to.be.equal(notAdminId);
              expect(suggestion.isNew).to.be.equal(true);
              expect(suggestion.isFamily).to.be.equal(true);
            }

            done();
          })
          .catch((err) => done(err));
      });
  });

  it("POST - should throw 422 error cuz no image was provided", (done) => {
    request
      .post("/family")
      .set("Authorization", adminBearerToken)
      .field("latinName", "testus maximusus")
      .field("name", "darownik przedziwny")
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.be.equal("Image is required.");
        done();
      });
  });

  it("POST - should throw validation error cuz latin name is taken", async () => {
    const res = await request
      .post("/family")
      .set("Authorization", adminBearerToken)
      .attach("image", imagePath)
      .field("latinName", "testus maximus")
      .expect(422);
    expect(res.body.message).to.be.equal(
      "Family with this latin name allready exists."
    );
  });

  it("PUT - should edit family correctly without image", (done) => {
    request
      .put("/family/3")
      .set("Authorization", adminBearerToken)
      .field("latinName", "testus maximus")
      .field("sources", ["https://google.com", "https://wikipedia.org"])
      .field("imageAuthor", "Jacek Placek")
      .field("name", "")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.message).to.be.equal("Family updated.");

        Family.findOne({
          where: { latinName: "testus maximus" },
          include: [Family.associations.image, Family.associations.sources],
        })
          .then((family) => {
            expect(family).to.not.be.equal(null);
            if (family) {
              expect(family.name).to.be.equal("");
              expect(family.image.src).to.include("darownik.jpeg");
              expect(family.image.author).to.be.equal("Jacek Placek");
              console.log("-------------------------------");
              console.log(family.sources);
              expect(family.sources).to.be.lengthOf(2);
              expect(family.userId).to.be.equal(adminId);
            }
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("PUT - should edit family correctly with image", (done) => {
    request
      .put("/family/3")
      .set("Authorization", adminBearerToken)
      .attach("image", secondImagePath)
      .field("latinName", "Pardosa amentata")
      .field("name", "wałęsak zwyczajny")
      .field("sources", ["https://google.com", "https://wikipedia.org"])
      .expect(200)
      .end((err, res) => {
        imagesToDelete.push(res.body.family.image.src);
        if (err) return done(err);

        expect(res.body.message).to.be.equal("Family updated.");
        Family.findOne({
          where: { latinName: "Pardosa amentata" },
          include: [Family.associations.image, Family.associations.sources],
        })
          .then((family) => {
            expect(family).to.not.be.equal(null);
            if (family) {
              expect(family.name).to.be.equal("wałęsak zwyczajny");
              expect(family.image.src).to.include("walesak.jpeg");
              expect(family.image.author).to.be.equal("");
              expect(family.sources).to.be.lengthOf(2);
            }
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("PUT - should add a suggestion of editing a family", (done) => {
    request
      .put("/family/3")
      .set("Authorization", nonAdminBearerToken)
      .attach("image", secondImagePath)
      .field("latinName", "Pardosa amentata")
      .field("name", "wałęsak zwyczajny")
      .field("it", "doesn't exist lol")
      .field("sources", [""])
      .expect(200)
      .end((err, res) => {
        imagesToDelete.push(res.body.family.image.src);
        if (err) return done(err);
        expect(res.body.message).to.be.equal("Edit family suggestion sent.");

        Suggestion.findOne({
          where: { latinName: "Pardosa amentata" },
          include: [
            Suggestion.associations.image,
            Suggestion.associations.sources,
          ],
        })
          .then((suggestion) => {
            expect(suggestion).not.to.be.equal(null);
            if (suggestion) {
              expect(suggestion.name).to.be.equal("wałęsak zwyczajny");
              if (suggestion.image) {
                expect(suggestion.image.src).to.include("walesak.jpeg");
              } else {
                throw new Error("Suggestion has no image!");
              }
              expect(suggestion.sources).to.be.lengthOf(0);
              expect(suggestion.userId).to.be.equal(notAdminId);
            }
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("PUT - should throw validation error cuz latin name is taken", async () => {
    const res = await request
      .put("/family/3")
      .set("Authorization", adminBearerToken)
      .field("latinName", "araneidae")
      .expect(422);
    expect(res.body.message).to.be.equal(
      "Family with this latin name allready exists."
    );
  });

  it("DELETE - should delete family correctly", async () => {
    const res = await request
      .delete("/family/3")
      .set("Authorization", adminBearerToken)
      .expect(200);
    expect(res.body.message).to.be.equal("Family deleted.");
    const deleted = await Family.findOne({
      where: { latinName: "Pardosa amentata" },
    });
    expect(deleted).to.be.equal(null);
  });

  it("DELETE - should throw validation error cuz family contains spiders", async () => {
    const res = await request
      .delete("/family/1")
      .set("Authorization", adminBearerToken)
      .expect(422);
    expect(res.body.message).to.be.equal(
      "You can't delete family containing spiders!"
    );
  });

  after(async () => {
    await Image.drop();
    await Source.drop();
    await Spider.drop();
    await Family.drop();
    await Suggestion.drop();
    await User.drop();
    imagesToDelete.forEach((src) => {
      unlinkImg(src);
    });
  });
});
