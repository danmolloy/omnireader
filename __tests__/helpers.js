import Knex from 'knex';
import knexConfig from '/knexfile';
import knexCleaner from 'knex-cleaner';
import gql from 'graphql-tag';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from '/api/schema';
import resolvers from '/api/resolvers';
import { Model } from 'objection';
import knexManager from 'knex-db-manager';
import * as models from '/models';

const { createTestClient } = require('apollo-server-testing');

export const setupDatabase = () => {
  const dbManager = knexManager.databaseManagerFactory({
    knex: {
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'dan',
        password: '',
        database: 'omnireader_test',
      },
    },
    dbManager: {
      superUser: 'dan',
      superPassword: '',
    },
  });

  const knex = Knex(knexConfig.test);
  Model.knex(knex);

  global.beforeAll(async () => {
    await dbManager.dropDb();
    await dbManager.createDb();
    await knex.migrate.latest();
  });

  global.beforeEach(async () => {
    await knexCleaner.clean(knex);
  });

  global.afterAll(async () => {
    knex.destroy();
    await dbManager.dropDb();
    dbManager.close();
  });
};

export const setupApi = () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ models }),
  });
  const { query, mutate } = createTestClient(server);
  global.query = query;
  global.mutate = mutate;
  global.gql = gql;
};
