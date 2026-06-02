use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "HST_TXN_HDR")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub company_code: i32,
    #[sea_orm(primary_key)]
    pub store_code: i32,
    #[sea_orm(primary_key)]
    pub terminal_id: i32,
    #[sea_orm(primary_key)]
    pub transaction_no: i32,
    pub cashier_user_code: i32,
    pub invoice_no: i32,
    #[sea_orm(column_type = "Text")]
    pub business_date: String,
    #[sea_orm(column_type = "Text")]
    pub transaction_date: String,
    #[sea_orm(column_type = "Text")]
    pub transaction_time: String,
    pub txn_mode_code: i32,
    pub cash_amount_paid: Option<f64>,
    pub encoded_by_user_code: i32,
    pub printed_by_user_code: i32,
    pub total: f64,
    pub payment_id: i32,
    pub change_given: Option<f64>,
    pub original_transaction_no: Option<i32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
