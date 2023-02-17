export class DuplicatedEmailError extends Error {
  constructor() {
    super("Received email is already in use");
    this.name = "DuplicatedEmailError";
  }
}
