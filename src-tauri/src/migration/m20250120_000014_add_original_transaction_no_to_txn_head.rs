use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(PosTxnHdr::Table)
                    .add_column(
                        ColumnDef::new(PosTxnHdr::OriginalTransactionNo)
                            .integer()
                            .null()
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(PosTxnHdr::Table)
                    .drop_column(PosTxnHdr::OriginalTransactionNo)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum PosTxnHdr {
    Table,
    OriginalTransactionNo,
}
