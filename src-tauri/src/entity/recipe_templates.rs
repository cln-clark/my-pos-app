use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "recipe_templates")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i32,
    #[sea_orm(column_type = "Text")]
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
    pub base_cost: f64,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::recipe_items::Entity")]
    RecipeItems,
    #[sea_orm(has_many = "super::recipe_product_links::Entity")]
    RecipeProductLinks,
}

impl Related<super::recipe_items::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RecipeItems.def()
    }
}

impl Related<super::recipe_product_links::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RecipeProductLinks.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
