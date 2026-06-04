    use crate::entity::{role, user, product, category, discount_code, crr_txn_head, crr_txn_dtl, crr_zx_reading, temp_txn_head, temp_txn_dtl, temp_zx_reading, unit_master, ingredient_master_file, conversion_file, products_recipe};
    use crate::AppState;
    use sea_orm::ConnectionTrait;
    use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, ActiveModelTrait, Set, Statement, TransactionTrait};
    use serde::{Deserialize, Serialize};
    use tauri::State;
    use rust_decimal::prelude::{FromPrimitive, ToPrimitive};


    #[derive(Debug, Serialize, Deserialize)]
    pub struct UserResponse {
        pub id: i32,
        pub name: String,
        pub email: Option<String>,
        pub role_id: i32,
        pub pin: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct RoleResponse {   
        pub id: i32,
        pub role_name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct ProductResponse {
        pub id: i32,
        pub sku: String,
        pub name: String,
        pub price: f64,
        pub category_id: Option<i32>,
        pub recipe_cost: f64,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CategoryResponse {
        pub id: i32,
        pub category_code: String,
        pub category_name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct TransactionItem {
        pub company_code: i32,
        pub store_code: i32,
        pub terminal_id: i32,
        pub product_id: i32,
        pub sku: String,
        pub product_name: String,
        pub line_sequence: i32,
        pub qty: i32,
        pub unit_price_incl_tax: f64,
        pub discount_percent: f64,
        pub price_before_disc: f64,
        pub invoice_no: i32,
        pub txn_mode_code: i32,
        pub is_vat_exempt: bool,
        pub price_before_less_vat: f64,
        pub is_scpwd_disc: bool,
        pub ordered_date: String,
        pub ordered_time: String,
        pub discount_code: Option<i32>,
        pub disc_description: Option<String>,
        pub vatable_amt: f64,
        pub vat_amt: f64,
        pub less_vat: f64,
        pub vat_exempt_amt: f64,
        pub zero_rated_amt: f64,
        pub disc_amt: f64,
        pub charge_amt: f64,
        pub total_portion_qty: i32,
        pub disc_portion_qty: i32,
        pub business_date: String,
        pub category_code: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct TransactionRequest {
        pub company_code: i32,
        pub store_code: i32,
        pub terminal_id: i32,
        pub cashier_user_code: i32,
        pub total: f64,
        pub payment_method: String,
        pub change_given: Option<f64>,
        pub transaction_date: String,
        pub transaction_time: String,
        pub txn_mode_code: i32,
        pub business_date: String,
        pub cash_amount_paid: Option<f64>,
        pub encoded_by_user_code: i32,
        pub printed_by_user_code: i32,
        pub items: Vec<TransactionItem>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct TransactionResponse {
        pub id: i32,
        pub cashier_user_code: i32,
        pub total: f64,
        pub payment_method: String,
        pub change_given: Option<f64>,
        pub transaction_date: String,
        pub transaction_time: String,
        pub invoice_number: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct PosZxReadingRequest {
        pub company_code: i32,
        pub store_code: i32,
        pub terminal_id: i32,
        pub transaction_no: i32,
        pub invoice_number: i32,
        pub business_date: String,
        pub payment_type: i32,
        pub amount: f64,
        pub discount_pct: f64,
        pub local_tax: f64,
        pub service_charge: f64,
        pub take_out_charge: f64,
        pub delivery_charge: f64,
        pub card_cheque_num: String,
        pub card_holder_name: String,
        pub trace_no: i32,
        pub approval_code: String,
        pub terminal_ref_no: String,
        pub transaction_type: String,
        pub void_tx_num: i32,
        pub discount_code: Option<i32>,
        pub sr_pwd_id: String,
        pub osca_pwd_name: String,
        pub is_vat_exempt: bool,
        pub sr_pwd_vat_exempt_sale: f64,
        pub sr_pwd_total_amount: f64,
        pub sr_pwd_count: i32,
        pub cashier_user_code: String,
        pub date_stamp: String,
        pub time_stamp: String,
        pub voided_by_user_code: String,
        pub void_reason: String,
    }

    #[tauri::command]
    pub async fn get_users(state: State<'_, AppState>) -> Result<Vec<UserResponse>, String> {
        let db = &state.db;
        
        let users = user::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;
        
        let user_responses: Vec<UserResponse> = users
            .into_iter()
            .map(|u| UserResponse {
                id: u.id,
                name: u.name,
                email: u.email,
                role_id: u.role_id,
                pin: u.pin,
            })
            .collect();
        
        Ok(user_responses)
    }

    #[tauri::command]
    pub async fn get_roles(state: State<'_, AppState>) -> Result<Vec<RoleResponse>, String> {
        let db = &state.db;
        
        let roles = role::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;
        
        let role_responses: Vec<RoleResponse> = roles
            .into_iter()
            .map(|r| RoleResponse {
                id: r.id,
                role_name: r.role_name,
            })
            .collect();
        
        Ok(role_responses)
    }

    #[tauri::command]
    pub async fn login_user(
        cashier_user_code: i32,
        pin: String,
        state: State<'_, AppState>
    ) -> Result<UserResponse, String> {
        let db = &state.db;

        let user = user::Entity::find()
            .filter(user::Column::Id.eq(cashier_user_code))
            .filter(user::Column::Pin.eq(&pin))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?;

        match user {
            Some(u) => Ok(UserResponse {
                id: u.id,
                name: u.name,
                email: u.email,
                role_id: u.role_id,
                pin: u.pin,
            }),
            None => Err("User not found".to_string()),
        }
    }

    #[tauri::command]
    pub async fn get_products(state: State<'_, AppState>) -> Result<Vec<ProductResponse>, String> {
        let db = &state.db;

        let products = product::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let product_responses: Vec<ProductResponse> = products
            .into_iter()
            .map(|p| ProductResponse {
                id: p.id,
                sku: p.sku,
                name: p.name,
                price: p.price,
                category_id: p.category_id,
                recipe_cost: p.recipe_cost,
            })
            .collect();

        Ok(product_responses)
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateProductRequest {
        pub sku: String,
        pub name: String,
        pub price: f64,
        pub category_id: Option<i32>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateProductRequest {
        pub id: i32,
        pub sku: String,
        pub name: String,
        pub price: f64,
        pub category_id: Option<i32>,
    }

    #[tauri::command]
    pub async fn create_product(state: State<'_, AppState>, data: CreateProductRequest) -> Result<ProductResponse, String> {
        let db = &state.db;

        let new_product = product::ActiveModel {
            sku: Set(data.sku),
            name: Set(data.name),
            price: Set(data.price),
            category_id: Set(data.category_id),
            recipe_cost: Set(0.0),
            ..Default::default()
        };

        let product = new_product.insert(&**db).await.map_err(|e| e.to_string())?;

        Ok(ProductResponse {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            category_id: product.category_id,
            recipe_cost: product.recipe_cost,
        })
    }

    #[tauri::command]
    pub async fn update_product(state: State<'_, AppState>, data: UpdateProductRequest) -> Result<ProductResponse, String> {
        let db = &state.db;

        let product = product::Entity::find_by_id(data.id)
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Product not found".to_string())?;

        let mut product: product::ActiveModel = product.into();
        product.sku = Set(data.sku);
        product.name = Set(data.name);
        product.price = Set(data.price);
        product.category_id = Set(data.category_id);

        let product = product.update(&**db).await.map_err(|e| e.to_string())?;

        Ok(ProductResponse {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            category_id: product.category_id,
            recipe_cost: product.recipe_cost,
        })
    }

    #[tauri::command]
    pub async fn delete_product(state: State<'_, AppState>, product_id: i32) -> Result<(), String> {
        let db = &state.db;

        product::Entity::delete_by_id(product_id)
            .exec(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CsvProductRow {
        pub sku: String,
        pub name: String,
        pub price: f64,
        pub category_code: String,
        pub category_name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct BatchImportRequest {
        pub products: Vec<CsvProductRow>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct BatchImportResponse {
        pub success_count: usize,
        pub error_count: usize,
        pub errors: Vec<String>,
    }

    #[tauri::command]
    pub async fn batch_import_products(state: State<'_, AppState>, data: BatchImportRequest) -> Result<BatchImportResponse, String> {
        let db = &state.db;
        let mut success_count = 0;
        let mut error_count = 0;
        let mut errors = Vec::new();

        // Use a transaction for data consistency
        let txn = db.begin().await.map_err(|e| e.to_string())?;

        // First, process all categories
        let mut category_map: std::collections::HashMap<String, i32> = std::collections::HashMap::new();

        // Get existing categories
        let existing_categories = category::Entity::find()
            .all(&txn)
            .await
            .map_err(|e| e.to_string())?;

        for cat in existing_categories {
            category_map.insert(cat.category_code.clone(), cat.id);
        }

        // Collect unique categories from CSV
        let mut unique_categories: std::collections::HashMap<String, String> = std::collections::HashMap::new();
        for row in &data.products {
            unique_categories.insert(row.category_code.clone(), row.category_name.clone());
        }

        // Create new categories if they don't exist
        for (category_code, category_name) in unique_categories {
            if !category_map.contains_key(&category_code) {
                let new_category = category::ActiveModel {
                    category_code: Set(category_code.clone()),
                    category_name: Set(category_name),
                    ..Default::default()
                };

                let category = new_category.insert(&txn).await.map_err(|e| e.to_string())?;
                category_map.insert(category_code, category.id);
            }
        }

        // Now process products
        for (index, row) in data.products.iter().enumerate() {
            // Validate required fields
            if row.sku.is_empty() || row.name.is_empty() || row.price <= 0.0 {
                error_count += 1;
                errors.push(format!("Row {}: Missing or invalid required fields", index + 1));
                continue;
            }

            // Check if category exists
            let category_id = match category_map.get(&row.category_code) {
                Some(id) => Some(*id),
                None => {
                    error_count += 1;
                    errors.push(format!("Row {}: Category '{}' not found", index + 1, row.category_code));
                    continue;
                }
            };

            // Check if SKU already exists
            let existing_product = product::Entity::find()
                .filter(product::Column::Sku.eq(&row.sku))
                .one(&txn)
                .await
                .map_err(|e| e.to_string())?;

            if existing_product.is_some() {
                error_count += 1;
                errors.push(format!("Row {}: SKU '{}' already exists", index + 1, row.sku));
                continue;
            }

            // Create product
            let new_product = product::ActiveModel {
                sku: Set(row.sku.clone()),
                name: Set(row.name.clone()),
                price: Set(row.price),
                category_id: Set(category_id),
                recipe_cost: Set(0.0),
                ..Default::default()
            };

            match new_product.insert(&txn).await {
                Ok(_) => success_count += 1,
                Err(e) => {
                    error_count += 1;
                    errors.push(format!("Row {}: Failed to create product - {}", index + 1, e));
                }
            }
        }

        // Commit or rollback transaction
        if error_count > 0 && success_count == 0 {
            txn.rollback().await.map_err(|e| e.to_string())?;
        } else {
            txn.commit().await.map_err(|e| e.to_string())?;
        }

        Ok(BatchImportResponse {
            success_count,
            error_count,
            errors,
        })
    }

    #[tauri::command]
    pub async fn get_categories(state: State<'_, AppState>) -> Result<Vec<CategoryResponse>, String> {
        let db = &state.db;

        let categories = category::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let category_responses: Vec<CategoryResponse> = categories
            .into_iter()
            .map(|c| CategoryResponse {
                id: c.id,
                category_code: c.category_code,
                category_name: c.category_name,
            })
            .collect();

        Ok(category_responses)
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateCategoryRequest {
        pub category_code: String,
        pub category_name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateCategoryRequest {
        pub id: i32,
        pub category_code: String,
        pub category_name: String,
    }

    #[tauri::command]
    pub async fn create_category(state: State<'_, AppState>, data: CreateCategoryRequest) -> Result<CategoryResponse, String> {
        let db = &state.db;

        let new_category = category::ActiveModel {
            category_code: Set(data.category_code),
            category_name: Set(data.category_name),
            ..Default::default()
        };

        let category = new_category.insert(&**db).await.map_err(|e| e.to_string())?;

        Ok(CategoryResponse {
            id: category.id,
            category_code: category.category_code,
            category_name: category.category_name,
        })
    }

    #[tauri::command]
    pub async fn update_category(state: State<'_, AppState>, data: UpdateCategoryRequest) -> Result<CategoryResponse, String> {
        let db = &state.db;

        let category = category::Entity::find_by_id(data.id)
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Category not found".to_string())?;

        let mut category: category::ActiveModel = category.into();
        category.category_code = Set(data.category_code);
        category.category_name = Set(data.category_name);

        let category = category.update(&**db).await.map_err(|e| e.to_string())?;

        Ok(CategoryResponse {
            id: category.id,
            category_code: category.category_code,
            category_name: category.category_name,
        })
    }

    #[tauri::command]
    pub async fn delete_category(state: State<'_, AppState>, category_id: i32) -> Result<(), String> {
        let db = &state.db;

        category::Entity::delete_by_id(category_id)
            .exec(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct DiscountCodeResponse {
        pub id: i32,
        pub name: String,
        pub percent: f64,
    }

    #[tauri::command]
    pub async fn get_discount_codes(state: State<'_, AppState>) -> Result<Vec<DiscountCodeResponse>, String> {
        let db = &state.db;

        let discount_codes = discount_code::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let discount_responses: Vec<DiscountCodeResponse> = discount_codes
            .into_iter()
            .map(|d| DiscountCodeResponse {
                id: d.id,
                name: d.name,
                percent: d.percent,
            })
            .collect();

        Ok(discount_responses)
    }

    #[tauri::command]
    pub async fn create_transaction(
        transaction_data: TransactionRequest,
        state: State<'_, AppState>
    ) -> Result<TransactionResponse, String> {
        let db = &state.db;

        // Get or create payment_id based on payment_method
        let payment_id = match transaction_data.payment_method.as_str() {
            "cash" => 1,
            "card" => 2,
            _ => return Err("Invalid payment method".to_string()),
        };

        // Step 1 — Query for max transaction_no for the given company_code, store_code, terminal_id
        let next_id_result = db.query_one(Statement::from_string(
                                            sea_orm::DatabaseBackend::Sqlite,
                                            format!(
                                                "SELECT COALESCE(MAX(transaction_no), 0) + 1 AS next_id FROM CRR_TXN_HDR WHERE company_code = {} AND store_code = {} AND terminal_id = {}",
                                                transaction_data.company_code,
                                                transaction_data.store_code,
                                                transaction_data.terminal_id
                                            ),
            )).await
            .map_err(|e| e.to_string())?;

        // Step 2 — Extract next_id, default to 1 if first ever transaction for this combination
        let transaction_no: i32 = match next_id_result{
            Some(row) => row.try_get::<i32>("", "next_id").unwrap_or(1),
            None => 1,
        };

        // Step 3 — Query for max invoice_no
        let invoice_no_result = db.query_one(Statement::from_string(
                                            sea_orm::DatabaseBackend::Sqlite,
                                            "SELECT COALESCE(MAX(invoice_no), 0) + 1 AS next_invoice FROM CRR_TXN_HDR".to_owned(),
            )).await
            .map_err(|e| e.to_string())?;

        // Step 4 — Extract next invoice_no, default to 1 if first ever transaction
        let invoice_no: i32 = match invoice_no_result{
            Some(row) => row.try_get::<i32>("", "next_invoice").unwrap_or(1),
            None => 1,
        };

        // Step 5 — Check ingredient stock availability and deduct stock
        for item in &transaction_data.items {
            // Fetch product recipe
            let recipes = products_recipe::Entity::find()
                .filter(products_recipe::Column::ProductId.eq(item.product_id))
                .all(&**db)
                .await
                .map_err(|e| e.to_string())?;

            if !recipes.is_empty() {
                // Check stock for each ingredient in the recipe
                for recipe in &recipes {
                    let ingredient = ingredient_master_file::Entity::find()
                        .filter(ingredient_master_file::Column::Id.eq(recipe.ingredient_id))
                        .one(&**db)
                        .await
                        .map_err(|e| e.to_string())?
                        .ok_or("Ingredient not found")?;

                    let required_qty = (recipe.actual_usage * item.qty as f64) as i32;

                    if ingredient.base_stock_qty < required_qty {
                        return Err(format!(
                            "Insufficient stock for ingredient: {} (required: {}, available: {})",
                            ingredient.description, required_qty, ingredient.base_stock_qty
                        ));
                    }
                }

                // Deduct stock for each ingredient
                for recipe in &recipes {
                    let required_qty = (recipe.actual_usage * item.qty as f64) as i32;

                    let ingredient = ingredient_master_file::Entity::find()
                        .filter(ingredient_master_file::Column::Id.eq(recipe.ingredient_id))
                        .one(&**db)
                        .await
                        .map_err(|e| e.to_string())?
                        .ok_or("Ingredient not found")?;

                    let description = ingredient.description.clone();
                    let min_stock_lvl = ingredient.min_stock_lvl;
                    let new_stock = ingredient.base_stock_qty - required_qty;

                    let mut ingredient_active: ingredient_master_file::ActiveModel = ingredient.into();
                    ingredient_active.base_stock_qty = Set(new_stock);

                    ingredient_active
                        .update(&**db)
                        .await
                        .map_err(|e| e.to_string())?;

                    // Check for low stock alert
                    if new_stock < min_stock_lvl {
                        // Log low stock warning (could be enhanced to notify user)
                        println!(
                            "LOW STOCK ALERT: {} is below minimum level (current: {}, min: {})",
                            description, new_stock, min_stock_lvl
                        );
                    }
                }
            }
        }

        // Step 6 — Insert with transaction_no and invoice_no already set
        let new_txn_head = crr_txn_head::ActiveModel {
            company_code: Set(transaction_data.company_code),
            store_code: Set(transaction_data.store_code),
            terminal_id: Set(transaction_data.terminal_id),
            transaction_no: Set(transaction_no),
            cashier_user_code: Set(transaction_data.cashier_user_code),
            invoice_no: Set(invoice_no),
            business_date: Set(transaction_data.business_date),
            transaction_date: Set(transaction_data.transaction_date),
            transaction_time: Set(transaction_data.transaction_time),
            txn_mode_code: Set(transaction_data.txn_mode_code),
            cash_amount_paid: Set(transaction_data.cash_amount_paid),
            encoded_by_user_code: Set(transaction_data.encoded_by_user_code),
            printed_by_user_code: Set(transaction_data.printed_by_user_code),
            total: Set(transaction_data.total),
            payment_id: Set(payment_id),
            change_given: Set(transaction_data.change_given),
            ..Default::default()
        };

        // Step 4 — Insert and get result
        let transaction_head_result = new_txn_head
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        // Insert transaction details for each item
        for item in transaction_data.items {
            let txn_dtl = crr_txn_dtl::ActiveModel {
                company_code: Set(item.company_code),
                store_code: Set(item.store_code),
                terminal_id: Set(item.terminal_id),
                transaction_no: Set(transaction_no),
                business_date: Set(item.business_date),
                category_code: Set(item.category_code),
                product_id: Set(item.product_id),
                qty: Set(item.qty),
                product_name: Set(item.product_name),
                sku: Set(item.sku),
                unit_price_incl_tax: Set(item.unit_price_incl_tax),
                discount_percent: Set(rust_decimal::Decimal::from_f64(item.discount_percent).unwrap_or_default()),
                price_before_disc: Set(rust_decimal::Decimal::from_f64(item.price_before_disc).unwrap_or_default()),
                invoice_no: Set(invoice_no),
                line_sequence: Set(item.line_sequence),
                txn_mode_code: Set(item.txn_mode_code),
                is_vat_exempt: Set(item.is_vat_exempt),
                price_before_less_vat: Set(rust_decimal::Decimal::from_f64(item.price_before_less_vat).unwrap_or_default()),
                is_scpwd_disc: Set(item.is_scpwd_disc),
                ordered_date: Set(item.ordered_date),
                ordered_time: Set(item.ordered_time),
                discount_code: Set(item.discount_code),
                disc_description: Set(item.disc_description),
                vatable_amt: Set(item.vatable_amt),
                vat_amt: Set(item.vat_amt),
                less_vat: Set(item.less_vat),
                vat_exempt_amt: Set(item.vat_exempt_amt),
                zero_rated_amt: Set(item.zero_rated_amt),
                disc_amt: Set(rust_decimal::Decimal::from_f64(item.disc_amt).unwrap_or_default()),
                charge_amt: Set(rust_decimal::Decimal::from_f64(item.charge_amt).unwrap_or_default()),
                total_portion_qty: Set(item.total_portion_qty),
                disc_portion_qty: Set(item.disc_portion_qty),
                ..Default::default()
            };

            txn_dtl
                .insert(&**db)
                .await
                .map_err(|e| e.to_string())?;
        }

        Ok(TransactionResponse {
            id: transaction_no,
            cashier_user_code: transaction_head_result.cashier_user_code,
            total: transaction_head_result.total,
            payment_method: transaction_data.payment_method,
            change_given: transaction_head_result.change_given,
            transaction_date: transaction_head_result.transaction_date,
            transaction_time: transaction_head_result.transaction_time,
            invoice_number: transaction_head_result.invoice_no.to_string(),
        })
    }

    #[tauri::command]
    pub async fn create_pos_zx_reading(state: State<'_, AppState>, data: PosZxReadingRequest) -> Result<(), String> {
        let db = &state.db;

        let new_zx_reading = crr_zx_reading::ActiveModel {
            company_code: Set(data.company_code),
            store_code: Set(data.store_code),
            terminal_id: Set(data.terminal_id),
            transaction_no: Set(data.transaction_no),
            invoice_number: Set(data.invoice_number),
            business_date: Set(data.business_date),
            payment_type: Set(data.payment_type),
            amount: Set(rust_decimal::Decimal::from_f64(data.amount).unwrap_or_default()),
            discount_pct: Set(rust_decimal::Decimal::from_f64(data.discount_pct).unwrap_or_default()),
            local_tax: Set(rust_decimal::Decimal::from_f64(data.local_tax).unwrap_or_default()),
            service_charge: Set(rust_decimal::Decimal::from_f64(data.service_charge).unwrap_or_default()),
            take_out_charge: Set(rust_decimal::Decimal::from_f64(data.take_out_charge).unwrap_or_default()),
            delivery_charge: Set(rust_decimal::Decimal::from_f64(data.delivery_charge).unwrap_or_default()),
            card_cheque_num: Set(data.card_cheque_num),
            card_holder_name: Set(data.card_holder_name),
            trace_no: Set(data.trace_no),
            approval_code: Set(data.approval_code),
            terminal_ref_no: Set(data.terminal_ref_no),
            transaction_type: Set(data.transaction_type),
            void_tx_num: Set(data.void_tx_num),
            discount_code: Set(data.discount_code),
            sr_pwd_id: Set(data.sr_pwd_id),
            osca_pwd_name: Set(data.osca_pwd_name),
            is_vat_exempt: Set(data.is_vat_exempt),
            sr_pwd_vat_exempt_sale: Set(rust_decimal::Decimal::from_f64(data.sr_pwd_vat_exempt_sale).unwrap_or_default()),
            sr_pwd_total_amount: Set(rust_decimal::Decimal::from_f64(data.sr_pwd_total_amount).unwrap_or_default()),
            sr_pwd_count: Set(data.sr_pwd_count),
            cashier_user_code: Set(data.cashier_user_code),
            date_stamp: Set(data.date_stamp),
            time_stamp: Set(data.time_stamp),
            voided_by_user_code: Set(data.voided_by_user_code),
            void_reason: Set(data.void_reason),
            ..Default::default()
        };

        new_zx_reading
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())

        
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct VoidTransactionRequest {
        pub original_transaction_no: i32,
        pub voided_by_user_code: String,
        pub void_reason: String,
        pub company_code: i32,
        pub store_code: i32,
        pub terminal_id: i32,
        pub business_date: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UnvoidTransactionRequest {
        pub transaction_no: i32,
    }

    #[tauri::command]
    pub async fn unvoid_transaction(
        data: UnvoidTransactionRequest,
        state: State<'_, AppState>
    ) -> Result<(), String> {
        let db = &state.db;

        // Delete the VOID record from CRR_ZX_READING
        // The VOID record has void_tx_num pointing to the original transaction
        crr_zx_reading::Entity::delete_many()
            .filter(crr_zx_reading::Column::VoidTxNum.eq(data.transaction_no))
            .filter(crr_zx_reading::Column::TransactionType.eq("VOID"))
            .exec(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    #[tauri::command]
    pub async fn get_business_day_status(state: State<'_, AppState>) -> Result<bool, String> {
        let db = &state.db;

        // Check if the day start marker exists (transaction_no = 0)
        // If it exists, business day is open; otherwise, it's closed
        let marker = crr_txn_head::Entity::find()
            .filter(crr_txn_head::Column::TransactionNo.eq(0))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(marker.is_some())
    }

    #[tauri::command]
    pub async fn get_current_transactions(
        business_date: String,
        page: Option<i32>,
        page_size: Option<i32>,
        state: State<'_, AppState>
    ) -> Result<(Vec<TransactionHistoryResponse>, i64), String> {
        use sea_orm::{FromQueryResult, Statement, DbBackend};

        let db = &state.db;

        let page = page.unwrap_or(1);
        let page_size = page_size.unwrap_or(25);
        let offset = (page - 1) * page_size;

        // Get total count
        let count_stmt = if business_date.is_empty() {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT COUNT(*) as count
                FROM CRR_TXN_HDR th
                WHERE th.transaction_no != 0
                "#,
                vec![],
            )
        } else {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT COUNT(*) as count
                FROM CRR_TXN_HDR th
                WHERE th.business_date = ? AND th.transaction_no != 0
                "#,
                vec![business_date.clone().into()],
            )
        };

        #[derive(Debug, FromQueryResult)]
        struct CountResult {
            count: i64,
        }

        let count_result = CountResult::find_by_statement(count_stmt)
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Failed to get count")?;

        #[derive(Debug, FromQueryResult)]
        struct TransactionResult {
            transaction_no: i32,
            invoice_no: i32,
            transaction_date: String,
            transaction_time: String,
            business_date: String,
            cashier_name: String,
            payment_method: String,
            total: f64,
            cash_amount_paid: Option<f64>,
            change_given: Option<f64>,
            is_voided: Option<bool>,
            voided_by_name: Option<String>,
            void_reason: Option<String>,
            void_date: Option<String>,
            void_time: Option<String>,
        }

        let stmt = if business_date.is_empty() {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT
                    th.transaction_no,
                    th.invoice_no,
                    th.transaction_date,
                    th.transaction_time,
                    th.business_date,
                    u.name AS cashier_name,
                    pt.name AS payment_method,
                    th.total,
                    th.cash_amount_paid,
                    th.change_given,
                    EXISTS (
                        SELECT 1 FROM CRR_ZX_READING zxr2
                        WHERE zxr2.void_tx_num = th.transaction_no AND zxr2.transaction_type = 'VOID'
                    ) AS is_voided,
                    vu.name AS voided_by_name,
                    zxr.void_reason,
                    zxr.date_stamp AS void_date,
                    zxr.time_stamp AS void_time
                FROM CRR_TXN_HDR th
                JOIN users u ON th.cashier_user_code = u.id
                JOIN payment_type pt ON th.payment_id = pt.id
                LEFT JOIN CRR_ZX_READING zxr ON zxr.void_tx_num = th.transaction_no AND zxr.transaction_type = 'VOID'
                LEFT JOIN users vu ON zxr.voided_by_user_code = vu.id
                WHERE th.transaction_no != 0
                ORDER BY th.transaction_date DESC, th.transaction_time DESC
                LIMIT ? OFFSET ?
                "#,
                vec![page_size.into(), offset.into()],
            )
        } else {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT
                    th.transaction_no,
                    th.invoice_no,
                    th.transaction_date,
                    th.transaction_time,
                    th.business_date,
                    u.name AS cashier_name,
                    pt.name AS payment_method,
                    th.total,
                    th.cash_amount_paid,
                    th.change_given,
                    EXISTS (
                        SELECT 1 FROM CRR_ZX_READING zxr2
                        WHERE zxr2.void_tx_num = th.transaction_no AND zxr2.transaction_type = 'VOID'
                    ) AS is_voided,
                    vu.name AS voided_by_name,
                    zxr.void_reason,
                    zxr.date_stamp AS void_date,
                    zxr.time_stamp AS void_time
                FROM CRR_TXN_HDR th
                JOIN users u ON th.cashier_user_code = u.id
                JOIN payment_type pt ON th.payment_id = pt.id
                LEFT JOIN CRR_ZX_READING zxr ON zxr.void_tx_num = th.transaction_no AND zxr.transaction_type = 'VOID'
                LEFT JOIN users vu ON zxr.voided_by_user_code = vu.id
                WHERE th.business_date = ? AND th.transaction_no != 0
                ORDER BY th.transaction_date DESC, th.transaction_time DESC
                LIMIT ? OFFSET ?
                "#,
                vec![business_date.into(), page_size.into(), offset.into()],
            )
        };

        let transactions = TransactionResult::find_by_statement(stmt)
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let responses: Vec<TransactionHistoryResponse> = transactions
            .into_iter()
            .map(|t| TransactionHistoryResponse {
                transaction_no: t.transaction_no,
                invoice_no: t.invoice_no,
                transaction_date: t.transaction_date,
                transaction_time: t.transaction_time,
                business_date: t.business_date,
                cashier_name: t.cashier_name,
                payment_method: t.payment_method,
                total: t.total,
                cash_amount_paid: t.cash_amount_paid,
                change_given: t.change_given,
                is_voided: t.is_voided.unwrap_or(false),
                voided_by_name: t.voided_by_name,
                void_reason: t.void_reason,
                void_date: t.void_date,
                void_time: t.void_time,
            })
            .collect();

        Ok((responses, count_result.count))
    }

    #[tauri::command]
    pub async fn perform_day_start(state: State<'_, AppState>) -> Result<(), String> {
        let db = &state.db;

        // Delete any existing day start marker first
        crr_txn_head::Entity::delete_many()
            .filter(crr_txn_head::Column::TransactionNo.eq(0))
            .exec(&**db)
            .await
            .map_err(|e| e.to_string())?;

        // Insert a marker transaction to indicate business day is open
        // This is a dummy transaction with transaction_no = 0 to mark day start
        let now = chrono::Utc::now();
        let business_date = now.format("%Y-%m-%d").to_string();
        let transaction_time = now.format("%H:%M:%S").to_string();

        let marker_txn = crr_txn_head::ActiveModel {
            company_code: Set(1),
            store_code: Set(1),
            terminal_id: Set(1),
            transaction_no: Set(0), // Special marker: 0 = day start marker
            cashier_user_code: Set(2), // Use manager ID (valid user)
            invoice_no: Set(0),
            business_date: Set(business_date.clone()),
            transaction_date: Set(business_date),
            transaction_time: Set(transaction_time),
            txn_mode_code: Set(1),
            cash_amount_paid: Set(None),
            encoded_by_user_code: Set(2), // Use manager ID (valid user)
            printed_by_user_code: Set(2), // Use manager ID (valid user)
            total: Set(0.0),
            payment_id: Set(1),
            change_given: Set(None),
            ..Default::default()
        };

        marker_txn.insert(&**db).await.map_err(|e| e.to_string())?;

        Ok(())
    }

    #[tauri::command]
    pub async fn perform_day_end(state: State<'_, AppState>) -> Result<(), String> {
        use sea_orm::{Statement, DbBackend};
        let db = &state.db;

        // Move all data from CRR_TXN_HDR to HST_TXN_HDR (excluding day start marker)
        let move_hdr_stmt = Statement::from_string(
            DbBackend::Sqlite,
            "INSERT INTO HST_TXN_HDR SELECT * FROM CRR_TXN_HDR WHERE transaction_no != 0".to_owned(),
        );
        db.execute(move_hdr_stmt).await.map_err(|e| e.to_string())?;

        // Move all data from CRR_TXN_DTL to HST_TXN_DTL (excluding day start marker details)
        let move_dtl_stmt = Statement::from_string(
            DbBackend::Sqlite,
            "INSERT INTO HST_TXN_DTL SELECT * FROM CRR_TXN_DTL WHERE transaction_no != 0".to_owned(),
        );
        db.execute(move_dtl_stmt).await.map_err(|e| e.to_string())?;

        // Move all data from CRR_ZX_READING to HST_ZX_READING (excluding day start marker)
        let move_zx_stmt = Statement::from_string(
            DbBackend::Sqlite,
            "INSERT INTO HST_ZX_READING SELECT * FROM CRR_ZX_READING WHERE transaction_no != 0".to_owned(),
        );
        db.execute(move_zx_stmt).await.map_err(|e| e.to_string())?;

        // Clear CRR_TXN_HDR
        crr_txn_head::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;

        // Clear CRR_TXN_DTL
        crr_txn_dtl::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;

        // Clear CRR_ZX_READING
        crr_zx_reading::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;

        Ok(())
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct PopulateTempTablesRequest {
        pub start_date: String,
        pub end_date: String,
    }

    #[tauri::command]
    pub async fn populate_temp_tables(
        data: PopulateTempTablesRequest,
        state: State<'_, AppState>
    ) -> Result<(), String> {
        use sea_orm::{Statement, DbBackend};
        let db = &state.db;

        // Clear temp tables first
        temp_txn_head::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;
        temp_txn_dtl::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;
        temp_zx_reading::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;

        // Check what dates exist in HST_TXN_HDR
        let check_dates_stmt = Statement::from_string(
            DbBackend::Sqlite,
            "SELECT DISTINCT business_date FROM HST_TXN_HDR LIMIT 10".to_string(),
        );
        let dates_result = db.query_all(check_dates_stmt).await.map_err(|e| e.to_string())?;
        println!("Available dates in HST_TXN_HDR:");
        for row in dates_result {
            if let Some(date) = row.try_get_by_index::<String>(0).ok() {
                println!("  - {}", date);
            }
        }

        // Populate TEMP_TXN_HDR from HST_TXN_HDR within date range
        let move_hdr_stmt = Statement::from_string(
            DbBackend::Sqlite,
            format!(
                "INSERT INTO TEMP_TXN_HDR SELECT * FROM HST_TXN_HDR WHERE business_date >= '{}' AND business_date <= '{}'",
                data.start_date, data.end_date
            ),
        );
        let hdr_result = db.execute(move_hdr_stmt).await.map_err(|e| e.to_string())?;
        println!("Inserted {} rows into TEMP_TXN_HDR for date range {} to {}", hdr_result.rows_affected(), data.start_date, data.end_date);

        // Populate TEMP_TXN_DTL from HST_TXN_DTL (linked by invoice_no)
        let move_dtl_stmt = Statement::from_string(
            DbBackend::Sqlite,
            format!(
                "INSERT INTO TEMP_TXN_DTL SELECT * FROM HST_TXN_DTL WHERE invoice_no IN (SELECT invoice_no FROM TEMP_TXN_HDR)"
            ),
        );
        db.execute(move_dtl_stmt).await.map_err(|e| e.to_string())?;

        // Populate TEMP_ZX_READING from HST_ZX_READING (linked by transaction_no)
        let move_zx_stmt = Statement::from_string(
            DbBackend::Sqlite,
            format!(
                "INSERT INTO TEMP_ZX_READING SELECT * FROM HST_ZX_READING WHERE transaction_no IN (SELECT transaction_no FROM TEMP_TXN_HDR)"
            ),
        );
        db.execute(move_zx_stmt).await.map_err(|e| e.to_string())?;

        // Also populate void records (linked by void_tx_num)
        let move_void_stmt = Statement::from_string(
            DbBackend::Sqlite,
            format!(
                "INSERT INTO TEMP_ZX_READING SELECT * FROM HST_ZX_READING WHERE transaction_type = 'VOID' AND void_tx_num IN (SELECT transaction_no FROM TEMP_TXN_HDR)"
            ),
        );
        db.execute(move_void_stmt).await.map_err(|e| e.to_string())?;

        Ok(())
    }

    #[tauri::command]
    pub async fn clear_temp_tables(state: State<'_, AppState>) -> Result<(), String> {
        let db = &state.db;

        temp_txn_head::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;
        temp_txn_dtl::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;
        temp_zx_reading::Entity::delete_many().exec(&**db).await.map_err(|e| e.to_string())?;

        Ok(())
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct ExchangeTransactionRequest {
        pub original_invoice_no: i32,
        pub original_transaction_no: i32,
        pub items: Vec<ExchangeItemRequest>,
        pub cashier_user_code: i32,
        pub payment_method: String,
        pub cash_amount_paid: Option<f64>,
        pub company_code: i32,
        pub store_code: i32,
        pub terminal_id: i32,
        pub business_date: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct ExchangeItemRequest {
        pub product_name: String,
        pub sku: String,
        pub quantity: i32,
        pub unit_price: f64,
        pub subtotal: f64,
        pub discount_description: Option<String>,
        pub discount_amount: Option<f64>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct ExchangeTransactionResponse {
        pub new_invoice_no: i32,
        pub new_transaction_no: i32,
    }

    #[tauri::command]
    pub async fn exchange_transaction(
        data: ExchangeTransactionRequest,
        state: State<'_, AppState>
    ) -> Result<ExchangeTransactionResponse, String> {
        use sea_orm::QueryOrder;
        let db = &state.db;

        // Get the next transaction number and invoice number
        let max_txn = crr_txn_head::Entity::find()
            .order_by_desc(crr_txn_head::Column::TransactionNo)
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let new_transaction_no = max_txn.as_ref().map(|t| t.transaction_no + 1).unwrap_or(1);
        let new_invoice_no = max_txn.as_ref().map(|t| t.invoice_no + 1).unwrap_or(1);

        let now = chrono::Utc::now();
        let transaction_date = now.format("%Y-%m-%d").to_string();
        let transaction_time = now.format("%H:%M:%S").to_string();

        // Calculate totals
        let subtotal: f64 = data.items.iter().map(|i| i.subtotal).sum();
        let tax = subtotal * 0.12; // 12% VAT
        let total = subtotal + tax;

        // Get payment_id
        let payment_id = match data.payment_method.as_str() {
            "cash" => 1,
            "card" => 2,
            _ => 1,
        };

        // Create transaction header
        let new_txn_head = crr_txn_head::ActiveModel {
            company_code: Set(data.company_code),
            store_code: Set(data.store_code),
            terminal_id: Set(data.terminal_id),
            transaction_no: Set(new_transaction_no),
            cashier_user_code: Set(data.cashier_user_code),
            invoice_no: Set(new_invoice_no),
            business_date: Set(data.business_date.clone()),
            transaction_date: Set(transaction_date.clone()),
            transaction_time: Set(transaction_time.clone()),
            txn_mode_code: Set(1),
            cash_amount_paid: Set(data.cash_amount_paid),
            encoded_by_user_code: Set(data.cashier_user_code),
            printed_by_user_code: Set(data.cashier_user_code),
            total: Set(total),
            payment_id: Set(payment_id),
            change_given: Set(data.cash_amount_paid.map(|paid| paid - total)),
            original_transaction_no: Set(Some(data.original_transaction_no)),
            ..Default::default()
        };

        new_txn_head
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        // Create transaction details
        for (index, item) in data.items.iter().enumerate() {
            let new_txn_dtl = crr_txn_dtl::ActiveModel {
                company_code: Set(data.company_code),
                store_code: Set(data.store_code),
                terminal_id: Set(data.terminal_id),
                transaction_no: Set(new_transaction_no),
                business_date: Set(data.business_date.clone()),
                category_code: Set("".to_string()),
                product_id: Set(0), // TODO: Get actual product_id
                qty: Set(item.quantity),
                product_name: Set(item.product_name.clone()),
                sku: Set(item.sku.clone()),
                unit_price_incl_tax: Set(item.unit_price),
                discount_percent: Set(rust_decimal::Decimal::from_f64(0.0).unwrap_or_default()),
                price_before_disc: Set(rust_decimal::Decimal::from_f64(item.unit_price).unwrap_or_default()),
                invoice_no: Set(new_invoice_no),
                line_sequence: Set(index as i32 + 1),
                txn_mode_code: Set(1),
                is_vat_exempt: Set(false),
                price_before_less_vat: Set(rust_decimal::Decimal::from_f64(item.unit_price).unwrap_or_default()),
                is_scpwd_disc: Set(false),
                ordered_date: Set(transaction_date.clone()),
                ordered_time: Set(transaction_time.clone()),
                discount_code: Set(None),
                disc_description: Set(item.discount_description.clone()),
                vatable_amt: Set(item.subtotal / 1.12),
                vat_amt: Set(tax / data.items.len() as f64),
                less_vat: Set(0.0),
                vat_exempt_amt: Set(0.0),
                zero_rated_amt: Set(0.0),
                disc_amt: Set(rust_decimal::Decimal::from_f64(item.discount_amount.unwrap_or(0.0)).unwrap_or_default()),
                charge_amt: Set(rust_decimal::Decimal::from_f64(0.0).unwrap_or_default()),
                total_portion_qty: Set(item.quantity),
                disc_portion_qty: Set(0),
                ..Default::default()
            };

            new_txn_dtl
                .insert(&**db)
                .await
                .map_err(|e| e.to_string())?;
        }

        // Create ZX reading for the exchange transaction
        let zx_reading = crr_zx_reading::ActiveModel {
            company_code: Set(data.company_code),
            store_code: Set(data.store_code),
            terminal_id: Set(data.terminal_id),
            transaction_no: Set(new_transaction_no),
            invoice_number: Set(new_invoice_no),
            business_date: Set(data.business_date),
            payment_type: Set(payment_id),
            amount: Set(rust_decimal::Decimal::from_f64(total).unwrap_or_default()),
            transaction_type: Set("EXCHANGE".to_string()),
            cashier_user_code: Set(data.cashier_user_code.to_string()),
            date_stamp: Set(transaction_date),
            time_stamp: Set(transaction_time),
            voided_by_user_code: Set("".to_string()),
            void_reason: Set("".to_string()),
            ..Default::default()
        };

        zx_reading
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(ExchangeTransactionResponse {
            new_invoice_no,
            new_transaction_no,
        })
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct TransactionHistoryResponse {
        pub invoice_no: i32,
        pub transaction_no: i32,
        pub transaction_date: String,
        pub transaction_time: String,
        pub business_date: String,
        pub cashier_name: String,
        pub payment_method: String,
        pub total: f64,
        pub cash_amount_paid: Option<f64>,
        pub change_given: Option<f64>,
        pub is_voided: bool,
        pub voided_by_name: Option<String>,
        pub void_reason: Option<String>,
        pub void_date: Option<String>,
        pub void_time: Option<String>,
    }

    #[tauri::command]
    pub async fn get_transaction_history(
        business_date: String,
        page: Option<i32>,
        page_size: Option<i32>,
        state: State<'_, AppState>
    ) -> Result<(Vec<TransactionHistoryResponse>, i64), String> {
        use sea_orm::{FromQueryResult, Statement, DbBackend};

        let db = &state.db;

        let page = page.unwrap_or(1);
        let page_size = page_size.unwrap_or(25);
        let offset = (page - 1) * page_size;

        // Get total count
        let count_stmt = if business_date.is_empty() {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT COUNT(*) as count
                FROM TEMP_TXN_HDR th
                "#,
                vec![],
            )
        } else {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT COUNT(*) as count
                FROM TEMP_TXN_HDR th
                WHERE th.business_date = ?
                "#,
                vec![business_date.clone().into()],
            )
        };

        #[derive(Debug, FromQueryResult)]
        struct CountResult {
            count: i64,
        }

        let count_result = CountResult::find_by_statement(count_stmt)
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Failed to get count")?;

        #[derive(Debug, FromQueryResult)]
        struct TransactionResult {
            transaction_no: i32,
            invoice_no: i32,
            transaction_date: String,
            transaction_time: String,
            business_date: String,
            cashier_name: String,
            payment_method: String,
            total: f64,
            cash_amount_paid: Option<f64>,
            change_given: Option<f64>,
            is_voided: Option<bool>,
            voided_by_name: Option<String>,
            void_reason: Option<String>,
            void_date: Option<String>,
            void_time: Option<String>,
        }

        let stmt = if business_date.is_empty() {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT
                    th.transaction_no,
                    th.invoice_no,
                    th.transaction_date,
                    th.transaction_time,
                    th.business_date,
                    u.name AS cashier_name,
                    pt.name AS payment_method,
                    th.total,
                    th.cash_amount_paid,
                    th.change_given,
                    zxr.transaction_type = 'VOID' AS is_voided,
                    vu.name AS voided_by_name,
                    zxr.void_reason,
                    CASE WHEN zxr.transaction_type = 'VOID' THEN zxr.date_stamp ELSE NULL END AS void_date,
                    CASE WHEN zxr.transaction_type = 'VOID' THEN zxr.time_stamp ELSE NULL END AS void_time
                FROM TEMP_TXN_HDR th
                JOIN users u ON th.cashier_user_code = u.id
                JOIN payment_type pt ON th.payment_id = pt.id
                LEFT JOIN TEMP_ZX_READING zxr ON zxr.void_tx_num = th.transaction_no
                LEFT JOIN users vu ON zxr.voided_by_user_code = vu.id
                ORDER BY th.transaction_date DESC, th.transaction_time DESC
                LIMIT ? OFFSET ?
                "#,
                vec![page_size.into(), offset.into()],
            )
        } else {
            Statement::from_sql_and_values(
                DbBackend::Sqlite,
                r#"
                SELECT
                    th.transaction_no,
                    th.invoice_no,
                    th.transaction_date,
                    th.transaction_time,
                    th.business_date,
                    u.name AS cashier_name,
                    pt.name AS payment_method,
                    th.total,
                    th.cash_amount_paid,
                    th.change_given,
                    zxr.transaction_type = 'VOID' AS is_voided,
                    vu.name AS voided_by_name,
                    zxr.void_reason,
                    CASE WHEN zxr.transaction_type = 'VOID' THEN zxr.date_stamp ELSE NULL END AS void_date,
                    CASE WHEN zxr.transaction_type = 'VOID' THEN zxr.time_stamp ELSE NULL END AS void_time
                FROM TEMP_TXN_HDR th
                JOIN users u ON th.cashier_user_code = u.id
                JOIN payment_type pt ON th.payment_id = pt.id
                LEFT JOIN TEMP_ZX_READING zxr ON zxr.void_tx_num = th.transaction_no
                LEFT JOIN users vu ON zxr.voided_by_user_code = vu.id
                WHERE th.business_date = ?
                ORDER BY th.transaction_date DESC, th.transaction_time DESC
                LIMIT ? OFFSET ?
                "#,
                vec![business_date.into(), page_size.into(), offset.into()],
            )
        };

        let transactions = TransactionResult::find_by_statement(stmt)
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let responses: Vec<TransactionHistoryResponse> = transactions
            .into_iter()
            .map(|t| TransactionHistoryResponse {
                transaction_no: t.transaction_no,
                invoice_no: t.invoice_no,
                transaction_date: t.transaction_date,
                transaction_time: t.transaction_time,
                business_date: t.business_date,
                cashier_name: t.cashier_name,
                payment_method: t.payment_method,
                total: t.total,
                cash_amount_paid: t.cash_amount_paid,
                change_given: t.change_given,
                is_voided: t.is_voided.unwrap_or(false),
                voided_by_name: t.voided_by_name,
                void_reason: t.void_reason,
                void_date: t.void_date,
                void_time: t.void_time,
            })
            .collect();

        Ok((responses, count_result.count))
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct TransactionDetailItem {
        pub product_name: String,
        pub sku: String,
        pub quantity: i32,
        pub unit_price: f64,
        pub subtotal: f64,
        pub discount_description: Option<String>,
        pub discount_amount: f64,
        pub vatable_amt: f64,
        pub vat_amt: f64,
        pub less_vat: f64,
        pub vat_exempt_amt: f64,
        pub zero_rated_amt: f64,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct TransactionDetailResponse {
        pub invoice_no: i32,
        pub transaction_no: i32,
        pub transaction_date: String,
        pub transaction_time: String,
        pub business_date: String,
        pub cashier_name: String,
        pub payment_method: String,
        pub total: f64,
        pub cash_amount_paid: Option<f64>,
        pub change_given: Option<f64>,
        pub subtotal: f64,
        pub tax: f64,
        pub vatable_sales: f64,
        pub vat_exempt_sales: f64,
        pub vat_amount_12_pct: f64,
        pub less_vat: f64,
        pub senior_discount_amount: f64,
        pub pwd_discount_amount: f64,
        pub athlete_discount_amount: f64,
        pub regular_discount_amount: f64,
        pub gross_sales: f64,
        pub net_sales: f64,
        pub items: Vec<TransactionDetailItem>,
        pub is_voided: bool,
        pub voided_by_name: Option<String>,
        pub void_reason: Option<String>,
        pub void_date: Option<String>,
        pub void_time: Option<String>,
    }

    #[tauri::command]
    pub async fn get_current_transaction_details(
        invoice_no: i32,
        state: State<'_, AppState>
    ) -> Result<TransactionDetailResponse, String> {
        use sea_orm::{FromQueryResult, Statement, DbBackend};

        let db = &state.db;

        // Fetch transaction header from CRR_TXN_HDR
        let header_stmt = Statement::from_sql_and_values(
            DbBackend::Sqlite,
            r#"
            SELECT
                th.invoice_no,
                th.transaction_no,
                th.transaction_date,
                th.transaction_time,
                th.business_date,
                u.name AS cashier_name,
                pt.name AS payment_method,
                th.total,
                th.cash_amount_paid,
                th.change_given
            FROM CRR_TXN_HDR th
            JOIN users u ON th.cashier_user_code = u.id
            JOIN payment_type pt ON th.payment_id = pt.id
            WHERE th.invoice_no = ?
            "#,
            vec![invoice_no.into()],
        );

        #[derive(Debug, FromQueryResult)]
        struct HeaderResult {
            invoice_no: i32,
            transaction_no: i32,
            transaction_date: String,
            transaction_time: String,
            business_date: String,
            cashier_name: String,
            payment_method: String,
            total: f64,
            cash_amount_paid: Option<f64>,
            change_given: Option<f64>,
        }

        let header = HeaderResult::find_by_statement(header_stmt)
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Transaction not found")?;

        // Fetch transaction items from CRR_TXN_DTL
        let items_stmt = Statement::from_sql_and_values(
            DbBackend::Sqlite,
            r#"
            SELECT
                product_name,
                sku,
                qty,
                unit_price_incl_tax,
                (qty * unit_price_incl_tax) AS subtotal,
                disc_description,
                disc_amt,
                vatable_amt,
                vat_amt,
                less_vat,
                vat_exempt_amt,
                zero_rated_amt
            FROM CRR_TXN_DTL
            WHERE invoice_no = ?
            ORDER BY line_sequence
            "#,
            vec![invoice_no.into()],
        );

        #[derive(Debug, FromQueryResult)]
        struct ItemResult {
            product_name: String,
            sku: String,
            qty: i32,
            unit_price_incl_tax: f64,
            subtotal: f64,
            disc_description: Option<String>,
            disc_amt: rust_decimal::Decimal,
            vatable_amt: f64,
            vat_amt: f64,
            less_vat: f64,
            vat_exempt_amt: f64,
            zero_rated_amt: f64,
        }

        let items = ItemResult::find_by_statement(items_stmt)
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        // Calculate summary from items
        let subtotal: f64 = items.iter().map(|i| i.subtotal).sum();
        let tax: f64 = items.iter().map(|i| i.vat_amt).sum();
        let vatable_sales: f64 = items.iter().map(|i| i.vatable_amt).sum();
        let vat_exempt_sales: f64 = items.iter().map(|i| i.vat_exempt_amt).sum();
        let less_vat: f64 = items.iter().map(|i| i.less_vat).sum();
        let gross_sales: f64 = subtotal;
        let net_sales: f64 = header.total;

        // Calculate discount amounts from items
        let senior_discount_amount: f64 = items.iter()
            .filter(|i| i.disc_description.as_ref().map(|d| d.to_lowercase()).as_deref() == Some("senior citizen"))
            .map(|i| i.disc_amt.to_f64().unwrap_or(0.0))
            .sum();
        let pwd_discount_amount: f64 = items.iter()
            .filter(|i| i.disc_description.as_ref().map(|d| d.to_lowercase()).as_deref() == Some("pwd"))
            .map(|i| i.disc_amt.to_f64().unwrap_or(0.0))
            .sum();
        let athlete_discount_amount: f64 = items.iter()
            .filter(|i| i.disc_description.as_ref().map(|d| d.to_lowercase()).as_deref() == Some("athlete"))
            .map(|i| i.disc_amt.to_f64().unwrap_or(0.0))
            .sum();
        let regular_discount_amount: f64 = items.iter()
            .filter(|i| {
                let binding = i.disc_description.as_ref().map(|d| d.to_lowercase());
                let desc = binding.as_deref();
                desc.is_some() && 
                desc != Some("senior citizen") && 
                desc != Some("pwd") && 
                desc != Some("athlete")
            })
            .map(|i| i.disc_amt.to_f64().unwrap_or(0.0))
            .sum();

        // Fetch void info from CRR_ZX_READING
        let void_stmt = Statement::from_sql_and_values(
            DbBackend::Sqlite,
            r#"
            SELECT
                EXISTS (
                    SELECT 1 FROM CRR_ZX_READING zxr2
                    WHERE zxr2.void_tx_num = th.transaction_no AND zxr2.transaction_type = 'VOID'
                ) AS is_voided,
                vu.name AS voided_by_name,
                zxr.void_reason,
                zxr.date_stamp AS void_date,
                zxr.time_stamp AS void_time
            FROM CRR_TXN_HDR th
            LEFT JOIN CRR_ZX_READING zxr ON zxr.void_tx_num = th.transaction_no AND zxr.transaction_type = 'VOID'
            LEFT JOIN users vu ON zxr.voided_by_user_code = vu.id
            WHERE th.invoice_no = ?
            "#,
            vec![invoice_no.into()],
        );

        #[derive(Debug, FromQueryResult)]
        struct VoidResult {
            is_voided: Option<bool>,
            voided_by_name: Option<String>,
            void_reason: Option<String>,
            void_date: Option<String>,
            void_time: Option<String>,
        }

        let void_info = VoidResult::find_by_statement(void_stmt)
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let items_response: Vec<TransactionDetailItem> = items
            .into_iter()
            .map(|i| TransactionDetailItem {
                product_name: i.product_name,
                sku: i.sku,
                quantity: i.qty,
                unit_price: i.unit_price_incl_tax,
                subtotal: i.subtotal,
                discount_description: i.disc_description,
                discount_amount: i.disc_amt.to_f64().unwrap_or(0.0),
                vatable_amt: i.vatable_amt,
                vat_amt: i.vat_amt,
                less_vat: i.less_vat,
                vat_exempt_amt: i.vat_exempt_amt,
                zero_rated_amt: i.zero_rated_amt,
            })
            .collect();

        Ok(TransactionDetailResponse {
            invoice_no: header.invoice_no,
            transaction_no: header.transaction_no,
            transaction_date: header.transaction_date,
            transaction_time: header.transaction_time,
            business_date: header.business_date,
            cashier_name: header.cashier_name,
            payment_method: header.payment_method,
            total: header.total,
            cash_amount_paid: header.cash_amount_paid,
            change_given: header.change_given,
            subtotal,
            tax,
            vatable_sales,
            vat_exempt_sales,
            vat_amount_12_pct: tax,
            less_vat,
            senior_discount_amount,
            pwd_discount_amount,
            athlete_discount_amount,
            regular_discount_amount,
            gross_sales,
            net_sales,
            items: items_response,
            is_voided: void_info.as_ref().and_then(|v| v.is_voided).unwrap_or(false),
            voided_by_name: void_info.as_ref().and_then(|v| v.voided_by_name.clone()),
            void_reason: void_info.as_ref().and_then(|v| v.void_reason.clone()),
            void_date: void_info.as_ref().and_then(|v| v.void_date.clone()),
            void_time: void_info.as_ref().and_then(|v| v.void_time.clone()),
        })
    }

    #[tauri::command]
    pub async fn void_transaction(state: State<'_, AppState>, data: VoidTransactionRequest) -> Result<i32, String> {
        let db = &state.db;

        // Find the original transaction in CRR_ZX_READING
        let original_txn = crr_zx_reading::Entity::find()
            .filter(crr_zx_reading::Column::CompanyCode.eq(data.company_code))
            .filter(crr_zx_reading::Column::StoreCode.eq(data.store_code))
            .filter(crr_zx_reading::Column::TerminalId.eq(data.terminal_id))
            .filter(crr_zx_reading::Column::TransactionNo.eq(data.original_transaction_no))
            .filter(crr_zx_reading::Column::BusinessDate.eq(&data.business_date))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?;

        if let Some(original) = original_txn {
            // Restore ingredient stock
            let original_txn_details = crr_txn_dtl::Entity::find()
                .filter(crr_txn_dtl::Column::TransactionNo.eq(data.original_transaction_no))
                .filter(crr_txn_dtl::Column::BusinessDate.eq(&data.business_date))
                .all(&**db)
                .await
                .map_err(|e| e.to_string())?;

            for item in original_txn_details {
                // Fetch product recipe
                let recipes = products_recipe::Entity::find()
                    .filter(products_recipe::Column::ProductId.eq(item.product_id))
                    .all(&**db)
                    .await
                    .map_err(|e| e.to_string())?;

                if !recipes.is_empty() {
                    // Restore stock for each ingredient in the recipe
                    for recipe in &recipes {
                        let restore_qty = (recipe.actual_usage * item.qty as f64) as i32;

                        let ingredient = ingredient_master_file::Entity::find()
                            .filter(ingredient_master_file::Column::Id.eq(recipe.ingredient_id))
                            .one(&**db)
                            .await
                            .map_err(|e| e.to_string())?
                            .ok_or("Ingredient not found")?;

                        let new_stock = ingredient.base_stock_qty + restore_qty;

                        let mut ingredient_active: ingredient_master_file::ActiveModel = ingredient.into();
                        ingredient_active.base_stock_qty = Set(new_stock);

                        ingredient_active
                            .update(&**db)
                            .await
                            .map_err(|e| e.to_string())?;
                    }
                }
            }

            // Get the next transaction number
            let max_txn = crr_zx_reading::Entity::find()
                .filter(crr_zx_reading::Column::CompanyCode.eq(data.company_code))
                .filter(crr_zx_reading::Column::StoreCode.eq(data.store_code))
                .filter(crr_zx_reading::Column::TerminalId.eq(data.terminal_id))
                .filter(crr_zx_reading::Column::BusinessDate.eq(&data.business_date))
                .all(&**db)
                .await
                .map_err(|e| e.to_string())?;

            let new_transaction_no = max_txn.iter().map(|t| t.transaction_no).max().unwrap_or(0) + 1;

            // Create VOID record in CRR_ZX_READING
            let void_zx_reading = crr_zx_reading::ActiveModel {
                company_code: Set(data.company_code),
                store_code: Set(data.store_code),
                terminal_id: Set(data.terminal_id),
                transaction_no: Set(new_transaction_no),
                business_date: Set(data.business_date),
                payment_type: Set(original.payment_type),
                invoice_number: Set(original.invoice_number),
                amount: Set(-original.amount),
                discount_pct: Set(original.discount_pct),
                local_tax: Set(-original.local_tax),
                service_charge: Set(original.service_charge),
                take_out_charge: Set(original.take_out_charge),
                delivery_charge: Set(original.delivery_charge),
                card_cheque_num: Set(original.card_cheque_num.clone()),
                card_holder_name: Set(original.card_holder_name.clone()),
                trace_no: Set(original.trace_no),
                approval_code: Set(original.approval_code.clone()),
                terminal_ref_no: Set(original.terminal_ref_no.clone()),
                transaction_type: Set("VOID".to_string()),
                void_tx_num: Set(data.original_transaction_no),
                discount_code: Set(original.discount_code),
                sr_pwd_id: Set(original.sr_pwd_id.clone()),
                osca_pwd_name: Set(original.osca_pwd_name.clone()),
                is_vat_exempt: Set(original.is_vat_exempt),
                sr_pwd_vat_exempt_sale: Set(-original.sr_pwd_vat_exempt_sale),
                sr_pwd_total_amount: Set(-original.sr_pwd_total_amount),
                sr_pwd_count: Set(original.sr_pwd_count),
                cashier_user_code: Set(data.voided_by_user_code.clone()),
                date_stamp: Set(chrono::Local::now().format("%-m/%-d/%Y").to_string()),
                time_stamp: Set(chrono::Local::now().format("%I:%M %p").to_string()),
                voided_by_user_code: Set(data.voided_by_user_code),
                void_reason: Set(data.void_reason),
                ..Default::default()
            };

            void_zx_reading
                .insert(&**db)
                .await
                .map_err(|e| e.to_string())?;

            Ok(new_transaction_no)
        } else {
            Err("Original transaction not found".to_string())
        }
    }

    // Unit Management Commands
    #[derive(Debug, Serialize, Deserialize)]
    pub struct UnitMasterResponse {
        pub id: i32,
        pub company_id: i32,
        pub unit_code: String,
        pub unit_description: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateUnitMasterRequest {
        pub unit_code: String,
        pub unit_description: String,
    }

    #[tauri::command]
    pub async fn get_units(state: State<'_, AppState>) -> Result<Vec<UnitMasterResponse>, String> {
        let db = &state.db;

        let units = unit_master::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let unit_responses: Vec<UnitMasterResponse> = units
            .into_iter()
            .map(|u| UnitMasterResponse {
                id: u.id,
                company_id: u.company_id,
                unit_code: u.unit_code,
                unit_description: u.unit_description,
            })
            .collect();

        Ok(unit_responses)
    }

    #[tauri::command]
    pub async fn create_unit_master(state: State<'_, AppState>, data: CreateUnitMasterRequest) -> Result<UnitMasterResponse, String> {
        let db = &state.db;

        let new_unit = unit_master::ActiveModel {
            company_id: Set(1),
            unit_code: Set(data.unit_code),
            unit_description: Set(data.unit_description),
            ..Default::default()
        };

        let result = new_unit
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(UnitMasterResponse {
            id: result.id,
            company_id: result.company_id,
            unit_code: result.unit_code,
            unit_description: result.unit_description,
        })
    }

    // Ingredient Management Commands
    #[derive(Debug, Serialize, Deserialize)]
    pub struct IngredientMasterFileResponse {
        pub id: i32,
        pub company_id: i32,
        pub ingr_code: String,
        pub description: String,
        pub cost_price: f64,
        pub min_stock_lvl: i32,
        pub max_stock_lvl: i32,
        pub usage_unit_id: Option<i32>,
        pub base_stock_qty: i32,
        pub local_cost: f64,
        pub conversion_rate: f64,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateIngredientRequest {
        pub description: String,
        pub cost_price: f64,
        pub min_stock_lvl: i32,
        pub max_stock_lvl: i32,
        pub usage_unit_id: Option<i32>,
        pub base_stock_qty: i32,
        pub local_cost: f64,
        pub conversion_rate: f64,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateIngredientStockRequest {
        pub ingredient_id: i32,
        pub quantity_change: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateIngredientRequest {
        pub id: i32,
        pub description: String,
        pub cost_price: f64,
        pub min_stock_lvl: i32,
        pub max_stock_lvl: i32,
        pub usage_unit_id: Option<i32>,
        pub base_stock_qty: i32,
        pub local_cost: f64,
        pub conversion_rate: f64,
    }

    #[tauri::command]
    pub async fn get_ingredients(state: State<'_, AppState>) -> Result<Vec<IngredientMasterFileResponse>, String> {
        let db = &state.db;

        let ingredients = ingredient_master_file::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let ingredient_responses: Vec<IngredientMasterFileResponse> = ingredients
            .into_iter()
            .map(|i| IngredientMasterFileResponse {
                id: i.id,
                company_id: i.company_id,
                ingr_code: i.ingr_code,
                description: i.description,
                cost_price: i.cost_price,
                min_stock_lvl: i.min_stock_lvl,
                max_stock_lvl: i.max_stock_lvl,
                usage_unit_id: i.usage_unit_id,
                base_stock_qty: i.base_stock_qty,
                local_cost: i.local_cost,
                conversion_rate: i.conversion_rate,
            })
            .collect();

        Ok(ingredient_responses)
    }

    #[tauri::command]
    pub async fn create_ingredient(state: State<'_, AppState>, data: CreateIngredientRequest) -> Result<IngredientMasterFileResponse, String> {
        let db = &state.db;

        // Generate auto-generated ingredient code
        let max_id = ingredient_master_file::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?
            .into_iter()
            .map(|i| i.id)
            .max()
            .unwrap_or(0);

        let ingr_code = format!("ING-{:03}", max_id + 1);

        let new_ingredient = ingredient_master_file::ActiveModel {
            company_id: Set(1),
            ingr_code: Set(ingr_code),
            description: Set(data.description),
            cost_price: Set(data.cost_price),
            min_stock_lvl: Set(data.min_stock_lvl),
            max_stock_lvl: Set(data.max_stock_lvl),
            usage_unit_id: Set(data.usage_unit_id),
            base_stock_qty: Set(data.base_stock_qty),
            local_cost: Set(data.local_cost),
            conversion_rate: Set(data.conversion_rate),
            ..Default::default()
        };

        let result = new_ingredient
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(IngredientMasterFileResponse {
            id: result.id,
            company_id: result.company_id,
            ingr_code: result.ingr_code,
            description: result.description,
            cost_price: result.cost_price,
            min_stock_lvl: result.min_stock_lvl,
            max_stock_lvl: result.max_stock_lvl,
            usage_unit_id: result.usage_unit_id,
            base_stock_qty: result.base_stock_qty,
            local_cost: result.local_cost,
            conversion_rate: result.conversion_rate,
        })
    }

    #[tauri::command]
    pub async fn update_ingredient_stock(state: State<'_, AppState>, data: UpdateIngredientStockRequest) -> Result<(), String> {
        let db = &state.db;

        let ingredient = ingredient_master_file::Entity::find()
            .filter(ingredient_master_file::Column::Id.eq(data.ingredient_id))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Ingredient not found")?;

        let new_stock = ingredient.base_stock_qty + data.quantity_change;

        let mut ingredient_active: ingredient_master_file::ActiveModel = ingredient.into();
        ingredient_active.base_stock_qty = Set(new_stock);

        ingredient_active
            .update(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    #[tauri::command]
    pub async fn update_ingredient(state: State<'_, AppState>, data: UpdateIngredientRequest) -> Result<IngredientMasterFileResponse, String> {
        let db = &state.db;

        let ingredient = ingredient_master_file::Entity::find()
            .filter(ingredient_master_file::Column::Id.eq(data.id))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Ingredient not found")?;

        let mut ingredient_active: ingredient_master_file::ActiveModel = ingredient.into();
        ingredient_active.description = Set(data.description);
        ingredient_active.cost_price = Set(data.cost_price);
        ingredient_active.min_stock_lvl = Set(data.min_stock_lvl);
        ingredient_active.max_stock_lvl = Set(data.max_stock_lvl);
        ingredient_active.usage_unit_id = Set(data.usage_unit_id);
        ingredient_active.base_stock_qty = Set(data.base_stock_qty);
        ingredient_active.local_cost = Set(data.local_cost);
        ingredient_active.conversion_rate = Set(data.conversion_rate);

        let result = ingredient_active
            .update(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(IngredientMasterFileResponse {
            id: result.id,
            company_id: result.company_id,
            ingr_code: result.ingr_code,
            description: result.description,
            cost_price: result.cost_price,
            min_stock_lvl: result.min_stock_lvl,
            max_stock_lvl: result.max_stock_lvl,
            usage_unit_id: result.usage_unit_id,
            base_stock_qty: result.base_stock_qty,
            local_cost: result.local_cost,
            conversion_rate: result.conversion_rate,
        })
    }

    #[tauri::command]
    pub async fn delete_ingredient(state: State<'_, AppState>, ingredient_id: i32) -> Result<(), String> {
        let db = &state.db;

        ingredient_master_file::Entity::delete_by_id(ingredient_id)
            .exec(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    // Conversion Management Commands
    #[derive(Debug, Serialize, Deserialize)]
    pub struct ConversionFileResponse {
        pub id: i32,
        pub company_id: i32,
        pub unit_to_convert: String,
        pub convert_to: String,
        pub rate: f64,
        pub spare: Option<String>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateConversionRequest {
        pub unit_to_convert: String,
        pub convert_to: String,
        pub rate: f64,
    }

    #[tauri::command]
    pub async fn get_conversions(state: State<'_, AppState>) -> Result<Vec<ConversionFileResponse>, String> {
        let db = &state.db;

        let conversions = conversion_file::Entity::find()
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let conversion_responses: Vec<ConversionFileResponse> = conversions
            .into_iter()
            .map(|c| ConversionFileResponse {
                id: c.id,
                company_id: c.company_id,
                unit_to_convert: c.unit_to_convert,
                convert_to: c.convert_to,
                rate: c.rate,
                spare: c.spare,
            })
            .collect();

        Ok(conversion_responses)
    }

    #[tauri::command]
    pub async fn create_conversion(state: State<'_, AppState>, data: CreateConversionRequest) -> Result<ConversionFileResponse, String> {
        let db = &state.db;

        let new_conversion = conversion_file::ActiveModel {
            company_id: Set(1),
            unit_to_convert: Set(data.unit_to_convert),
            convert_to: Set(data.convert_to),
            rate: Set(data.rate),
            spare: Set(None),
            ..Default::default()
        };

        let result = new_conversion
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(ConversionFileResponse {
            id: result.id,
            company_id: result.company_id,
            unit_to_convert: result.unit_to_convert,
            convert_to: result.convert_to,
            rate: result.rate,
            spare: result.spare,
        })
    }

    // Recipe Management Commands
    #[derive(Debug, Serialize, Deserialize)]
    pub struct ProductsRecipeResponse {
        pub id: i32,
        pub product_id: i32,
        pub ingredient_id: i32,
        pub usage_qty: f64,
        pub usage_uom_code: String,
        pub actual_usage: f64,
        pub cost: f64,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateRecipeRequest {
        pub product_id: i32,
        pub ingredient_id: i32,
        pub usage_qty: f64,
        pub usage_uom_code: String,
        pub actual_usage: f64,
        pub cost: f64,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateRecipeRequest {
        pub id: i32,
        pub product_id: i32,
        pub ingredient_id: i32,
        pub usage_qty: f64,
        pub usage_uom_code: String,
        pub actual_usage: f64,
        pub cost: f64,
    }

    #[tauri::command]
    pub async fn get_product_recipe(state: State<'_, AppState>, product_id: i32) -> Result<Vec<ProductsRecipeResponse>, String> {
        let db = &state.db;

        let recipes = products_recipe::Entity::find()
            .filter(products_recipe::Column::ProductId.eq(product_id))
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let recipe_responses: Vec<ProductsRecipeResponse> = recipes
            .into_iter()
            .map(|r| ProductsRecipeResponse {
                id: r.id,
                product_id: r.product_id,
                ingredient_id: r.ingredient_id,
                usage_qty: r.usage_qty,
                usage_uom_code: r.usage_uom_code,
                actual_usage: r.actual_usage,
                cost: r.cost,
            })
            .collect();

        Ok(recipe_responses)
    }

    #[tauri::command]
    pub async fn create_recipe(state: State<'_, AppState>, data: CreateRecipeRequest) -> Result<ProductsRecipeResponse, String> {
        let db = &state.db;

        let new_recipe = products_recipe::ActiveModel {
            product_id: Set(data.product_id),
            ingredient_id: Set(data.ingredient_id),
            usage_qty: Set(data.usage_qty),
            usage_uom_code: Set(data.usage_uom_code),
            actual_usage: Set(data.actual_usage),
            cost: Set(data.cost),
            ..Default::default()
        };

        let result = new_recipe
            .insert(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(ProductsRecipeResponse {
            id: result.id,
            product_id: result.product_id,
            ingredient_id: result.ingredient_id,
            usage_qty: result.usage_qty,
            usage_uom_code: result.usage_uom_code,
            actual_usage: result.actual_usage,
            cost: result.cost,
        })
    }

    #[tauri::command]
    pub async fn delete_recipe(state: State<'_, AppState>, recipe_id: i32) -> Result<(), String> {
        let db = &state.db;

        products_recipe::Entity::delete_by_id(recipe_id)
            .exec(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    #[tauri::command]
    pub async fn update_recipe(state: State<'_, AppState>, data: UpdateRecipeRequest) -> Result<ProductsRecipeResponse, String> {
        let db = &state.db;

        let recipe = products_recipe::Entity::find()
            .filter(products_recipe::Column::Id.eq(data.id))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Recipe not found")?;

        let mut recipe_active: products_recipe::ActiveModel = recipe.into();
        recipe_active.product_id = Set(data.product_id);
        recipe_active.ingredient_id = Set(data.ingredient_id);
        recipe_active.usage_qty = Set(data.usage_qty);
        recipe_active.usage_uom_code = Set(data.usage_uom_code);
        recipe_active.actual_usage = Set(data.actual_usage);
        recipe_active.cost = Set(data.cost);

        let result = recipe_active
            .update(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(ProductsRecipeResponse {
            id: result.id,
            product_id: result.product_id,
            ingredient_id: result.ingredient_id,
            usage_qty: result.usage_qty,
            usage_uom_code: result.usage_uom_code,
            actual_usage: result.actual_usage,
            cost: result.cost,
        })
    }

    #[tauri::command]
    pub async fn recalculate_product_cost(state: State<'_, AppState>, product_id: i32) -> Result<f64, String> {
        let db = &state.db;

        let recipes = products_recipe::Entity::find()
            .filter(products_recipe::Column::ProductId.eq(product_id))
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let total_cost: f64 = recipes.iter().map(|r| r.cost).sum();

        // Update the product's recipe_cost
        let product = product::Entity::find()
            .filter(product::Column::Id.eq(product_id))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Product not found")?;

        let mut product_active: product::ActiveModel = product.into();
        product_active.recipe_cost = Set(total_cost);

        product_active
            .update(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(total_cost)
    }

    #[tauri::command]
    pub async fn update_product_price_from_cost(state: State<'_, AppState>, product_id: i32) -> Result<f64, String> {
        let db = &state.db;

        let product = product::Entity::find()
            .filter(product::Column::Id.eq(product_id))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Product not found")?;

        // For now, just set price to recipe_cost (markup to be configured later)
        let new_price = product.recipe_cost;

        let mut product_active: product::ActiveModel = product.into();
        product_active.price = Set(new_price);

        product_active
            .update(&**db)
            .await
            .map_err(|e| e.to_string())?;

        Ok(new_price)
    }

