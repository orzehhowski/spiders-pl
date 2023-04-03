import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app";

const request = supertest(app);

describe("isAuth", () => {
  it("should throw an error if no auth header is provided", (done) => {
    request
      .get("/auth/test")
      .expect(401)
      .end((err: Error, res: supertest.Response) => {
        if (err) return done(err);
        expect(res.body.message).to.equal(
          "Authorization failed - no JWT provided."
        );
        done();
      });
  });
});
