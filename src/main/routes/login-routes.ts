import { Router } from "express";
import { adaptRoute } from "../adapters/express/express-route-adapter";
import { makeLoginUpController } from "../factories/controllers/login/login-controller-factory";
import { makeSingUpController } from "../factories/controllers/singup/singup-controller-factory";

export default (router: Router): void => {
  router.post("/singup", adaptRoute(makeSingUpController()));
  router.post("/login", adaptRoute(makeLoginUpController()));
};
