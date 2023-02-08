import { Router } from "express";
import { adaptRoute } from "../adapters/express/express-route-adapter";
import { makeLoginUpController } from "../factories/login/login-factory";
import { makeSingUpController } from "../factories/singup/singup-factory";

export default (router: Router): void => {
  router.post("/singup", adaptRoute(makeSingUpController()));
  router.post("/login", adaptRoute(makeLoginUpController()));
};
