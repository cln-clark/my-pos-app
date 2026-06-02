use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "CRR_ZX_READING")]
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
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::company_code::Entity",
        from = "Column::CompanyCode",
        to = "super::company_code::Column::CompanyCode"
    )]
    CompanyCode,
    #[sea_orm(
        belongs_to = "super::store_code::Entity",
        from = "Column::StoreCode",
        to = "super::store_code::Column::StoreCode"
    )]
    StoreCode,
    #[sea_orm(
        belongs_to = "super::payment_type::Entity",
        from = "Column::PaymentType",
        to = "super::payment_type::Column::Id"
    )]
    PaymentType,
    #[sea_orm(
        belongs_to = "super::discount_code::Entity",
        from = "Column::DiscountCode",
        to = "super::discount_code::Column::Id"
    )]
    DiscountCode,
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::CashierUserCode",
        to = "super::user::Column::Id"
    )]
    User,
}

impl Related<super::company_code::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CompanyCode.def()
    }
}

impl Related<super::store_code::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::StoreCode.def()
    }
}

impl Related<super::payment_type::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PaymentType.def()
    }
}

impl Related<super::discount_code::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DiscountCode.def()
    }
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
