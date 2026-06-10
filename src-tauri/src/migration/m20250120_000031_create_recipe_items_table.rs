use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(RecipeItems::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(RecipeItems::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(RecipeItems::RecipeId).integer().not_null())
                    .col(ColumnDef::new(RecipeItems::IngredientId).integer().not_null())
                    .col(ColumnDef::new(RecipeItems::UsageQty).double().not_null())
                    .col(ColumnDef::new(RecipeItems::UsageUomCode).string().not_null())
                    .col(ColumnDef::new(RecipeItems::Cost).double().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-recipe_items-recipe_id")
                            .from(RecipeItems::Table, RecipeItems::RecipeId)
                            .to(RecipeTemplates::Table, RecipeTemplates::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-recipe_items-ingredient_id")
                            .from(RecipeItems::Table, RecipeItems::IngredientId)
                            .to(IngredientMasterFile::Table, IngredientMasterFile::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(RecipeItems::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum RecipeItems {
    Table,
    Id,
    RecipeId,
    IngredientId,
    UsageQty,
    UsageUomCode,
    Cost,
}

#[derive(DeriveIden)]
enum RecipeTemplates {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum IngredientMasterFile {
    Table,
    Id,
}
