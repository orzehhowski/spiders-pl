/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import supertest from "supertest";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import app from "../src/app";

const request = supertest(app);

describe("isAuth middleware", () => {
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

  it("should throw an error if auth header has only 1 word", (done) => {
    request
      .get("/auth/test")
      .set("Authorization", "Bearer")
      .expect(401)
      .end((err: Error, res: supertest.Response) => {
        if (err) return done(err);
        expect(res.body.message).to.equal(
          "Authorization failed - wrong Bearer token structure."
        );
        done();
      });
  });

  it("should throw an error if userId is not a number", (done) => {
    const stub = sinon.stub(jwt, "verify");

    stub.returns({ userId: "test", email: "test", iat: 21, exp: 37 } as any);

    request
      .get("/auth/test")
      .set("Authorization", "Bearer token")
      .expect(401)
      .end((err: Error, res: supertest.Response) => {
        if (err) return done(err);
        expect(res.body.message).to.equal(
          "Authorization failed - wrong User ID."
        );
        done();
        stub.restore();
      });
  });
});
