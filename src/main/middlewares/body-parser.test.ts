import request from "supertest";
import app from "../config/app";

describe("Body Parser Middleware", () => {
  test("should parser body as json", async () => {
    const route = "/test_body_parser";
    const body = { name: "any" };
    app.post(route, (req, res) => res.json(req.body));
    await request(app).post(route).send(body).expect(body);
  });
});
