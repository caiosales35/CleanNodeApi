import { Router } from "express";
import { adaptRoute } from "../adapters/express-route-adapter";
import { makeSingUpController } from "../factories/singup";

export default (router: Router): void => {
  router.post("/singup", adaptRoute(makeSingUpController()));
};
