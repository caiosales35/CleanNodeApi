import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

interface SutType {
  sut: LogControllerDecorator;
  controllerStub: ControllerStub;
}

class ControllerStub implements Controller {
  async handle(httpResquest: HttpRequest): Promise<HttpResponse> {
    const httpResponse: HttpResponse = {
      statusCode: 200,
      body: httpResquest.body,
    };
    return new Promise((resolve) => resolve(httpResponse));
  }
}

const makeSut = (): SutType => {
  const controllerStub = new ControllerStub();
  const sut = new LogControllerDecorator(controllerStub);
  return { controllerStub, sut };
};

describe("LogController Decorator", () => {
  test("Should call controller handle", async () => {
    const { sut, controllerStub } = makeSut();

    const handleSpy = jest.spyOn(controllerStub, "handle");
    const httpRequest: HttpRequest = {
      body: {
        email: "any@email.com",
        name: "any",
        password: "any",
        passwordConfirmation: "any",
      },
    };
    await sut.handle(httpRequest);
    expect(handleSpy).toHaveBeenCalledWith(httpRequest);
  });
});
