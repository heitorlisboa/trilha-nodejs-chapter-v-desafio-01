import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class accountsTable1616682561481 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'statements',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
        },
        {
          name: 'user_id',
          type: 'uuid',
        },
        {
          name: 'sender_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'receiver_id',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'description',
          type: 'varchar',
        },
        {
          name: 'amount',
          type: 'decimal',
          precision: 7,
          scale: 2,
        },
        {
          name: 'type',
          type: 'enum',
          enum: ['deposit', 'withdraw', 'transfer']
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()'
        }
      ],
      foreignKeys: [
        {
          name: 'fk_statements_user',
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'fk_statements_user_sender',
          columnNames: ['sender_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        {
          name: 'fk_statements_user_receiver',
          columnNames: ['receiver_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('statements');
  }

}
