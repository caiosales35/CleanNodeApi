import { MongoHelper } from "../infra/db/mongodb/helpers/mongo-helper";

import env from "./config/env";

MongoHelper.connect(env.mongoUrl)
  .then(async () => {
    const app = (await import("./config/app")).default;
    app.listen(env.port, () => console.log("server running on port 3000"));
  })
  .catch(console.error);
