use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create() 
                    .table(TxnDtl::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(TxnDtl::CompanyCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::StoreCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::TerminalId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::TransactionNo)
                            .integer()
                            .not_null(),
                    )
                    .primary_key(
                        Index::create()
                            .primary()
                            .col(TxnDtl::CompanyCode)
                            .col(TxnDtl::StoreCode)
                            .col(TxnDtl::TerminalId)
                            .col(TxnDtl::TransactionNo),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::BusinessDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::CategoryCode)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::InvoiceNo)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::ProductId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::Qty)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::Price)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::Subtotal)
                            .double()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-txn_dtl-company_code")
                            .from(TxnDtl::Table, TxnDtl::CompanyCode) // child
                            .to(CompanyCode::Table, CompanyCode::CompanyCode) // parent
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-txn_dtl-store_code")
                            .from(TxnDtl::Table, TxnDtl::StoreCode) // child
                            .to(StoreCode::Table, StoreCode::StoreCode) // parent
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-txn_dtl-terminal_id")
                            .from(TxnDtl::Table, TxnDtl::TerminalId) // child
                            .to(TxnHead::Table, TxnHead::TerminalId) // parent
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-txn_dtl-transaction_no")
                            .from(TxnDtl::Table, TxnDtl::TransactionNo) // child
                            .to(TxnHead::Table, TxnHead::TransactionNo) // parent
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-txn_dtl-product_id")
                            .from(TxnDtl::Table, TxnDtl::ProductId) // child
                            .to(Products::Table, Products::Id) // parent
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(TxnDtl::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum TxnDtl {
    Table,
    CompanyCode,
    StoreCode,
    TerminalId,
    TransactionNo,
    InvoiceNo,
    ProductId,
    Qty,
    Price,
    Subtotal,
    BusinessDate,
    CategoryCode,
}

#[derive(DeriveIden)]
enum CompanyCode {
    Table,
    CompanyCode,
}

#[derive(DeriveIden)]
enum StoreCode {
    Table,
    StoreCode,
}

#[derive(DeriveIden)]
enum TxnHead {
    Table,
    CompanyCode,
    StoreCode,
    TerminalId,
    TransactionNo,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}
