use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "recipe_items")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i32,
    pub recipe_id: i32,
    pub ingredient_id: i32,
    pub usage_qty: f64,
    #[sea_orm(column_type = "Text")]
    pub usage_uom_code: String,
    pub cost: f64,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::recipe_templates::Entity",
        from = "Column::RecipeId",
        to = "super::recipe_templates::Column::Id"
    )]
    RecipeTemplate,
    #[sea_orm(
        belongs_to = "super::ingredient_master_file::Entity",
        from = "Column::IngredientId",
        to = "super::ingredient_master_file::Column::Id"
    )]
    Ingredient,
}

impl Related<super::recipe_templates::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RecipeTemplate.def()
    }
}

impl Related<super::ingredient_master_file::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Ingredient.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
