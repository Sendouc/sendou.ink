## Folder structure

### Frontend

### Server

```
server/
├── index.ts/               entry point
├── routes/                 route mapping to controllers
├── middleware/             middlewares that are called before controllers
├── controllers/            route handling logic
├── services/               methods that talk to the database
├── core/                   business logic
└── prisma/
    ├── migrations/         migrations
    ├── schema.prisma       database models
    └── seed.ts             seeding script
```
