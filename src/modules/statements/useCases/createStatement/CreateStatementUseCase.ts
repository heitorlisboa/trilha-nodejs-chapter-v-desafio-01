import { inject, injectable } from 'tsyringe';

import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { StatementMap } from '../../mappers/StatementMap';
import { OperationType } from '../../entities/Statement';

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    type,
    amount,
    description,
    receiver_id,
  }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === OperationType.WITHDRAW || type === OperationType.TRANSFER) {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    if (type === OperationType.TRANSFER) {
      if (!receiver_id) {
        throw new CreateStatementError.MissingReceiverId();
      }

      const receiverUser = await this.usersRepository.findById(receiver_id);

      if (!receiverUser) {
        throw new CreateStatementError.ReceiverNotFound();
      }

      // Creating the statement for the sender
      const statementForSender = await this.statementsRepository.create({
        user_id,
        type,
        amount,
        description,
        receiver_id,
      });

      // Creating the statement for the receiver
      await this.statementsRepository.create({
        user_id: receiver_id,
        type,
        amount,
        description,
        sender_id: user_id,
      });

      const statementDTO = StatementMap.toDTO(statementForSender);

      return statementDTO;
    }

    if (receiver_id) {
      throw new CreateStatementError.UnwantedParameter();
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
    });

    const statementDTO = StatementMap.toDTO(statementOperation);

    return statementDTO;
  }
}
