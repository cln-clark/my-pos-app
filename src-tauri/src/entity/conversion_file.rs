use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "conversion_file")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i32,
    pub company_id: i32,
    #[sea_orm(column_type = "Text")]
    pub unit_to_convert: String,
    #[sea_orm(column_type = "Text")]
    pub convert_to: String,
    pub rate: f64,
    #[sea_orm(column_type = "Text", nullable)]
    pub spare: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
