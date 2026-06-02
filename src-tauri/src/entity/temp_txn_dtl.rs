use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "TEMP_TXN_DTL")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub company_code: i32,
    pub store_code: i32,
    pub terminal_id: i32,
    pub transaction_no: i32,
    #[sea_orm(column_type = "Text")]
    pub business_date: String,
    #[sea_orm(column_type = "Text")]
    pub category_code: String,
    pub product_id: i32,
    pub qty: i32,
    #[sea_orm(column_type = "Text")]
    pub product_name: String,
    #[sea_orm(column_type = "Text")]
    pub sku: String,
    pub unit_price_incl_tax: f64,
    pub discount_percent: Decimal,
    pub price_before_disc: Decimal,
    pub invoice_no: i32,
    pub line_sequence: i32,
    pub txn_mode_code: i32,
    pub is_vat_exempt: bool,
    pub price_before_less_vat: Decimal,
    pub is_scpwd_disc: bool,
    #[sea_orm(column_type = "Text")]
    pub ordered_date: String,
    #[sea_orm(column_type = "Text")]
    pub ordered_time: String,
    pub discount_code: Option<i32>,
    #[sea_orm(column_type = "Text")]
    pub disc_description: Option<String>,
    pub vatable_amt: f64,
    pub vat_amt: f64,
    pub less_vat: f64,
    pub vat_exempt_amt: f64,
    pub zero_rated_amt: f64,
    pub disc_amt: Decimal,
    pub charge_amt: Decimal,
    pub total_portion_qty: i32,
    pub disc_portion_qty: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
