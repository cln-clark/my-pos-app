use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PosZxReading::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PosZxReading::CompanyCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::StoreCode)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::TerminalId)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::TransactionNo)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::InvoiceNumber)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::BusinessDate)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::PaymentType)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::Amount)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::DiscountPct)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::LocalTax)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::ServiceCharge)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::TakeOutCharge)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::DeliveryCharge)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::CardChequeNum)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::CardHolderName)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::TraceNo)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::ApprovalCode)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::TerminalRefNo)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::TransactionType)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::VoidTxNum)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::DiscountCode)
                            .integer()
                            .null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::SrPwdId)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::OscaPwdName)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::IsVatExempt)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::SrPwdVatExemptSale)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::SrPwdTotalAmount)
                            .decimal()
                            .not_null()
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::SrPwdCount)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::CashierUserCode)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::DateStamp)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::TimeStamp)
                            .string()
                            .not_null()
                            .default("00:00:00"),
                    )
                    .col(
                        ColumnDef::new(PosZxReading::VoidedByUserCode)
                            .string()
                            .not_null()
                            .default(""),
                    )
                    .primary_key(
                        Index::create()
                            .primary()
                            .col(PosZxReading::CompanyCode)
                            .col(PosZxReading::StoreCode)
                            .col(PosZxReading::TerminalId)
                            .col(PosZxReading::TransactionNo)
                            .col(PosZxReading::BusinessDate)
                            .col(PosZxReading::PaymentType),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_ZX_READING-company_code")
                            .from(PosZxReading::Table, PosZxReading::CompanyCode)
                            .to(CompanyCode::Table, CompanyCode::CompanyCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_ZX_READING-store_code")
                            .from(PosZxReading::Table, PosZxReading::StoreCode)
                            .to(StoreCode::Table, StoreCode::StoreCode)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_ZX_READING-payment_type")
                            .from(PosZxReading::Table, PosZxReading::PaymentType)
                            .to(PaymentType::Table, PaymentType::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_ZX_READING-discount_code")
                            .from(PosZxReading::Table, PosZxReading::DiscountCode)
                            .to(DiscountCode::Table, DiscountCode::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-POS_ZX_READING-cashier_user_code")
                            .from(PosZxReading::Table, PosZxReading::CashierUserCode)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PosZxReading::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum PosZxReading {
    Table,
    CompanyCode,
    StoreCode,
    TerminalId,
    TransactionNo,
    InvoiceNumber,
    BusinessDate,
    PaymentType,
    Amount,
    DiscountPct,
    LocalTax,
    ServiceCharge,
    TakeOutCharge,
    DeliveryCharge,
    CardChequeNum,
    CardHolderName,
    TraceNo,
    ApprovalCode,
    TerminalRefNo,
    TransactionType,
    VoidTxNum,
    DiscountCode,
    SrPwdId,
    OscaPwdName,
    IsVatExempt,
    SrPwdVatExemptSale,
    SrPwdTotalAmount,
    SrPwdCount,
    CashierUserCode,
    DateStamp,
    TimeStamp,
    VoidedByUserCode,
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

#[derive(DeriveIden)]
enum DiscountCode {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}
