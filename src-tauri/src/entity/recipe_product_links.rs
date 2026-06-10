use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "recipe_product_links")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i32,
    pub recipe_id: i32,
    pub product_id: Option<i32>,
    pub variation_id: Option<i32>,
    pub is_default: bool,
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
        belongs_to = "super::product::Entity",
        from = "Column::ProductId",
        to = "super::product::Column::Id"
    )]
    Product,
    #[sea_orm(
        belongs_to = "super::product_variations::Entity",
        from = "Column::VariationId",
        to = "super::product_variations::Column::Id"
    )]
    Variation,
}

impl Related<super::recipe_templates::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RecipeTemplate.def()
    }
}

impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Product.def()
    }
}

impl Related<super::product_variations::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Variation.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
