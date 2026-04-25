import type { Knex } from 'knex';

/**
 * Migration: Add Auth Settings
 *
 * Inserts the default authentication configuration into the settings table.
 */

export async function up(knex: Knex): Promise<void> {
  const defaultAuthSettings = {
    providers: {
      email_password: true,
      google: false
    },
    redirects: {
      after_login: '/',
      after_logout: '/'
    }
  };

  await knex('settings').insert([
    { key: 'auth', value: JSON.stringify(defaultAuthSettings) }
  ]).onConflict('key').ignore();
}

export async function down(knex: Knex): Promise<void> {
  await knex('settings').where({ key: 'auth' }).del();
}
