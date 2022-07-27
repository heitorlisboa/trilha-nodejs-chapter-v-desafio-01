import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';
import { OperationType } from '../../entities/Statement';
import { CreateStatementError } from './CreateStatementError';

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { operation_type, receiver_id } = request.params;

    const validOperationType = Object.values(OperationType).includes(
      operation_type as any
    );

    if (!validOperationType) {
      throw new CreateStatementError.InvalidOperationType();
    }

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type: operation_type as OperationType,
      amount,
      description,
      receiver_id,
    });

    return response.status(201).json(statement);
  }
}
