import { MigrationInterface, QueryRunner } from "typeorm";

export class AddItemsAndSalesTables1730419300000 implements MigrationInterface {
    name = 'AddItemsAndSalesTables1730419300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create categories table
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_category_code" UNIQUE ("code"),
                CONSTRAINT "PK_categories" PRIMARY KEY ("id")
            )
        `);

        // Create units table
        await queryRunner.query(`
            CREATE TABLE "units" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_unit_code" UNIQUE ("code"),
                CONSTRAINT "PK_units" PRIMARY KEY ("id")
            )
        `);

        // Create items table
        await queryRunner.query(`
            CREATE TABLE "items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "categoryId" uuid,
                "unitId" uuid,
                "purchasePrice" decimal(15,2) NOT NULL DEFAULT 0,
                "sellingPrice" decimal(15,2) NOT NULL DEFAULT 0,
                "stock" integer NOT NULL DEFAULT 0,
                "minStock" integer NOT NULL DEFAULT 0,
                "barcode" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_item_code" UNIQUE ("code"),
                CONSTRAINT "PK_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_items_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_items_unit" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL
            )
        `);

        // Create sales table
        await queryRunner.query(`
            CREATE TABLE "sales" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "invoiceNumber" character varying NOT NULL,
                "saleDate" date NOT NULL,
                "userId" uuid NOT NULL,
                "branchId" uuid,
                "customerName" character varying,
                "customerPhone" character varying,
                "subtotal" decimal(15,2) NOT NULL DEFAULT 0,
                "discountPercent" decimal(5,2) NOT NULL DEFAULT 0,
                "discountAmount" decimal(15,2) NOT NULL DEFAULT 0,
                "taxPercent" decimal(5,2) NOT NULL DEFAULT 0,
                "taxAmount" decimal(15,2) NOT NULL DEFAULT 0,
                "total" decimal(15,2) NOT NULL DEFAULT 0,
                "paid" decimal(15,2) NOT NULL DEFAULT 0,
                "change" decimal(15,2) NOT NULL DEFAULT 0,
                "paymentMethod" character varying NOT NULL DEFAULT 'cash',
                "notes" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_sale_invoice" UNIQUE ("invoiceNumber"),
                CONSTRAINT "PK_sales" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sales_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_sales_branch" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL
            )
        `);

        // Create sale_items table
        await queryRunner.query(`
            CREATE TABLE "sale_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "saleId" uuid NOT NULL,
                "itemId" uuid NOT NULL,
                "itemName" character varying NOT NULL,
                "price" decimal(15,2) NOT NULL,
                "quantity" integer NOT NULL,
                "discountPercent" decimal(5,2) NOT NULL DEFAULT 0,
                "discountAmount" decimal(15,2) NOT NULL DEFAULT 0,
                "subtotal" decimal(15,2) NOT NULL,
                CONSTRAINT "PK_sale_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sale_items_sale" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_sale_items_item" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_items_category" ON "items" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_items_unit" ON "items" ("unitId")`);
        await queryRunner.query(`CREATE INDEX "IDX_items_barcode" ON "items" ("barcode")`);
        await queryRunner.query(`CREATE INDEX "IDX_sales_date" ON "sales" ("saleDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_sales_user" ON "sales" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sales_branch" ON "sales" ("branchId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sale_items_sale" ON "sale_items" ("saleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sale_items_item" ON "sale_items" ("itemId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_sale_items_item"`);
        await queryRunner.query(`DROP INDEX "IDX_sale_items_sale"`);
        await queryRunner.query(`DROP INDEX "IDX_sales_branch"`);
        await queryRunner.query(`DROP INDEX "IDX_sales_user"`);
        await queryRunner.query(`DROP INDEX "IDX_sales_date"`);
        await queryRunner.query(`DROP INDEX "IDX_items_barcode"`);
        await queryRunner.query(`DROP INDEX "IDX_items_unit"`);
        await queryRunner.query(`DROP INDEX "IDX_items_category"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "sale_items"`);
        await queryRunner.query(`DROP TABLE "sales"`);
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TABLE "units"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }
}
