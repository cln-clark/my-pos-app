  import { Product, User, Transaction, Role, Category,
    TransactionRequest, PosZxReadingRequest, VoidTransactionRequest, ExchangeTransactionRequest,
    UserResponse, RoleResponse, ProductResponse, CategoryResponse,
    DiscountCodeResponse, TransactionResponse,
    UnitMasterResponse, CreateUnitMasterRequest,
    IngredientMasterFileResponse, CreateIngredientRequest, UpdateIngredientStockRequest, UpdateIngredientRequest,
    ConversionFileResponse, CreateConversionRequest,
    ProductsRecipeResponse, CreateRecipeRequest, UpdateRecipeRequest,
    CreateProductRequest, UpdateProductRequest,
    CreateCategoryRequest, UpdateCategoryRequest,
    CsvProductRow, BatchImportRequest, BatchImportResponse,
    CsvIngredientRow, BatchImportIngredientsRequest,
    BulkRecipeLine, ProductVariationResponse, CreateVariationRequest, UpdateVariationRequest,
    RecipeTemplate, RecipeItem, RecipeLink,
    CreateRecipeTemplateRequest, UpdateRecipeTemplateRequest,
    CreateRecipeItemRequest, UpdateRecipeItemRequest,
    LinkRecipeRequest,
    BundleResponse, BundleItemResponse, CreateBundleRequest, UpdateBundleRequest, AddBundleItemRequest,
    AddOnResponse, AddOnItemResponse, CreateAddOnRequest, UpdateAddOnRequest, AddAddOnItemRequest } from './types';
  import { invoke } from '@tauri-apps/api/core';

  export async function getProducts() {
    try {
      const products = await invoke('get_products');
      const categories = await invoke('get_categories');

      return (products as ProductResponse[]).map(product => {
        const category = (categories as CategoryResponse[]).find((c: CategoryResponse) => c.id === product.category_id);
        return {
          ...product,
          id: product.id.toString(),
          categoryId: product.category_id,
          category: category?.category_name || 'Uncategorized',
          categoryCode: category?.category_code || 'UNC'
        };
      }) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  export async function getCategories() {
    try {
      const categories = await invoke('get_categories');
      return (categories as CategoryResponse[]).map((c: CategoryResponse) => ({
        id: c.id,
        categoryCode: c.category_code,
        categoryName: c.category_name
      })) as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  export async function getDiscountCodes() {
    try {
      const discountCodes = await invoke('get_discount_codes');
      return discountCodes as DiscountCodeResponse[];
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      return [];
    }
  }

  export async function getUsers() {
    try {
      const users = await invoke('get_users');
      const roles = await invoke('get_roles');

      return (users as UserResponse[]).map((user: UserResponse) => ({
        ...user,
        id: user.id.toString(),
        role: (roles as RoleResponse[]).find((r: RoleResponse) => r.id === user.role_id)?.role_name ? {
          id: (roles as RoleResponse[]).find((r: RoleResponse) => r.id === user.role_id)!.id,
          name: (roles as RoleResponse[]).find((r: RoleResponse) => r.id === user.role_id)!.role_name
        } : null
      })) as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  export async function createTransaction(transactionData: TransactionRequest): Promise<TransactionResponse> {
    try {
      const result = await invoke<TransactionResponse>('create_transaction', { transactionData });
      return result;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  export async function createPosZxReading(zxReadingData: PosZxReadingRequest): Promise<void> {
    try {
      await invoke('create_pos_zx_reading', { data: zxReadingData });
    } catch (error) {
      console.error('Error creating POS ZX reading:', error);
      throw error;
    }
  }

  export async function loginUser(cashierUserCode: number, pin: string) {
    try {
      const user = await invoke('login_user', { cashierUserCode, pin });
      const roles = await invoke('get_roles');

      const foundRole = (roles as RoleResponse[]).find((r: RoleResponse) => r.id === (user as UserResponse).role_id);
      return {
        ...(user as UserResponse),
        id: (user as UserResponse).id.toString(),
        role: foundRole ? {
          id: foundRole.id,
          name: foundRole.role_name
        } : null
      };
    } catch (error) {
      // Login failed (invalid credentials) - return null silently
      return null;
    }
  }

  export async function getTransactionDetails(invoiceNo: number) {
    try {
      const data = await invoke('get_transaction_details', { invoiceNo });
      return data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  }

  export async function getCurrentTransactionDetails(invoiceNo: number) {
    try {
      const data = await invoke('get_current_transaction_details', { invoiceNo });
      return data;
    } catch (error) {
      console.error('Error fetching current transaction details:', error);
      throw error;
    }
  }

  export async function voidTransaction(data: VoidTransactionRequest): Promise<number> {
    try {
      const result = await invoke<number>('void_transaction', { data });
      return result;
    } catch (error) {
      console.error('Error voiding transaction:', error);
      throw error;
    }
  }

  export async function exchangeTransaction(data: ExchangeTransactionRequest) {
    try {
      const result = await invoke('exchange_transaction', { data });
      return result;
    } catch (error) {
      console.error('Error processing exchange:', error);
      throw error;
    }
  }

  // Unit Management Functions
  export async function getUnits(): Promise<UnitMasterResponse[]> {
    try {
      const units = await invoke('get_units');
      return units as UnitMasterResponse[];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  }

  export async function createUnitMaster(data: CreateUnitMasterRequest): Promise<UnitMasterResponse> {
    try {
      const result = await invoke('create_unit_master', { data });
      return result as UnitMasterResponse;
    } catch (error) {
      console.error('Error creating unit:', error);
      throw error;
    }
  }

  // Ingredient Management Functions
  export async function getIngredients(): Promise<IngredientMasterFileResponse[]> {
    try {
      const ingredients = await invoke('get_ingredients');
      return ingredients as IngredientMasterFileResponse[];
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return [];
    }
  }

  export async function createIngredient(data: CreateIngredientRequest): Promise<IngredientMasterFileResponse> {
    try {
      const result = await invoke('create_ingredient', { data });
      return result as IngredientMasterFileResponse;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  }

  export async function updateIngredientStock(data: UpdateIngredientStockRequest): Promise<void> {
    try {
      await invoke('update_ingredient_stock', { data });
    } catch (error) {
      console.error('Error updating ingredient stock:', error);
      throw error;
    }
  }

  export async function updateIngredient(data: UpdateIngredientRequest): Promise<IngredientMasterFileResponse> {
    try {
      const result = await invoke('update_ingredient', { data });
      return result as IngredientMasterFileResponse;
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  }

  export async function deleteIngredient(ingredientId: number): Promise<void> {
    try {
      await invoke('delete_ingredient', { ingredientId });
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  }

  // Conversion Management Functions
  export async function getConversions(): Promise<ConversionFileResponse[]> {
    try {
      const conversions = await invoke('get_conversions');
      return conversions as ConversionFileResponse[];
    } catch (error) {
      console.error('Error fetching conversions:', error);
      return [];
    }
  }

  export async function createConversion(data: CreateConversionRequest): Promise<ConversionFileResponse> {
    try {
      const result = await invoke('create_conversion', { data });
      return result as ConversionFileResponse;
    } catch (error) {
      console.error('Error creating conversion:', error);
      throw error;
    }
  }

  // Recipe Management Functions
  export async function getProductRecipe(productId: number, variationId?: number): Promise<ProductsRecipeResponse[]> {
    try {
      const recipes = await invoke('get_product_recipe', { productId, variationId });
      return recipes as ProductsRecipeResponse[];
    } catch (error) {
      console.error('Error fetching product recipe:', error);
      return [];
    }
  }

  export async function createRecipe(data: CreateRecipeRequest): Promise<ProductsRecipeResponse> {
    try {
      const result = await invoke('create_recipe', { data });
      return result as ProductsRecipeResponse;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  }

  export async function deleteRecipe(recipeId: number): Promise<void> {
    try {
      await invoke('delete_recipe', { recipeId });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  export async function updateRecipe(data: UpdateRecipeRequest): Promise<ProductsRecipeResponse> {
    try {
      const result = await invoke('update_recipe', { data });
      return result as ProductsRecipeResponse;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  }

  export async function recalculateProductCost(productId: number): Promise<number> {
    try {
      const result = await invoke('recalculate_product_cost', { productId });
      return result as number;
    } catch (error) {
      console.error('Error recalculating product cost:', error);
      throw error;
    }
  }

  export async function updateProductPriceFromCost(productId: number): Promise<number> {
    try {
      const result = await invoke('update_product_price_from_cost', { productId });
      return result as number;
    } catch (error) {
      console.error('Error updating product price from cost:', error);
      throw error;
    }
  }

  export async function createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    try {
      const result = await invoke('create_product', { data });
      return result as ProductResponse;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  export async function updateProduct(data: UpdateProductRequest): Promise<ProductResponse> {
    try {
      const result = await invoke('update_product', { data });
      return result as ProductResponse;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  export async function deleteProduct(productId: number): Promise<void> {
    try {
      await invoke('delete_product', { productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  export async function createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    try {
      const result = await invoke('create_category', { data });
      return result as CategoryResponse;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  export async function updateCategory(data: UpdateCategoryRequest): Promise<CategoryResponse> {
    try {
      const result = await invoke('update_category', { data });
      return result as CategoryResponse;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  export async function deleteCategory(categoryId: number): Promise<void> {
    try {
      await invoke('delete_category', { categoryId });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  export async function batchImportProducts(data: BatchImportRequest): Promise<BatchImportResponse> {
    try {
      const result = await invoke('batch_import_products', { data });
      return result as BatchImportResponse;
    } catch (error) {
      console.error('Error batch importing products:', error);
      throw error;
    }
  }

  export async function batchImportIngredients(data: BatchImportIngredientsRequest): Promise<BatchImportResponse> {
    try {
      const result = await invoke('batch_import_ingredients', { data });
      return result as BatchImportResponse;
    } catch (error) {
      console.error('Error batch importing ingredients:', error);
      throw error;
    }
  }

  export async function saveRecipeBulk(productId: number, lines: BulkRecipeLine[]): Promise<ProductsRecipeResponse[]> {
    try {
      const result = await invoke('save_recipe_bulk', { data: { product_id: productId, lines } });
      return result as ProductsRecipeResponse[];
    } catch (error) {
      console.error('Error saving recipe bulk:', error);
      throw error;
    }
  }

  // Product Variations Functions
  export async function getProductVariations(productId: number): Promise<ProductVariationResponse[]> {
    try {
      const variations = await invoke('get_product_variations', { productId });
      return variations as ProductVariationResponse[];
    } catch (error) {
      console.error('Error fetching product variations:', error);
      return [];
    }
  }

  export async function createVariation(data: CreateVariationRequest): Promise<ProductVariationResponse> {
    try {
      const result = await invoke('create_variation', { data });
      return result as ProductVariationResponse;
    } catch (error) {
      console.error('Error creating variation:', error);
      throw error;
    }
  }

  export async function updateVariation(data: UpdateVariationRequest): Promise<ProductVariationResponse> {
    try {
      const result = await invoke('update_variation', { data });
      return result as ProductVariationResponse;
    } catch (error) {
      console.error('Error updating variation:', error);
      throw error;
    }
  }

  export async function deleteVariation(variationId: number): Promise<void> {
    try {
      await invoke('delete_variation', { variationId });
    } catch (error) {
      console.error('Error deleting variation:', error);
      throw error;
    }
  }

  // Recipe Module Functions
  export async function getRecipeTemplates(): Promise<RecipeTemplate[]> {
    try {
      const templates = await invoke('get_recipe_templates');
      return templates as RecipeTemplate[];
    } catch (error) {
      console.error('Error fetching recipe templates:', error);
      return [];
    }
  }

  export async function createRecipeTemplate(data: CreateRecipeTemplateRequest): Promise<RecipeTemplate> {
    try {
      const result = await invoke('create_recipe_template', { data });
      return result as RecipeTemplate;
    } catch (error) {
      console.error('Error creating recipe template:', error);
      throw error;
    }
  }

  export async function updateRecipeTemplate(data: UpdateRecipeTemplateRequest): Promise<RecipeTemplate> {
    try {
      const result = await invoke('update_recipe_template', { data });
      return result as RecipeTemplate;
    } catch (error) {
      console.error('Error updating recipe template:', error);
      throw error;
    }
  }

  export async function deleteRecipeTemplate(id: number): Promise<void> {
    try {
      await invoke('delete_recipe_template', { id });
    } catch (error) {
      console.error('Error deleting recipe template:', error);
      throw error;
    }
  }

  export async function getRecipeItems(recipeId: number): Promise<RecipeItem[]> {
    try {
      const items = await invoke('get_recipe_items', { recipeId });
      return items as RecipeItem[];
    } catch (error) {
      console.error('Error fetching recipe items:', error);
      return [];
    }
  }

  export async function addRecipeItem(data: CreateRecipeItemRequest): Promise<RecipeItem> {
    try {
      const result = await invoke('add_recipe_item', { data });
      return result as RecipeItem;
    } catch (error) {
      console.error('Error adding recipe item:', error);
      throw error;
    }
  }

  export async function updateRecipeItem(data: UpdateRecipeItemRequest): Promise<RecipeItem> {
    try {
      const result = await invoke('update_recipe_item', { data });
      return result as RecipeItem;
    } catch (error) {
      console.error('Error updating recipe item:', error);
      throw error;
    }
  }

  export async function deleteRecipeItem(id: number): Promise<void> {
    try {
      await invoke('delete_recipe_item', { id });
    } catch (error) {
      console.error('Error deleting recipe item:', error);
      throw error;
    }
  }

  export async function linkRecipe(data: LinkRecipeRequest): Promise<RecipeLink> {
    try {
      const result = await invoke('link_recipe', { data });
      return result as RecipeLink;
    } catch (error) {
      console.error('Error linking recipe:', error);
      throw error;
    }
  }

  export async function unlinkRecipe(id: number): Promise<void> {
    try {
      await invoke('unlink_recipe', { id });
    } catch (error) {
      console.error('Error unlinking recipe:', error);
      throw error;
    }
  }

  export async function getProductRecipeLink(productId: number): Promise<RecipeLink | null> {
    try {
      const link = await invoke('get_product_recipe_link', { productId });
      return link as RecipeLink | null;
    } catch (error) {
      console.error('Error fetching product recipe link:', error);
      return null;
    }
  }

  export async function getVariationRecipeLink(variationId: number): Promise<RecipeLink | null> {
    try {
      const link = await invoke('get_variation_recipe_link', { variationId });
      return link as RecipeLink | null;
    } catch (error) {
      console.error('Error fetching variation recipe link:', error);
      return null;
    }
  }

  export async function calculateRecipeCost(recipeId: number): Promise<number> {
    try {
      const cost = await invoke('calculate_recipe_cost', { recipeId });
      return cost as number;
    } catch (error) {
      console.error('Error calculating recipe cost:', error);
      throw error;
    }
  }

  export async function calculateRecipeMargin(recipeId: number, sellingPrice: number): Promise<number> {
    try {
      const margin = await invoke('calculate_recipe_margin', { recipeId, sellingPrice });
      return margin as number;
    } catch (error) {
      console.error('Error calculating recipe margin:', error);
      throw error;
    }
  }

  export async function calculateFoodCostPercentage(recipeId: number, sellingPrice: number): Promise<number> {
    try {
      const percentage = await invoke('calculate_food_cost_percentage', { recipeId, sellingPrice });
      return percentage as number;
    } catch (error) {
      console.error('Error calculating food cost percentage:', error);
      throw error;
    }
  }

  // Bundle Functions
  export async function getBundles(): Promise<BundleResponse[]> {
    try {
      const bundles = await invoke('get_bundles');
      return bundles as BundleResponse[];
    } catch (error) {
      console.error('Error fetching bundles:', error);
      return [];
    }
  }

  export async function getBundleWithItems(bundleId: number): Promise<[BundleResponse, BundleItemResponse[]]> {
    try {
      const result = await invoke('get_bundle_with_items', { bundleId });
      return result as [BundleResponse, BundleItemResponse[]];
    } catch (error) {
      console.error('Error fetching bundle with items:', error);
      throw error;
    }
  }

  export async function createBundle(data: CreateBundleRequest): Promise<BundleResponse> {
    try {
      const result = await invoke('create_bundle', { data });
      return result as BundleResponse;
    } catch (error) {
      console.error('Error creating bundle:', error);
      throw error;
    }
  }

  export async function updateBundle(data: UpdateBundleRequest): Promise<BundleResponse> {
    try {
      const result = await invoke('update_bundle', { data });
      return result as BundleResponse;
    } catch (error) {
      console.error('Error updating bundle:', error);
      throw error;
    }
  }

  export async function deleteBundle(bundleId: number): Promise<void> {
    try {
      await invoke('delete_bundle', { bundleId });
    } catch (error) {
      console.error('Error deleting bundle:', error);
      throw error;
    }
  }

  export async function addBundleItem(data: AddBundleItemRequest): Promise<BundleItemResponse> {
    try {
      const result = await invoke('add_bundle_item', { data });
      return result as BundleItemResponse;
    } catch (error) {
      console.error('Error adding bundle item:', error);
      throw error;
    }
  }

  export async function removeBundleItem(itemId: number): Promise<void> {
    try {
      await invoke('remove_bundle_item', { itemId });
    } catch (error) {
      console.error('Error removing bundle item:', error);
      throw error;
    }
  }

  export async function updateBundleItem(itemId: number, quantity: number): Promise<void> {
    try {
      await invoke('update_bundle_item', { itemId, quantity });
    } catch (error) {
      console.error('Error updating bundle item:', error);
      throw error;
    }
  }

  // Add-on Functions
  export async function getAddOns(): Promise<AddOnResponse[]> {
    try {
      const addOns = await invoke('get_add_ons');
      return addOns as AddOnResponse[];
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      return [];
    }
  }

  export async function getAddOnWithItems(addOnId: number): Promise<[AddOnResponse, AddOnItemResponse[]]> {
    try {
      const result = await invoke('get_add_on_with_items', { addOnId });
      return result as [AddOnResponse, AddOnItemResponse[]];
    } catch (error) {
      console.error('Error fetching add-on with items:', error);
      throw error;
    }
  }

  export async function createAddOn(data: CreateAddOnRequest): Promise<AddOnResponse> {
    try {
      const result = await invoke('create_add_on', { data });
      return result as AddOnResponse;
    } catch (error) {
      console.error('Error creating add-on:', error);
      throw error;
    }
  }

  export async function updateAddOn(data: UpdateAddOnRequest): Promise<AddOnResponse> {
    try {
      const result = await invoke('update_add_on', { data });
      return result as AddOnResponse;
    } catch (error) {
      console.error('Error updating add-on:', error);
      throw error;
    }
  }

  export async function deleteAddOn(addOnId: number): Promise<void> {
    try {
      await invoke('delete_add_on', { addOnId });
    } catch (error) {
      console.error('Error deleting add-on:', error);
      throw error;
    }
  }

  export async function addAddOnItem(data: AddAddOnItemRequest): Promise<AddOnItemResponse> {
    try {
      const result = await invoke('add_add_on_item', { data });
      return result as AddOnItemResponse;
    } catch (error) {
      console.error('Error adding add-on item:', error);
      throw error;
    }
  }

  export async function removeAddOnItem(itemId: number): Promise<void> {
    try {
      await invoke('remove_add_on_item', { itemId });
    } catch (error) {
      console.error('Error removing add-on item:', error);
      throw error;
    }
  }

  export async function updateAddOnItem(itemId: number, quantity: number): Promise<void> {
    try {
      await invoke('update_add_on_item', { itemId, quantity });
    } catch (error) {
      console.error('Error updating add-on item:', error);
      throw error;
    }
  }


