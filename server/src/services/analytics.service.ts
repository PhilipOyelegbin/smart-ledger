import { AppDataSource } from "../config/data-source";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import { Customer } from "../entities/customer.entity";
import { Business } from "../entities/business.entity";
import { UserRole } from "../entities/user.entity";
import { toNumber } from "../utils/number";
import { In } from "typeorm";

export class AnalyticsService {
  async dashboard(userId: string, role?: UserRole) {
    const invoiceRepository = AppDataSource.getRepository(Invoice);
    const customerRepository = AppDataSource.getRepository(Customer);
    const businessRepository = AppDataSource.getRepository(Business);

    const businesses = await businessRepository.find({
      where: role === UserRole.ADMIN ? {} : { user: { id: userId } },
      relations: { user: true },
    });
    if (!businesses.length && role !== UserRole.ADMIN) {
      return {
        totalRevenue: 0,
        unpaidInvoices: 0,
        monthlyRevenue: [],
        customerCount: 0,
        recentInvoices: [],
      };
    }

    const businessIds = businesses.map((business) => business.id);
    const invoices = await invoiceRepository.find({
      where:
        role === UserRole.ADMIN ? {} : { business: { id: In(businessIds) } },
      relations: {
        business: true,
        customer: true,
        items: true,
        receipts: true,
      },
      order: { createdAt: "DESC" },
    });

    const customers = await customerRepository.find({
      where:
        role === UserRole.ADMIN ? {} : { business: { id: In(businessIds) } },
      relations: { business: true },
    });

    const totalRevenue = invoices.reduce(
      (sum, invoice) =>
        sum +
        invoice.receipts.reduce(
          (receiptTotal, receipt) =>
            receiptTotal + toNumber(receipt.amountPaid),
          0,
        ),
      0,
    );

    const unpaidInvoices = invoices.filter(
      (invoice) =>
        invoice.status !== InvoiceStatus.PAID &&
        invoice.status !== InvoiceStatus.CANCELLED,
    ).length;
    const recentInvoices = invoices.slice(0, 5);

    const monthlyRevenueMap = new Map<string, number>();
    invoices.forEach((invoice) => {
      invoice.receipts.forEach((receipt) => {
        const key = new Date(receipt.createdAt).toISOString().slice(0, 7);
        monthlyRevenueMap.set(
          key,
          (monthlyRevenueMap.get(key) || 0) + toNumber(receipt.amountPaid),
        );
      });
    });

    return {
      totalRevenue,
      unpaidInvoices,
      monthlyRevenue: Array.from(monthlyRevenueMap.entries()).map(
        ([month, revenue]) => ({ month, revenue }),
      ),
      customerCount: customers.length,
      recentInvoices,
    };
  }
}
