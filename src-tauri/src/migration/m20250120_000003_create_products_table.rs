use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Products::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Products::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(Products::Sku).string().not_null())
                    .col(ColumnDef::new(Products::Name).string().not_null())
                    .col(ColumnDef::new(Products::Price).double().not_null())
                    .col(ColumnDef::new(Products::CategoryId).integer())
                    .col(ColumnDef::new(Products::Stock).integer().not_null())
                    .col(ColumnDef::new(Products::Description).string())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-products-category_id")
                            .from(Products::Table, Products::CategoryId)
                            .to(Category::Table, Category::Id)
                            .on_delete(ForeignKeyAction::SetNull),
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
                            ('FEE', 'Fees');
                            ").await?;

        db.execute_unprepared("
                            INSERT OR IGNORE INTO products (name, sku, price, stock, category_id, description) VALUES
                            ('Hot Coffee','DRK-HC',50.00,999,1,'Fresh brewed hot coffee'),
                            ('Iced Coffee','DRK-IC',65.00,999,1,'Chilled iced coffee'),
                            ('Soft Drinks','DRK-SD',40.00,999,1,'Coke / Sprite / Soda'),

                            ('Classic Burger','BUR-CL',70.00,999,2,'Beef patty with basic toppings'),
                            ('Cheeseburger','BUR-CH',85.00,999,2,'Burger with cheese slice'),
                            ('Chicken Sandwich','SAN-CH',90.00,999,2,'Crispy chicken sandwich'),

                            ('Burger Combo Meal','COMBO-BUR',120.00,999,3,'Burger + fries + drink'),
                            ('Chicken Meal','COMBO-CH',130.00,999,3,'Chicken sandwich + fries + drink'),
                            ('Rice Meal','MEAL-RICE',110.00,999,3,'Chicken or beef with rice'),

                            ('French Fries (Small)','SID-FRY-S',35.00,999,4,'Crispy small fries'),
                            ('French Fries (Large)','SID-FRY-L',60.00,999,4,'Crispy large fries'),
                            ('Onion Rings','SID-ONR',55.00,999,4,'Golden fried onion rings'),

                            ('Extra Cheese','ADD-CHS',15.00,999,5,'Add cheese to any item'),
                            ('Extra Patty','ADD-PAT',35.00,999,5,'Extra beef patty'),
                            ('Extra Sauce','ADD-SAU',10.00,999,5,'Ketchup, mayo, BBQ, etc.'),

                            ('Ice Cream Cone','DES-IC',25.00,999,6,'Soft serve ice cream'),
                            ('Milkshake','DES-MS',70.00,999,6,'Chocolate or vanilla shake'),

                            ('Egg Sandwich','BRK-EG',45.00,999,7,'Egg sandwich on toasted bread'),
                            ('Pancake Stack','BRK-PAN',65.00,999,7,'3-piece pancake with syrup'),

                            ('Takeout Bag Fee','FEE-BAG',5.00,999,8,'Optional packaging charge');
                            ").await?;
            
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Products::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
    Sku,
    Name,
    Price,
    CategoryId,
    Stock,
    Description,
}

#[derive(DeriveIden)]
enum Category {
    Table,
    Id,
}
