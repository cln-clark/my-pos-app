use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Categories::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Categories::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Categories::CategoryCode)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Categories::CategoryName)
                            .string()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

            let db = manager.get_connection();
            db.execute_unprepared("
                                INSERT OR IGNORE INTO categories (category_code, category_name) VALUES
                                ('BEV', 'Beverages'),
                                ('FOO', 'Food'),
                                ('MEAL', 'Meals'),
                                ('SID', 'Sides'),
                                ('ADD', 'Add-ons'),
                                ('DES', 'Desserts'),
                                ('BRK', 'Breakfast'),
                                ").await?;
                                
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Categories::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Categories {
    Table,
    Id,
    CategoryCode,
    CategoryName,
}
