import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { OperationType } from '../../entities/Statement';
import { GetBalanceError } from './GetBalanceError';

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

const user: ICreateUserDTO = {
  name: 'John Doe',
  email: 'john@test.com',
  password: 'secret',
};

let userId: string;

describe('Get balance use case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
    userId = (await usersRepository.create(user)).id;
  });

  it('should be able to correctly get the user balance and their statements', async () => {
    // Creating a deposit statement
    const depositStatement = await statementsRepository.create({
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Statement description sample',
      user_id: userId,
    });

    // Creating a transfer statement FROM another user
    const transferReceiverStatement = await statementsRepository.create({
      type: OperationType.TRANSFER,
      amount: 1000,
      description: 'Statement description sample',
      user_id: userId,
      sender_id: '1234',
    });

    // Creating a transfer statement TO another user
    const transferSenderStatement = await statementsRepository.create({
      type: OperationType.TRANSFER,
      amount: 500,
      description: 'Statement description sample',
      user_id: userId,
      receiver_id: '1234',
    });

    // Getting the user balance and statements
    const { balance, statements } = await getBalanceUseCase.execute({
      user_id: userId,
    });

    // Calculating the balance to compare
    const calculatedBalance = statements.reduce((acc, operation) => {
      const isDeposit = operation.type === OperationType.DEPOSIT;
      const isTransferReceiver =
        operation.type === OperationType.TRANSFER && operation.sender_id;

      if (isDeposit || isTransferReceiver) {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0);

    // Checking the balance
    expect(typeof balance).toBe('number');
    expect(balance).toEqual(calculatedBalance);
    /* Checking the with an predefined value since the balance calculation may
    have unexpected results */
    expect(balance).toEqual(1500);
    // Checking the statements
    expect(statements[0]).toMatchObject(depositStatement);
    expect(statements[1]).toMatchObject(transferReceiverStatement);
    expect(statements[2]).toMatchObject(transferSenderStatement);
  });

  it('should not be able to get the balance of a non-existent user', async () => {
    await expect(getBalanceUseCase.execute({ user_id: '123' })).rejects.toThrow(
      GetBalanceError
    );
  });
});
