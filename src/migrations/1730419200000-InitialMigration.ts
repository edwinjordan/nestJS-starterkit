import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1730419200000 implements MigrationInterface {
    name = 'InitialMigration1730419200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create branches table
        await queryRunner.query(`
            CREATE TABLE "branches" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "address" character varying,
                "phone" character varying,
                "email" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_branch_code" UNIQUE ("code"),
                CONSTRAINT "PK_branches" PRIMARY KEY ("id")
            )
        `);

        // Create permissions table
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "module" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_permission_name" UNIQUE ("name"),
                CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
            )
        `);

        // Create roles table
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_role_name" UNIQUE ("name"),
                CONSTRAINT "PK_roles" PRIMARY KEY ("id")
            )
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "fullName" character varying NOT NULL,
                "phone" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "branchId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_branch" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL
            )
        `);

        // Create employees table
        await queryRunner.query(`
            CREATE TABLE "employees" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "employeeCode" character varying NOT NULL,
                "fullName" character varying NOT NULL,
                "email" character varying,
                "phone" character varying,
                "address" character varying,
                "position" character varying,
                "department" character varying,
                "hireDate" date,
                "branchId" uuid,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_employee_code" UNIQUE ("employeeCode"),
                CONSTRAINT "PK_employees" PRIMARY KEY ("id"),
                CONSTRAINT "FK_employees_branch" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL
            )
        `);

        // Create role_permissions junction table
        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "roleId" uuid NOT NULL,
                "permissionId" uuid NOT NULL,
                CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId"),
                CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
            )
        `);

        // Create user_roles junction table
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "userId" uuid NOT NULL,
                "roleId" uuid NOT NULL,
                CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId"),
                CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_role" ON "role_permissions" ("roleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_permission" ON "role_permissions" ("permissionId")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_roles_user" ON "user_roles" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_roles_role" ON "user_roles" ("roleId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_user_roles_role"`);
        await queryRunner.query(`DROP INDEX "IDX_user_roles_user"`);
        await queryRunner.query(`DROP INDEX "IDX_role_permissions_permission"`);
        await queryRunner.query(`DROP INDEX "IDX_role_permissions_role"`);

        // Drop junction tables
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);

        // Drop main tables
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "branches"`);
    }
}
