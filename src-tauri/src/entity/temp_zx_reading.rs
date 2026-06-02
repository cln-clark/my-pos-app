use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "TEMP_ZX_READING")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub company_code: i32,
    #[sea_orm(primary_key)]
    pub store_code: i32,
    #[sea_orm(primary_key)]
    pub terminal_id: i32,
    #[sea_orm(primary_key)]
    pub transaction_no: i32,
    #[sea_orm(primary_key)]
    #[sea_orm(column_type = "Text")]
    pub business_date: String,
    #[sea_orm(primary_key)]
    pub payment_type: i32,
    pub invoice_number: i32,
    pub amount: Decimal,
    pub discount_pct: Decimal,
    pub local_tax: Decimal,
    pub service_charge: Decimal,
    pub take_out_charge: Decimal,
    pub delivery_charge: Decimal,
    #[sea_orm(column_type = "Text")]
    pub card_cheque_num: String,
    #[sea_orm(column_type = "Text")]
    pub card_holder_name: String,
    pub trace_no: i32,
    #[sea_orm(column_type = "Text")]
    pub approval_code: String,
    #[sea_orm(column_type = "Text")]
    pub terminal_ref_no: String,
    #[sea_orm(column_type = "Text")]
    pub transaction_type: String,
    pub void_tx_num: i32,
    pub discount_code: Option<i32>,
    #[sea_orm(column_type = "Text")]
    pub sr_pwd_id: String,
    #[sea_orm(column_type = "Text")]
    pub osca_pwd_name: String,
    pub is_vat_exempt: bool,
    pub sr_pwd_vat_exempt_sale: Decimal,
    pub sr_pwd_total_amount: Decimal,
    pub sr_pwd_count: i32,
    #[sea_orm(column_type = "Text")]
    pub cashier_user_code: String,
    #[sea_orm(column_type = "Text")]
    pub date_stamp: String,
    #[sea_orm(column_type = "Text")]
    pub time_stamp: String,
    #[sea_orm(column_type = "Text")]
    pub voided_by_user_code: String,
    #[sea_orm(column_type = "Text")]
    pub void_reason: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
