use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(AddOns::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(AddOns::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AddOns::Name)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AddOns::Description)
                            .string(),
                    )
                    .col(
                        ColumnDef::new(AddOns::Price)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AddOns::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .col(
                        ColumnDef::new(AddOns::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(AddOns::UpdatedAt)
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
            .drop_table(Table::drop().table(AddOns::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum AddOns {
    Table,
    Id,
    Name,
    Description,
    Price,
    IsActive,
    CreatedAt,
    UpdatedAt,
}
