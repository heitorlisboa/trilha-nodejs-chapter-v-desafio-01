import { Router } from 'express';

import { CreateStatementController } from '../modules/statements/useCases/createStatement/CreateStatementController';
import { GetBalanceController } from '../modules/statements/useCases/getBalance/GetBalanceController';
import { GetStatementOperationController } from '../modules/statements/useCases/getStatementOperation/GetStatementOperationController';
import { ensureAuthenticated } from '../shared/infra/http/middlwares/ensureAuthenticated';

const statementRouter = Router();
const getBalanceController = new GetBalanceController();
const createStatementController = new CreateStatementController();
const getStatementOperationController = new GetStatementOperationController();

statementRouter.use(ensureAuthenticated);

statementRouter.get('/balance', getBalanceController.execute);
// Deposit and withdraw operations
statementRouter.post('/:operation_type', createStatementController.execute);
// Transfer operation
statementRouter.post(
  '/:operation_type/:receiver_id',
  createStatementController.execute
);
statementRouter.get('/:statement_id', getStatementOperationController.execute);

export { statementRouter };
