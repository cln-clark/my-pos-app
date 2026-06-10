use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(RecipeTemplates::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(RecipeTemplates::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(RecipeTemplates::Name).string().not_null())
                    .col(ColumnDef::new(RecipeTemplates::Description).string())
                    .col(ColumnDef::new(RecipeTemplates::BaseCost).double().not_null().default(0))
                    .col(ColumnDef::new(RecipeTemplates::CreatedAt).timestamp().not_null().default("CURRENT_TIMESTAMP"))
                    .col(ColumnDef::new(RecipeTemplates::UpdatedAt).timestamp().not_null().default("CURRENT_TIMESTAMP"))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(RecipeTemplates::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum RecipeTemplates {
    Table,
    Id,
    Name,
    Description,
    BaseCost,
    CreatedAt,
    UpdatedAt,
}
