import type { Knex } from 'knex';
import { DEFAULT_ERROR_PAGES } from '@/lib/page-utils';
import { generatePageMetadataHash, generatePageLayersHash } from '@/lib/hash-utils';

/**
 * Migration: Add 403 Login Required error page
 */
export async function up(knex: Knex): Promise<void> {
  const loginErrorPage = DEFAULT_ERROR_PAGES.find(p => p.code === 403);
  if (!loginErrorPage) return;

  // Check if 403 already exists to avoid duplicates
  const existing = await knex('pages').where({ error_page: 403 }).first();
  if (existing) return;

  // Calculate hashes
  const metadataHash = generatePageMetadataHash({
    name: loginErrorPage.name,
    slug: '',
    settings: loginErrorPage.settings,
    is_index: false,
    is_dynamic: false,
    error_page: loginErrorPage.code,
  });

  const layers = JSON.parse(loginErrorPage.layers);
  const layersHash = generatePageLayersHash({
    layers,
    generated_css: null,
  });

  // Create draft version
  const [draftPage] = await knex('pages')
    .insert({
      name: loginErrorPage.name,
      error_page: loginErrorPage.code,
      slug: '',
      depth: 0,
      order: 0,
      is_published: false,
      settings: JSON.stringify(loginErrorPage.settings),
      content_hash: metadataHash,
    })
    .returning('id');

  // Create published version
  await knex('pages').insert({
    id: draftPage.id,
    name: loginErrorPage.name,
    error_page: loginErrorPage.code,
    slug: '',
    depth: 0,
    order: 0,
    is_published: true,
    settings: JSON.stringify(loginErrorPage.settings),
    content_hash: metadataHash,
  });

  // Create draft layers
  await knex('page_layers').insert({
    page_id: draftPage.id,
    layers: JSON.stringify(layers),
    is_published: false,
    content_hash: layersHash,
  });

  // Create published layers
  await knex('page_layers').insert({
    page_id: draftPage.id,
    layers: JSON.stringify(layers),
    is_published: true,
    content_hash: layersHash,
  });
}

export async function down(knex: Knex): Promise<void> {
  const page = await knex('pages').where({ error_page: 403 }).first();
  if (page) {
    await knex('page_layers').where({ page_id: page.id }).delete();
    await knex('pages').where({ id: page.id }).delete();
  }
}
