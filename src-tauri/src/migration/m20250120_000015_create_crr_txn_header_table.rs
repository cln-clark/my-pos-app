use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(CrrTxnHdr::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(CrrTxnHdr::CompanyCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::StoreCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::TerminalId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::TransactionNo)
                            .integer()
                            .not_null(),
                    )
                    .primary_key(
                        Index::create()
                            .primary()
                            .col(CrrTxnHdr::CompanyCode)
                            .col(CrrTxnHdr::StoreCode)
                            .col(CrrTxnHdr::TerminalId)
                            .col(CrrTxnHdr::TransactionNo),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::InvoiceNo)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::BusinessDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::TransactionDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::TransactionTime)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::CashierUserCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::TxnModeCode)
                            .integer()
                            .not_null()
                            .default(1),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::Total)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::PaymentId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::ChangeGiven)
                            .double(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::CashAmountPaid)
                            .double(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::EncodedByUserCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::PrintedByUserCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(CrrTxnHdr::OriginalTransactionNo)
                            .integer()
                            .null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-CRR_TXN_HDR-txn_mode_code")
                            .from(CrrTxnHdr::Table, CrrTxnHdr::TxnModeCode)
                            .to(TxnMode::Table, TxnMode::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-CRR_TXN_HDR-cashier_user_code")
                            .from(CrrTxnHdr::Table, CrrTxnHdr::CashierUserCode)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-CRR_TXN_HDR-payment_id")
                            .from(CrrTxnHdr::Table, CrrTxnHdr::PaymentId)
                            .to(PaymentType::Table, PaymentType::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-CRR_TXN_HDR-company_code")
                            .from(CrrTxnHdr::Table, CrrTxnHdr::CompanyCode)
                            .to(CompanyCode::Table, CompanyCode::CompanyCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-CRR_TXN_HDR-store_code")
                            .from(CrrTxnHdr::Table, CrrTxnHdr::StoreCode)
                            .to(StoreCode::Table, StoreCode::StoreCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(CrrTxnHdr::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum CrrTxnHdr {
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
    OriginalTransactionNo,
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
