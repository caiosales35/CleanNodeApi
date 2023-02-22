import {
  AccountModel,
  AddAccount,
  AddAccountModel,
  AddAccountRepository,
  Hasher,
  LoadAccountByEmailRepository,
} from "./db-add-account-protocols";

export class DbAddAccount implements AddAccount {
  constructor(
    private readonly hasher: Hasher,
    private readonly addAccountRepository: AddAccountRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) {}

  async add(accountData: AddAccountModel): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(
      accountData.email
    );
    if (account) return null;

    const hashedPassword = await this.hasher.hash(accountData.password);
    const newAccount = this.addAccountRepository.add({
      ...accountData,
      password: hashedPassword,
    });
    return new Promise((resolve) => resolve(newAccount));
  }
}
