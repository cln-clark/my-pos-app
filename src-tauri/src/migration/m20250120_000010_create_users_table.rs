use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Users::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(Users::Name).string().not_null())
                    .col(ColumnDef::new(Users::Email).string())
                    .col(ColumnDef::new(Users::RoleId).integer().not_null())
                    .col(ColumnDef::new(Users::Pin).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_users_role_id")
                            .from(Users::Table, Users::RoleId)
                            .to(Roles::Table, Roles::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        //Temporary seed users
        let db = manager.get_connection();
        db.execute_unprepared(
            "INSERT OR IGNORE INTO users (name, email, role_id, pin) VALUES ('Alice Johnson', 'alice@example.com', 1, '1234'), ('Sarah Kindrah', 'sarah@example.com', 2, '9999')"
        ).await?;
        
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    Name,
    Email,
    RoleId,
    Pin,
}

#[derive(DeriveIden)]
enum Roles {
    Table,
    Id,
}
