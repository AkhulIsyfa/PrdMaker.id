import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ensure pgcrypto extension for gen_random_uuid()
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // 1. Table: users
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 100).notNullable();
    table.string('role', 20).notNullable().defaultTo('PUBLIC'); // 'ADMIN' or 'PUBLIC'
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['email'], 'idx_users_email');
    table.index(['role'], 'idx_users_role');
  });

  // 2. Table: document_templates
  await knex.schema.createTable('document_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('template_key', 50).notNullable().unique(); // e.g. 'PRD_TEMPLATE_V1'
    table.string('document_type', 50).notNullable(); // 'PRD', 'SYSTEM_ARCHITECTURE', 'API_SPEC', 'UI_DESIGN'
    table.text('system_instruction').notNullable();
    table.text('schema_template').notNullable();
    table.jsonb('supported_languages').notNullable().defaultTo(JSON.stringify(['id', 'en']));
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['document_type'], 'idx_templates_doc_type');
  });

  // 3. Table: generation_jobs
  await knex.schema.createTable('generation_jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('project_name', 100).notNullable();
    table.string('document_type', 50).notNullable();
    table.string('language', 10).notNullable().defaultTo('id');
    table.jsonb('input_payload').notNullable();
    table.string('status', 20).notNullable().defaultTo('PENDING'); // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    table.text('generated_content').nullable();
    table.text('error_message').nullable();
    table.integer('prompt_tokens').notNullable().defaultTo(0);
    table.integer('candidate_tokens').notNullable().defaultTo(0);
    table.integer('latency_ms').notNullable().defaultTo(0);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['user_id'], 'idx_jobs_user_id');
    table.index(['status'], 'idx_jobs_status');
    table.index(['created_at'], 'idx_jobs_created_at');
    table.index(['document_type'], 'idx_jobs_doc_type');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('generation_jobs');
  await knex.schema.dropTableIfExists('document_templates');
  await knex.schema.dropTableIfExists('users');
}

