    use crate::entity::{role, user, product, txn_head, txn_dtl, category, discount_code};
    use crate::AppState;
    use sea_orm::ConnectionTrait;
    use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, ActiveModelTrait, Set, Statement};
    use serde::{Deserialize, Serialize};
    use tauri::State;
    use rust_decimal::prelude::FromPrimitive;


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
        pub stock: i32,
        pub description: Option<String>,
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
        pub disc_code_id: Option<i32>,
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
                stock: p.stock,
                description: p.description,
            })
            .collect();

        Ok(product_responses)
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
                                                "SELECT COALESCE(MAX(transaction_no), 0) + 1 AS next_id FROM txn_head WHERE company_code = {} AND store_code = {} AND terminal_id = {}",
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
                                            "SELECT COALESCE(MAX(invoice_no), 0) + 1 AS next_invoice FROM txn_head".to_owned(),
            )).await
            .map_err(|e| e.to_string())?;

        // Step 4 — Extract next invoice_no, default to 1 if first ever transaction
        let invoice_no: i32 = match invoice_no_result{
            Some(row) => row.try_get::<i32>("", "next_invoice").unwrap_or(1),
            None => 1,
        };

        // Step 5 — Insert with transaction_no and invoice_no already set
        let new_txn_head = txn_head::ActiveModel {
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
            let txn_dtl = txn_dtl::ActiveModel {
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
                disc_code_id: Set(item.disc_code_id),
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
