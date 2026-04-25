import { Knex } from 'knex';

/**
 * Migration: Create Auth Sync Triggers
 *
 * Sets up PostgreSQL triggers to automatically synchronize users created or deleted
 * in Supabase's auth.users table with our custom "User Profiles" collection.
 */
export async function up(knex: Knex): Promise<void> {
  // 1. Create function for INSERT
  await knex.raw(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      -- Insert a new item into collection_items for both draft and published
      INSERT INTO public.collection_items (id, collection_id, manual_order, is_publishable, is_published, created_at, updated_at)
      VALUES 
        (new.id, 'c011ec71-0000-4000-8000-000000000001', 0, true, false, new.created_at, new.updated_at),
        (new.id, 'c011ec71-0000-4000-8000-000000000001', 0, true, true, new.created_at, new.updated_at);

      -- Insert core values
      INSERT INTO public.collection_item_values (item_id, field_id, value, is_published, created_at, updated_at)
      VALUES 
        (new.id, 'f1e1d000-0000-4000-8000-000000000001', new.id::text, false, new.created_at, new.updated_at),
        (new.id, 'f1e1d000-0000-4000-8000-000000000001', new.id::text, true, new.created_at, new.updated_at),
        (new.id, 'f1e1d000-0000-4000-8000-000000000004', new.email, false, new.created_at, new.updated_at),
        (new.id, 'f1e1d000-0000-4000-8000-000000000004', new.email, true, new.created_at, new.updated_at);
        
      IF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        INSERT INTO public.collection_item_values (item_id, field_id, value, is_published, created_at, updated_at)
        VALUES 
          (new.id, 'f1e1d000-0000-4000-8000-000000000002', new.raw_user_meta_data->>'full_name', false, new.created_at, new.updated_at),
          (new.id, 'f1e1d000-0000-4000-8000-000000000002', new.raw_user_meta_data->>'full_name', true, new.created_at, new.updated_at);
      END IF;

      IF new.raw_user_meta_data->>'avatar_url' IS NOT NULL THEN
        INSERT INTO public.collection_item_values (item_id, field_id, value, is_published, created_at, updated_at)
        VALUES 
          (new.id, 'f1e1d000-0000-4000-8000-000000000005', new.raw_user_meta_data->>'avatar_url', false, new.created_at, new.updated_at),
          (new.id, 'f1e1d000-0000-4000-8000-000000000005', new.raw_user_meta_data->>'avatar_url', true, new.created_at, new.updated_at);
      END IF;

      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  await knex.raw(`
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `);

  // 2. Create function for DELETE
  await knex.raw(`
    CREATE OR REPLACE FUNCTION public.handle_deleted_user()
    RETURNS trigger AS $$
    BEGIN
      -- We soft delete the collection item
      UPDATE public.collection_items 
      SET deleted_at = now() 
      WHERE id = old.id AND collection_id = 'c011ec71-0000-4000-8000-000000000001';

      -- And delete values
      UPDATE public.collection_item_values
      SET deleted_at = now()
      WHERE item_id = old.id;

      RETURN old;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  await knex.raw(`
    DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
    CREATE TRIGGER on_auth_user_deleted
      AFTER DELETE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_user();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`);
  await knex.raw(`DROP FUNCTION IF EXISTS public.handle_new_user();`);

  await knex.raw(`DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;`);
  await knex.raw(`DROP FUNCTION IF EXISTS public.handle_deleted_user();`);
}
