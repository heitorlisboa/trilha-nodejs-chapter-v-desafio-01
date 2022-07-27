import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { OperationType } from '../../entities/Statement';
import { CreateStatementError } from './CreateStatementError';

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

const user: ICreateUserDTO = {
  name: 'John Doe',
  email: 'john@test.com',
  password: 'secret',
};

let userId: string;

describe('Create statement use case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    userId = (await usersRepository.create(user)).id;
  });

  it('should be able to create a new deposit statement', async () => {
    const depositStatement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Statement description sample',
    };

    const createdDepositStatement = await createStatementUseCase.execute(
      depositStatement
    );

    expect(createdDepositStatement).toMatchObject(depositStatement);
  });

  it('should be able to create a new withdraw statement', async () => {
    // Depositing money to be able to withdraw
    const depositStatement: ICreateStatementDTO = {
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Statement description sample',
    };

    await createStatementUseCase.execute(depositStatement);

    // Withdrawing the deposited money
    const withdrawStatement: ICreateStatementDTO = {
      ...depositStatement,
      type: OperationType.WITHDRAW,
    };

    const createdWithdrawStatement = await createStatementUseCase.execute(
      withdrawStatement
    );

    expect(createdWithdrawStatement).toMatchObject(withdrawStatement);
  });

  it('should be able to create a new transfer statement', async () => {
    const transferAmount = 1000;

    // Creating another user to transfer the money to
    const receiverUser = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@test.com',
      password: 'secret',
    });

    // Depositing money to be able to transfer it to another user
    await createStatementUseCase.execute({
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: transferAmount,
      description: 'Statement description sample',
    });

    // Creating the transfer statement
    const transferStatement: Required<ICreateStatementDTO> = {
      user_id: userId,
      type: OperationType.TRANSFER,
      amount: transferAmount,
      description: 'Statement description sample',
      receiver_id: receiverUser.id,
    };

    const createdTransferStatement = await createStatementUseCase.execute(
      transferStatement
    );

    const { balance, statements } = await statementsRepository.getUserBalance({
      user_id: receiverUser.id,
      with_statement: true,
    });

    // Checking if the statements match
    expect(createdTransferStatement).toMatchObject(transferStatement);
    // Checking if the receiver actually received the money
    expect(balance).toEqual(transferAmount);
    expect(statements[0].sender_id).toEqual(userId);
  });

  it('should not be able to create a new withdraw statement with insufficient funds', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: userId,
        type: OperationType.WITHDRAW,
        amount: 1000,
        description: 'Statement description sample',
      })
    ).rejects.toThrow(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create a new transfer statement with insufficient funds', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: userId,
        type: OperationType.TRANSFER,
        amount: 1000,
        description: 'Statement description sample',
        receiver_id: '1234',
      })
    ).rejects.toThrow(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create a new transfer statement without the `receiver_id` parameter', async () => {
    /* Depositing money to the user first so it doesn't throw the
    `InsufficientFunds` error */
    await createStatementUseCase.execute({
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Statement description sample',
    });

    // Trying to transfer without the `receiver_id`
    await expect(
      createStatementUseCase.execute({
        user_id: userId,
        type: OperationType.TRANSFER,
        amount: 1000,
        description: 'Statement description sample',
      })
    ).rejects.toThrow(CreateStatementError.MissingReceiverId);
  });

  it('should not be able to create a new non-transfer statement with the `receiver_id` parameter', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: userId,
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: 'Statement description sample',
        receiver_id: '1234',
      })
    ).rejects.toThrow(CreateStatementError.UnwantedParameter);
  });

  it('should not be able to create a new statement for a non-existent user', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: '123',
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: 'Statement description sample',
      })
    ).rejects.toThrow(CreateStatementError.UserNotFound);
  });

  it('should not be able to create a new transfer statement from an existent user to a non-existent user', async () => {
    /* Depositing money to the user first so it doesn't throw the
    `InsufficientFunds` error */
    await createStatementUseCase.execute({
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Statement description sample',
    });

    // Trying to transfer with an invalid `receiver_id`
    await expect(
      createStatementUseCase.execute({
        user_id: userId,
        type: OperationType.TRANSFER,
        amount: 1000,
        description: 'Statement description sample',
        receiver_id: '1234',
      })
    ).rejects.toThrow(CreateStatementError.ReceiverNotFound);
  });
});
