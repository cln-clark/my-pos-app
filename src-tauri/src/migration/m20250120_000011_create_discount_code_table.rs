use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(DiscountCode::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(DiscountCode::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(DiscountCode::Name)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(DiscountCode::Percent)
                            .double()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();
        db.execute_unprepared("
                            INSERT OR IGNORE INTO discount_code (name, percent) VALUES
                            ('Senior Citizen', 20),
                            ('PWD', 20),
                            ('Athlete', 20),
                            ('Regular Discount', 0);
                            ").await?;
                            
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(DiscountCode::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum DiscountCode {
    Table,
    Id,
    Name,
    Percent,
}
