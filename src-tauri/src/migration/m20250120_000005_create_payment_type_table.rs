use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PaymentType::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PaymentType::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(PaymentType::Name)
                            .string()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Seed payment types
        let db = manager.get_connection();
        db.execute_unprepared(
            "INSERT OR IGNORE INTO payment_type (id, name) VALUES (1, 'cash'), (2, 'card')"
        ).await?;
        
        Ok(())
    }
 
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PaymentType::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum PaymentType {
    Table,
    Id,
    Name,
}
