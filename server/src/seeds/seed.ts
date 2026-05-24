import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/user.entity";
import { Business } from "../entities/business.entity";
import { Customer } from "../entities/customer.entity";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import { InvoiceItem } from "../entities/invoice-item.entity";
import { hashValue } from "../utils/hash";
import { env } from "../config/env";

const seed = async () => {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const businessRepository = AppDataSource.getRepository(Business);
  const customerRepository = AppDataSource.getRepository(Customer);
  const invoiceRepository = AppDataSource.getRepository(Invoice);

  const existingAdmin = await userRepository.findOne({
    where: { email: "admin@smartledger.app" },
  });
  if (existingAdmin) {
    console.log("Seed data already exists");
    await AppDataSource.destroy();
    return;
  }

  const admin = await userRepository.save(
    userRepository.create({
      name: env.seedName || "SmartLedger Admin",
      email: env.seedEmail || "admin@smartledger.app",
      password: await hashValue(env.seedPassword || "Admin12345!"),
      role: UserRole.ADMIN,
      emailVerified: true,
    }),
  );

  const business = await businessRepository.save(
    businessRepository.create({
      user: admin,
      businessName: "SmartLedger Studio",
      email: "billing@smartledger.app",
      phone: "+1 555 100 2000",
      address: "123 Ledger Street",
      taxNumber: "TAX-100200",
    }),
  );

  const customer = await customerRepository.save(
    customerRepository.create({
      business,
      name: "Acme Freelance Co.",
      email: "finance@acme.example",
      phone: "+1 555 200 3000",
      address: "45 Market Road",
    }),
  );

  const invoice = invoiceRepository.create({
    business,
    customer,
    invoiceNumber: "INV-2026-SEED01",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    subtotal: "500.00",
    tax: "50.00",
    total: "550.00",
    status: InvoiceStatus.SENT,
    notes: "Seeded demo invoice",
    items: [
      Object.assign(new InvoiceItem(), {
        description: "Invoice design and setup",
        quantity: "1.00",
        unitPrice: "500.00",
        total: "500.00",
      }),
    ],
  });

  await invoiceRepository.save(invoice);
  console.log("Seed data created successfully");
  await AppDataSource.destroy();
};

void seed().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
