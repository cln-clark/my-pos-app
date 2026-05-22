use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(TxnMode::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(TxnMode::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(TxnMode::TxnType)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .to_owned(),
            )
            .await?;

        // Seed transaction modes
        let db = manager.get_connection();
        db.execute_unprepared(
            "INSERT OR IGNORE INTO txn_mode (id, txn_type) VALUES (1, 'dine-in'), (2, 'takeout')"
        ).await?;
        
        Ok(())
    }
 
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(TxnMode::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum TxnMode {
    Table,
    Id,
    TxnType,
}
