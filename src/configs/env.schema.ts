import * as Joi from 'joi';

export const envSchema = Joi.object({
  // database setup
  PG_USERNAME: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),
  PG_HOST: Joi.string().required(),
  PG_DB: Joi.string().required(),
  PG_PORT: Joi.number().required(),

  // trigger key
  TRIGGER_SECRET_KEY: Joi.string().optional().default(''),

  // anilist graphql endpoint
  ANILIST_GRAPHQL_ENDPOINT: Joi.string().default('https://graphql.anilist.co'),

  // animevsub endpoint
  ANIMEVSUB_ENDPOINT: Joi.string().default('https://animevietsub.fun'),
  // animehay endpoint
  ANIMEHAY_ENDPOINT: Joi.string().default('https://animehay.video'),
  // gogoanime endpoint
  GOGOANIME_ENDPOINT: Joi.string().default('https://gogoanime3.co'),

  //google auth2 setup
  GOOGLE_ID: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('fake'),
  }),
  GOOGLE_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('fake'),
  }),

  //jwt setup
  JWT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('non-secure-secret-key'),
  }),
  JWT_EXPIRES_IN: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('5m'),
  }),
  REFRESH_JWT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('non-secure-secret-key-2'),
  }),
  REFRESH_JWT_EXPIRES_IN: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('182d'),
  }),
});
