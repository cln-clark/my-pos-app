use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "txn_dtl")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub company_code: i32,
    #[sea_orm(primary_key)]
    pub store_code: i32,
    #[sea_orm(primary_key)]
    pub terminal_id: i32,
    #[sea_orm(primary_key)]
    pub transaction_no: i32,
    pub invoice_no: i32,
    pub product_id: i32,
    pub qty: i32,
    pub price: f64,
    pub subtotal: f64,
    #[sea_orm(column_type = "Text")]
    pub business_date: String,
    #[sea_orm(column_type = "Text")]
    pub category_code: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::txn_head::Entity",
        from = "Column::CompanyCode",
        to = "super::txn_head::Column::CompanyCode"
    )]
    TransactionHead,
    #[sea_orm(
        belongs_to = "super::txn_head::Entity",
        from = "Column::StoreCode",
        to = "super::txn_head::Column::StoreCode"
    )]
    TransactionHead2,
    #[sea_orm(
        belongs_to = "super::txn_head::Entity",
        from = "Column::TerminalId",
        to = "super::txn_head::Column::TerminalId"
    )]
    TransactionHead3,
    #[sea_orm(
        belongs_to = "super::txn_head::Entity",
        from = "Column::TransactionNo",
        to = "super::txn_head::Column::TransactionNo"
    )]
    TransactionHead4,
    #[sea_orm(
        belongs_to = "super::product::Entity",
        from = "Column::ProductId",
        to = "super::product::Column::Id"
    )]
    Product,
}

impl Related<super::txn_head::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::TransactionHead.def()
    }
}

impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Product.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
