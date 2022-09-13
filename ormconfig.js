var dbConfig = {
  synchronize: false,
  migrations: ['migrations/*.js'],
  cli: {
    migrationsDir: 'migrations',
  },
};

if (process.env.NODE_ENV === 'production')
  Object.assign(dbConfig, {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['**/*.entity.js'],
    migrationsRun: true,
  });
else
  Object.assign(dbConfig, {
    type: 'sqlite',
    database: 'db.sqlite',
    entities: ['**/*.entity.js'],
  });
