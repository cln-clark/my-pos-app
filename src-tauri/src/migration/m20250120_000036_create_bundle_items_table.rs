use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(BundleItems::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(BundleItems::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(BundleItems::BundleId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(BundleItems::ProductId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(BundleItems::Quantity)
                            .integer()
                            .not_null()
                            .default(1),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_bundle_items_bundle_id")
                            .from(BundleItems::Table, BundleItems::BundleId)
                            .to(Bundles::Table, Bundles::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_bundle_items_product_id")
                            .from(BundleItems::Table, BundleItems::ProductId)
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
            .drop_table(Table::drop().table(BundleItems::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum BundleItems {
    Table,
    Id,
    BundleId,
    ProductId,
    Quantity,
}

#[derive(DeriveIden)]
enum Bundles {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}
