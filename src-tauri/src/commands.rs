    use crate::entity::{role, user, product, txn_head, txn_dtl, category, discount_code, pos_zx_reading};
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
                                                "SELECT COALESCE(MAX(transaction_no), 0) + 1 AS next_id FROM POS_TXN_HDR WHERE company_code = {} AND store_code = {} AND terminal_id = {}",
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
                                            "SELECT COALESCE(MAX(invoice_no), 0) + 1 AS next_invoice FROM POS_TXN_HDR".to_owned(),
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

        let new_zx_reading = pos_zx_reading::ActiveModel {
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
    pub struct TransactionHistoryResponse {
        pub transaction_no: i32,
        pub invoice_number: i32,
        pub business_date: String,
        pub amount: f64,
        pub payment_type: i32,
        pub transaction_type: String,
        pub void_tx_num: i32,
        pub cashier_user_code: String,
        pub date_stamp: String,
        pub time_stamp: String,
        pub voided_by_user_code: Option<String>,
    }

    #[tauri::command]
    pub async fn get_transaction_history(
        company_code: i32,
        store_code: i32,
        terminal_id: i32,
        business_date: String,
        state: State<'_, AppState>
    ) -> Result<Vec<TransactionHistoryResponse>, String> {
        let db = &state.db;

        let transactions = pos_zx_reading::Entity::find()
            .filter(pos_zx_reading::Column::CompanyCode.eq(company_code))
            .filter(pos_zx_reading::Column::StoreCode.eq(store_code))
            .filter(pos_zx_reading::Column::TerminalId.eq(terminal_id))
            .filter(pos_zx_reading::Column::BusinessDate.eq(&business_date))
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let responses: Vec<TransactionHistoryResponse> = transactions
            .into_iter()
            .map(|t| TransactionHistoryResponse {
                transaction_no: t.transaction_no,
                invoice_number: t.invoice_number,
                business_date: t.business_date,
                amount: t.amount.to_string().parse::<f64>().unwrap_or(0.0),
                payment_type: t.payment_type,
                transaction_type: t.transaction_type,
                void_tx_num: t.void_tx_num,
                cashier_user_code: t.cashier_user_code,
                date_stamp: t.date_stamp,
                time_stamp: t.time_stamp,
                voided_by_user_code: Some(t.voided_by_user_code),
            })
            .collect();

        Ok(responses)
    }

    #[tauri::command]
    pub async fn void_transaction(state: State<'_, AppState>, data: VoidTransactionRequest) -> Result<i32, String> {
        let db = &state.db;

        let max_txn = pos_zx_reading::Entity::find()
            .filter(pos_zx_reading::Column::CompanyCode.eq(data.company_code))
            .filter(pos_zx_reading::Column::StoreCode.eq(data.store_code))
            .filter(pos_zx_reading::Column::TerminalId.eq(data.terminal_id))
            .filter(pos_zx_reading::Column::BusinessDate.eq(&data.business_date))
            .all(&**db)
            .await
            .map_err(|e| e.to_string())?;

        let new_transaction_no = max_txn.iter().map(|t| t.transaction_no).max().unwrap_or(0) + 1;

        let original_txn = pos_zx_reading::Entity::find()
            .filter(pos_zx_reading::Column::CompanyCode.eq(data.company_code))
            .filter(pos_zx_reading::Column::StoreCode.eq(data.store_code))
            .filter(pos_zx_reading::Column::TerminalId.eq(data.terminal_id))
            .filter(pos_zx_reading::Column::TransactionNo.eq(data.original_transaction_no))
            .filter(pos_zx_reading::Column::BusinessDate.eq(&data.business_date))
            .one(&**db)
            .await
            .map_err(|e| e.to_string())?;

        if let Some(original) = original_txn {
            let void_zx_reading = pos_zx_reading::ActiveModel {
                company_code: Set(data.company_code),
                store_code: Set(data.store_code),
                terminal_id: Set(data.terminal_id),
                transaction_no: Set(new_transaction_no),
                business_date: Set(data.business_date),
                payment_type: Set(original.payment_type),
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
                date_stamp: Set(chrono::Utc::now().format("%Y-%m-%d").to_string()),
                time_stamp: Set(chrono::Utc::now().format("%H:%M:%S").to_string()),
                voided_by_user_code: Set(data.voided_by_user_code),
                invoice_number: Set(original.invoice_number),
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
