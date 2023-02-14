export default {
  mongoUrl: process.env.MONGO_URL || "mongodb://mongo:27017/clean-node-api",
  port: process.env.PORT || 3333,
  secret: process.env.SECRET || "anySecret",
  salt: process.env.SALT ? Number(process.env.SALT) : 12,
};
