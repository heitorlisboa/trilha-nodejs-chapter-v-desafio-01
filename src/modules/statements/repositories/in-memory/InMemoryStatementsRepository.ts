import {
  ICreateStatementDTOAllInfo,
  IStatementsRepository,
} from '../IStatementsRepository';
import { OperationType, Statement } from '../../entities/Statement';
import { IGetStatementOperationDTO } from '../../useCases/getStatementOperation/IGetStatementOperationDTO';
import {
  IGetBalanceDTO,
  IGetBalanceDTOWithStatementFalse,
  IGetBalanceDTOWithStatementTrue,
} from '../../useCases/getBalance/IGetBalanceDTO';

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  async create(data: ICreateStatementDTOAllInfo): Promise<Statement> {
    const statement = new Statement();

    Object.assign(statement, data);

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(
      (operation) =>
        operation.id === statement_id && operation.user_id === user_id
    );
  }

  async getUserBalance(
    data: IGetBalanceDTOWithStatementFalse
  ): Promise<{ balance: number }>;

  async getUserBalance(
    data: IGetBalanceDTOWithStatementTrue
  ): Promise<{ balance: number; statements: Statement[] }>;

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO) {
    const statements = this.statements.filter(
      (operation) => operation.user_id === user_id
    );

    const balance = statements.reduce((acc, operation) => {
      const isDeposit = operation.type === OperationType.DEPOSIT;
      const isTransferReceiver =
        operation.type === OperationType.TRANSFER && operation.sender_id;

      if (isDeposit || isTransferReceiver) {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0);

    if (with_statement) {
      return {
        statements,
        balance,
      };
    }

    return { balance };
  }
}
