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
                        ColumnDef::new(TxnDtl::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
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
                        ColumnDef::new(TxnDtl::Sku)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::ProductName)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::LineSequence)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::Qty)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::UnitPriceInclTax)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::TxnModeCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::OrderedDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::OrderedTime)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::DiscountCodeId)
                            .integer()
                            .null(),
                    )
                    .col(
                        ColumnDef::new(TxnDtl::DiscountQty)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-txn_dtl-txn_head")
                            .from(TxnDtl::Table, TxnDtl::CompanyCode)
                            .to(TxnHead::Table, TxnHead::CompanyCode)
                            .from_col(TxnDtl::StoreCode)
                            .to_col(TxnHead::StoreCode)
                            .from_col(TxnDtl::TerminalId)
                            .to_col(TxnHead::TerminalId)
                            .from_col(TxnDtl::TransactionNo)
                            .to_col(TxnHead::TransactionNo)
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
    Id,
    CompanyCode,
    StoreCode,
    TerminalId,
    TransactionNo,
    InvoiceNo,
    ProductId,
    Sku,
    ProductName,
    LineSequence,
    Qty,
    UnitPriceInclTax,
    TxnModeCode,
    OrderedDate,
    OrderedTime,
    DiscountCodeId,
    DiscountQty,
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
    