import { InvalidParamError } from "../../errors";
import { CompareFieldsValidation } from "./compare-fields-validation";

describe("CompareFieldsValidation", () => {
  test("Should return a InvalidParamError if validation fails", () => {
    const sut = new CompareFieldsValidation("password", "passwordConfirmation");
    const error = sut.validate({
      password: "any",
      passwordConfirmation: "different_password",
    });
    expect(error).toEqual(new InvalidParamError("passwordConfirmation"));
  });
  test("Should void if validation succeeds", () => {
    const fieldName = "field";
    const fieldToCompare = "anotherField";
    const value = "any";
    const sut = new CompareFieldsValidation(fieldName, fieldToCompare);
    const error = sut.validate({ fieldName: value, fieldToCompare: value });
    expect(error).toBeFalsy();
  });
});
