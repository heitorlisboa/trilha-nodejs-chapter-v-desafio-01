import { AppError } from '../../../../shared/errors/AppError';

export namespace CreateStatementError {
  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }

  export class InvalidOperationType extends AppError {
    constructor() {
      super('Invalid operation type', 400);
    }
  }

  export class MissingReceiverId extends AppError {
    constructor() {
      super('Receiver ID for transfer operation is missing', 400);
    }
  }

  export class ReceiverNotFound extends AppError {
    constructor() {
      super('Receiver user not found', 404);
    }
  }

  export class UnwantedParameter extends AppError {
    constructor() {
      super('One more parameter than necessary informed', 400);
    }
  }
}
