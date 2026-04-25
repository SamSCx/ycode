import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

/**
 * Migration: Create System "User Profiles" Collection
 *
 * Adds the 'is_system' column to the collections table if it does not exist,
 * and creates the default system collection for user profiles which will be
 * synchronized with Supabase's auth.users table.
 */
export async function up(knex: Knex): Promise<void> {
  // 1. Add is_system to collections
  const hasIsSystem = await knex.schema.hasColumn('collections', 'is_system');
  if (!hasIsSystem) {
    await knex.schema.alterTable('collections', (table) => {
      table.boolean('is_system').notNullable().defaultTo(false);
    });
  }

  // Generate UUIDs deterministically or predictably? No, use random and store them.
  // We'll generate a hardcoded UUID so the system user profile collection has a known ID,
  // making it easier to reference in code or triggers if needed.
  // Wait, the CMS handles it via UUID, let's just generate a specific one.
  const collectionId = 'system-collection-user-profiles';
  const collectionUuid = '00000000-0000-0000-0000-000000000001';

  // 2. Insert User Profiles collection (Draft & Published)
  await knex('collections').insert([
    {
      id: collectionId,
      name: 'User Profiles',
      uuid: collectionUuid,
      order: -1, // Push to top or special position
      is_published: false,
      is_system: true,
    },
    {
      id: collectionId,
      name: 'User Profiles',
      uuid: collectionUuid,
      order: -1,
      is_published: true,
      is_system: true,
    }
  ]);

  // 3. Define Standard Fields
  // We use hardcoded IDs for system fields to ensure they can be safely referenced.
  const fields = [
    { id: 'system-field-user-id', name: 'User ID', key: 'id', type: 'text', fillable: false, hidden: true, order: 0 },
    { id: 'system-field-user-name', name: 'Name', key: 'name', type: 'text', fillable: true, hidden: false, order: 1 },
    { id: 'system-field-user-slug', name: 'Slug', key: 'slug', type: 'text', fillable: true, hidden: false, order: 2 },
    { id: 'system-field-user-email', name: 'Email', key: 'email', type: 'email', fillable: true, hidden: false, order: 3 },
    { id: 'system-field-user-avatar', name: 'Avatar URL', key: 'avatar_url', type: 'image', fillable: true, hidden: false, order: 4 },
  ];

  const fieldRows = fields.flatMap((field) => {
    return [
      {
        id: field.id,
        collection_id: collectionId,
        name: field.name,
        key: field.key,
        type: field.type,
        fillable: field.fillable,
        hidden: field.hidden,
        order: field.order,
        is_published: false,
        data: JSON.stringify(field.type === 'image' ? { multiple: false } : {}),
      },
      {
        id: field.id,
        collection_id: collectionId,
        name: field.name,
        key: field.key,
        type: field.type,
        fillable: field.fillable,
        hidden: field.hidden,
        order: field.order,
        is_published: true,
        data: JSON.stringify(field.type === 'image' ? { multiple: false } : {}),
      }
    ];
  });

  await knex('collection_fields').insert(fieldRows);
}

export async function down(knex: Knex): Promise<void> {
  const collectionId = 'system-collection-user-profiles';

  await knex('collection_fields')
    .where({ collection_id: collectionId })
    .del();

  await knex('collections')
    .where({ id: collectionId })
    .del();

  // We don't drop the 'is_system' column as other collections might be using it
  // or it might cause data loss.
}
