import bcrypt from "bcrypt";
import { BcryptAdapter } from "./bcrypt-adapter";

const defaultHash = "any_value_hash";
const salt = 12;

jest.mock("bcrypt", () => ({
  async hash(): Promise<string> {
    return new Promise((resolve) => resolve(defaultHash));
  },
}));

const makeSut = (): BcryptAdapter => {
  return new BcryptAdapter(salt);
};

describe("Bcrypt Adapter", () => {
  test("should call Bcrypt wih corret values", async () => {
    const sut = makeSut();
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const value = "any_value";
    await sut.encrypt(value);
    expect(hashSpy).toHaveBeenCalledWith(value, salt);
  });
  test("should return a hash on success", async () => {
    const sut = makeSut();
    const value = "any_value";
    const hashedValue = await sut.encrypt(value);
    expect(hashedValue).toBe(defaultHash);
  });
  test("should throw if Bcrypt throws", async () => {
    const sut = makeSut();
    jest.spyOn(bcrypt, "hash").mockRejectedValueOnce(new Error() as never);
    const value = "any_value";
    const promise = sut.encrypt(value);
    await expect(promise).rejects.toThrow();
  });
});
