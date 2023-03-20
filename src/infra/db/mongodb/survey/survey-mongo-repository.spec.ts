import { Collection } from "mongodb";
import { AddSurveyModel } from "../../../../domain/usecases/addSurvey";
import { MongoHelper } from "../helpers/mongo-helper";
import { SurveyMongoRepository } from "./survey-mongo-repository";

let surveyCollection: Collection;

const makeSut = (): SurveyMongoRepository => {
  return new SurveyMongoRepository();
};

describe("Survey Mongo Repository", () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getColletion("surveys");
    await surveyCollection.deleteMany({});
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test("Shoud add a survey on success", async () => {
    const sut = makeSut();
    const surveyData: AddSurveyModel = {
      question: "any_question",
      answers: [{ image: "any_url", answer: "any_answer" }],
    };
    await sut.add(surveyData);
    const insertedSurvey = await surveyCollection.findOne({
      question: surveyData.question,
    });
    expect(insertedSurvey).toBeTruthy();
  });
});
