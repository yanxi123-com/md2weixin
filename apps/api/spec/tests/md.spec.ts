import fs from "fs";
import path from "path";
import supertest, { Test } from "supertest";
import TestAgent from "supertest/lib/agent";

import app from "@src/server";

import HttpStatusCodes from "@src/common/HttpStatusCodes";

import apiCb from "spec/support/apiCb";
import { TApiCb } from "spec/types/misc";

// Tests
describe("UserRouter", () => {
  let agent: TestAgent<Test>;

  // Run before all tests
  beforeAll((done) => {
    agent = supertest.agent(app);
    done();
  });

  // Test add user
  describe(`"POST: markdown"`, () => {
    // Setup API
    const callApi = (markdown: string, cb: TApiCb) =>
      agent
        .post("/api/wx-md")
        .send({ markdown, theme: "hongfei" })
        .end(apiCb(cb));

    // Test add user success
    it(
      `should return a status code of "${HttpStatusCodes.OK}" if the ` +
        "request was successful.",
      (done) => {
        // Call api
        const markdown = fs.readFileSync(
          path.join(__dirname, "md/demo.md"),
          "utf-8"
        );

        callApi(markdown, (res) => {
          // console.log(res.text);
          expect(res.status).toBe(HttpStatusCodes.OK);
          if (res.status === HttpStatusCodes.OK) {
            const html = JSON.parse(res.text).data;
            fs.writeFileSync(path.join(__dirname, "md/demo.html"), html);
          }

          done();
        });
      }
    );
  });
});
