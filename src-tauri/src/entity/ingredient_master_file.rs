use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "ingredient_master_file")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i32,
    pub company_id: i32,
    #[sea_orm(column_type = "Text")]
    pub ingr_code: String,
    #[sea_orm(column_type = "Text")]
    pub description: String,
    pub cost_price: f64,
    pub min_stock_lvl: i32,
    pub max_stock_lvl: i32,
    pub usage_unit_id: Option<i32>,
    pub base_stock_qty: i32,
    pub last_cost: f64,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::unit_master::Entity",
        from = "Column::UsageUnitId",
        to = "super::unit_master::Column::Id"
    )]
    UsageUnit,
}

impl Related<super::unit_master::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UsageUnit.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
