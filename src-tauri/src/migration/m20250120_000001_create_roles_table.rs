    use sea_orm_migration::prelude::*;

    #[derive(DeriveMigrationName)]
    pub struct Migration;

    #[async_trait::async_trait]
    impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
            manager
                .create_table(
                    Table::create()
                        .table(Roles::Table)
                        .if_not_exists()
                        .col(
                            ColumnDef::new(Roles::Id).integer().primary_key().auto_increment()
                        )
                        .col(ColumnDef::new(Roles::RoleName).string().not_null())
                        .to_owned(),
                )
                .await?;
                
        //Temporary seed roles
        let db = manager.get_connection();
        db.execute_unprepared(
            "INSERT OR IGNORE INTO roles (role_name) VALUES ('Cashier'), ('Manager')"
        ).await?;

            Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
            manager
                .drop_table(Table::drop().table(Roles::Table).to_owned())
                .await
        }
    }

    #[derive(DeriveIden)]
    enum Roles {
        Table,
        Id,
        RoleName,
    }
