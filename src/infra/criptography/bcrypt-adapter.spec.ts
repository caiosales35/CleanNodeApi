import bcrypt from "bcrypt";
import { BcryptAdapter } from "./bcrypt-adapter";

const defaultHash = "any_value_hash";
const salt = 12;

jest.mock("bcrypt", () => ({
  async hash(): Promise<string> {
    return new Promise((resolve) => resolve(defaultHash));
  },
  async compare(): Promise<boolean> {
    return new Promise((resolve) => resolve(true));
  },
}));

const makeSut = (): BcryptAdapter => {
  return new BcryptAdapter(salt);
};

describe("Bcrypt Adapter", () => {
  test("should call hash wih corret values", async () => {
    const sut = makeSut();
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const value = "any_value";
    await sut.hash(value);
    expect(hashSpy).toHaveBeenCalledWith(value, salt);
  });
  test("should return a valid hash on hash success", async () => {
    const sut = makeSut();
    const value = "any_value";
    const hashedValue = await sut.hash(value);
    expect(hashedValue).toBe(defaultHash);
  });
  test("should throw if hash throws", async () => {
    const sut = makeSut();
    jest.spyOn(bcrypt, "hash").mockRejectedValueOnce(new Error() as never);
    const value = "any_value";
    const promise = sut.hash(value);
    await expect(promise).rejects.toThrow();
  });
  test("should call compare wih corret values", async () => {
    const sut = makeSut();
    const compareSpy = jest.spyOn(bcrypt, "compare");
    const value = "any_value";
    const anyHash = "shfjahfasjf";
    await sut.compare(value, anyHash);
    expect(compareSpy).toHaveBeenCalledWith(value, anyHash);
  });
  test("should return true when compare successds", async () => {
    const sut = makeSut();
    const value = "any_value";
    const anyHash = "shfjahfasjf";
    const isValid = await sut.compare(value, anyHash);
    expect(isValid).toBe(true);
  });
  test("should return false when compare fails", async () => {
    const sut = makeSut();
    const value = "any_value";
    const anyHash = "shfjahfasjf";
    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false as never);
    const isValid = await sut.compare(value, anyHash);
    expect(isValid).toBe(false);
  });
  test("should throw if compare throws", async () => {
    const sut = makeSut();
    jest.spyOn(bcrypt, "compare").mockRejectedValueOnce(new Error() as never);
    const value = "any_value";
    const anyHash = "shfjahfasjf";
    const promise = sut.compare(value, anyHash);
    await expect(promise).rejects.toThrow();
  });
});
