mod entity;
mod migration;
mod commands;

use sea_orm::{Database, ConnectOptions, DatabaseConnection};
use sea_orm_migration::MigratorTrait;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Manager};

pub struct AppState {
    pub db: Arc<DatabaseConnection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      commands::get_users,
      commands::get_roles,
      commands::login_user,
      commands::get_products,
      commands::get_categories,
      commands::get_discount_codes,
      commands::create_transaction,
      commands::create_pos_zx_reading,
      commands::void_transaction,
      commands::unvoid_transaction,
      commands::exchange_transaction,
      commands::get_business_day_status,
      commands::perform_day_start,
      commands::perform_day_end,
      commands::populate_temp_tables,
      commands::clear_temp_tables,
      commands::get_transaction_history,
      commands::get_current_transactions,
      commands::get_current_transaction_details,
      commands::get_units,
      commands::create_unit_master,
      commands::get_ingredients,
      commands::create_ingredient,
      commands::update_ingredient_stock,
      commands::update_ingredient,
      commands::delete_ingredient,
      commands::get_conversions,
      commands::create_conversion,
      commands::get_product_recipe,
      commands::create_recipe,
      commands::delete_recipe,
      commands::update_recipe,
      commands::recalculate_product_cost,
      commands::update_product_price_from_cost,
      commands::create_product,
      commands::update_product,
      commands::delete_product,
      commands::create_category,
      commands::update_category,
      commands::delete_category,
      commands::batch_import_products
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Set up SeaORM database connection
      let app_data_dir = app.path().app_data_dir().expect("Failed to get app data directory");
      std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
      let db_path = app_data_dir.join("pos.db");
      let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
      let mut opt = ConnectOptions::new(db_url);
      opt.max_connections(100)
          .min_connections(5)
          .connect_timeout(Duration::from_secs(8))
          .acquire_timeout(Duration::from_secs(8))
          .idle_timeout(Duration::from_secs(8))
          .max_lifetime(Duration::from_secs(8))
          .sqlx_logging(false)
          .sqlx_logging_level(log::LevelFilter::Info);

      let db = Arc::new(
        tauri::async_runtime::block_on(Database::connect(opt))
          .expect("Failed to connect to database")
      );

      // Run migrations
      tauri::async_runtime::block_on(
        migration::Migrator::up(&*db, None) 
      ).expect("Failed to run migrations");

      app.manage(AppState { db });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
