use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Bundles::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Bundles::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Bundles::Name)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Bundles::Description)
                            .string(),
                    )
                    .col(
                        ColumnDef::new(Bundles::Price)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Bundles::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .col(
                        ColumnDef::new(Bundles::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Bundles::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Bundles::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Bundles {
    Table,
    Id,
    Name,
    Description,
    Price,
    IsActive,
    CreatedAt,
    UpdatedAt,
}
