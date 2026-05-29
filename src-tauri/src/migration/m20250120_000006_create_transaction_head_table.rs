use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PosTxnHdr::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PosTxnHdr::CompanyCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::StoreCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::TerminalId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::TransactionNo)
                            .integer()
                            .not_null(),
                    )
                    .primary_key(
                        Index::create()
                            .primary()
                            .col(PosTxnHdr::CompanyCode)
                            .col(PosTxnHdr::StoreCode)
                            .col(PosTxnHdr::TerminalId)
                            .col(PosTxnHdr::TransactionNo),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::InvoiceNo)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::BusinessDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::TransactionDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::TransactionTime)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::CashierUserCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::TxnModeCode)
                            .integer()
                            .not_null()
                            .default(1),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::Total)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::PaymentId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::ChangeGiven)
                            .double(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::CashAmountPaid)
                            .double(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::EncodedByUserCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosTxnHdr::PrintedByUserCode)
                            .integer()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_TXN_HDR-txn_mode_code")
                            .from(PosTxnHdr::Table, PosTxnHdr::TxnModeCode)
                            .to(TxnMode::Table, TxnMode::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_TXN_HDR-cashier_user_code")
                            .from(PosTxnHdr::Table, PosTxnHdr::CashierUserCode)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_TXN_HDR-payment_id")
                            .from(PosTxnHdr::Table, PosTxnHdr::PaymentId)
                            .to(PaymentType::Table, PaymentType::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_TXN_HDR-company_code")
                            .from(PosTxnHdr::Table, PosTxnHdr::CompanyCode)
                            .to(CompanyCode::Table, CompanyCode::CompanyCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_TXN_HDR-store_code")
                            .from(PosTxnHdr::Table, PosTxnHdr::StoreCode)
                            .to(StoreCode::Table, StoreCode::StoreCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PosTxnHdr::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum PosTxnHdr {
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
