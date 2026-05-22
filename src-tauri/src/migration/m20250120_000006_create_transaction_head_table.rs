use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(TxnHead::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(TxnHead::CompanyCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::StoreCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::TerminalId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::TransactionNo)
                            .integer()
                            .not_null(),
                    )
                    .primary_key(
                        Index::create()
                            .primary()
                            .col(TxnHead::CompanyCode)
                            .col(TxnHead::StoreCode)
                            .col(TxnHead::TerminalId)
                            .col(TxnHead::TransactionNo),
                    )
                    .col(
                        ColumnDef::new(TxnHead::InvoiceNo)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::BusinessDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::TransactionDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::TransactionTime)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::CashierUserCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::TxnModeCode)
                            .integer()
                            .not_null()
                            .default(1),
                    )
                    .col(
                        ColumnDef::new(TxnHead::Total)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::PaymentId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::ChangeGiven)
                            .double(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::CashAmountPaid)
                            .double(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::EncodedByUserCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TxnHead::PrintedByUserCode)
                            .integer()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-TXN_HEAD-txn_mode_code")
                            .from(TxnHead::Table, TxnHead::TxnModeCode)
                            .to(TxnMode::Table, TxnMode::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-TXN_HEAD-cashier_user_code")
                            .from(TxnHead::Table, TxnHead::CashierUserCode)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-TXN_HEAD-payment_id")
                            .from(TxnHead::Table, TxnHead::PaymentId)
                            .to(PaymentType::Table, PaymentType::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-TXN_HEAD-company_code")
                            .from(TxnHead::Table, TxnHead::CompanyCode)
                            .to(CompanyCode::Table, CompanyCode::CompanyCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-TXN_HEAD-store_code")
                            .from(TxnHead::Table, TxnHead::StoreCode)
                            .to(StoreCode::Table, StoreCode::StoreCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(TxnHead::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum TxnHead {
    Table,
    CompanyCode,
    StoreCode,
    TerminalId,
    TransactionNo,
    CashierUserCode,
    InvoiceNo,
    BusinessDate,
    TransactionDate,
    TransactionTime,
    TxnModeCode,
    CashAmountPaid,
    EncodedByUserCode,
    PrintedByUserCode,
    Total,
    PaymentId,
    ChangeGiven,
}

#[derive(DeriveIden)]
enum TxnMode {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
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
enum PaymentType {
    Table,
    Id,
}
