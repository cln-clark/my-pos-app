use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(AddOnItems::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(AddOnItems::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AddOnItems::AddOnId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AddOnItems::ProductId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AddOnItems::Quantity)
                            .integer()
                            .not_null()
                            .default(1),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_add_on_items_add_on_id")
                            .from(AddOnItems::Table, AddOnItems::AddOnId)
                            .to(AddOns::Table, AddOns::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_add_on_items_product_id")
                            .from(AddOnItems::Table, AddOnItems::ProductId)
                            .to(Products::Table, Products::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(AddOnItems::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum AddOnItems {
    Table,
    Id,
    AddOnId,
    ProductId,
    Quantity,
}

#[derive(DeriveIden)]
enum AddOns {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}
