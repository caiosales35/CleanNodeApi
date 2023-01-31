import jwt from "jsonwebtoken";
import { JwtAdapter } from "./jwt-adapter";

const anyValue = "any_value";
const secret = "dsafasf";
const defaultToken = "daksnfasfa";

jest.mock("jsonwebtoken", () => ({
  async sign(): Promise<string> {
    return new Promise((resolve) => resolve(defaultToken));
  },
}));

const makeSut = (): JwtAdapter => {
  return new JwtAdapter(secret);
};

describe("Jwt Adapter", () => {
  test("should call sign with correct values", async () => {
    const sut = makeSut();
    const signSpy = jest.spyOn(jwt, "sign");
    await sut.encrypt(anyValue);
    expect(signSpy).toHaveBeenCalledWith({ id: anyValue }, secret);
  });
  test("should return a token on sign success", async () => {
    const sut = makeSut();
    const accessToken = await sut.encrypt(anyValue);
    expect(accessToken).toBe(defaultToken);
  });
  test("should throw if sign throws", async () => {
    const sut = makeSut();
    jest.spyOn(jwt, "sign").mockRejectedValueOnce(new Error() as never);
    await expect(sut.encrypt(anyValue)).rejects.toThrow();
  });
});
