import { PrismaClient } from '@prisma/client'
import { fieldEncryptionExtension } from 'prisma-field-encryption'

/* The DbClient class creates a new instance of PrismaClient and provides a method to disconnect it. */
export class DbClient {
  public prisma: PrismaClient

  constructor() {
    if (!process.env.MONGO_ENCRYPTION_KEY) throw 'Missing mongo_encryption_key'

    this.prisma = new PrismaClient({ log: ['info'] })

    this.prisma.$extends(
      fieldEncryptionExtension({
        encryptionKey: process.env.MONGO_ENCRYPTION_KEY,
      }),
    )
  }
}

export const dbClient = new DbClient() // Create a single instance
