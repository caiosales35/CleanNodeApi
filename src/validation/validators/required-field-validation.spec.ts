import { MissingParamError } from "../../presentation/errors";
import { RequiredFieldValidation } from "./required-field-validation";

describe("RequiredFieldValidation", () => {
  test("Should return a MissingParamError if validation fails", () => {
    const fieldName = "field";
    const sut = new RequiredFieldValidation(fieldName);
    const error = sut.validate({ name: "any" });
    expect(error).toEqual(new MissingParamError(fieldName));
  });
  test("Should void if validation succeeds", () => {
    const sut = new RequiredFieldValidation("field");
    const error = sut.validate({ field: "any" });
    expect(error).toBeFalsy();
  });
});
