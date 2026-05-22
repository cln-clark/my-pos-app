use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "store_code")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i32,
    pub store_code: i32,
    pub company_code: i32,
}
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
#[sea_orm(
        belongs_to = "super::company_code::Entity",
        from = "Column::CompanyCode",
        to = "super::company_code::Column::CompanyCode"
    )]
    CompanyCode,}

impl ActiveModelBehavior for ActiveModel {}
