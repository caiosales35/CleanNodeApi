import { MissingParamError } from "../../errors";
import { Validation } from "./validation";
import { ValidationComposite } from "./validation-composite";

interface SutTypes {
  sut: ValidationComposite;
  validationStubs: Validation[];
}

class ValidationStub implements Validation {
  validate(input: any): void | Error {
    return;
  }
}

const makeSut = (): SutTypes => {
  const validationStubs = [new ValidationStub(), new ValidationStub()];
  const sut = new ValidationComposite(validationStubs);
  return { validationStubs, sut };
};

describe("Validation Composite", () => {
  test("Should return an erorr if validation fails", () => {
    const field = "field";
    const { sut, validationStubs } = makeSut();

    jest
      .spyOn(validationStubs[0], "validate")
      .mockReturnValueOnce(new MissingParamError(field));

    const error = sut.validate({ field: "any_value" });
    expect(error).toEqual(new MissingParamError(field));
  });
  test("Should return first error if more then once validation fails", () => {
    const { sut, validationStubs } = makeSut();

    jest.spyOn(validationStubs[0], "validate").mockReturnValueOnce(new Error());
    jest
      .spyOn(validationStubs[1], "validate")
      .mockReturnValueOnce(new MissingParamError("anyField"));

    const error = sut.validate({ fieldName: "any" });
    expect(error).toEqual(new Error());
  });
  test("Should not return if validation succeeds", () => {
    const { sut } = makeSut();
    const error = sut.validate({ field: "any_value" });
    expect(error).toBeFalsy();
  });
});
