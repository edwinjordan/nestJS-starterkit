export enum MessagePattern {
  // Sales patterns
  SALE_CREATED = 'sale.created',
  SALE_UPDATED = 'sale.updated',
  SALE_CANCELLED = 'sale.cancelled',
  
  // Inventory patterns
  INVENTORY_LOW_STOCK = 'inventory.low_stock',
  INVENTORY_OUT_OF_STOCK = 'inventory.out_of_stock',
  INVENTORY_UPDATED = 'inventory.updated',
  
  // Notification patterns
  NOTIFICATION_EMAIL = 'notification.email',
  NOTIFICATION_SMS = 'notification.sms',
  NOTIFICATION_SYSTEM = 'notification.system',
  
  // Report patterns
  REPORT_GENERATE_SALES = 'report.generate.sales',
  REPORT_GENERATE_INVENTORY = 'report.generate.inventory',
}

export interface SaleCreatedEvent {
  saleId: string;
  invoiceNumber: string;
  total: number;
  customerName?: string;
  customerEmail?: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
}

export interface InventoryUpdatedEvent {
  itemId: string;
  itemName: string;
  itemCode: string;
  previousStock: number;
  currentStock: number;
  minStock: number;
  updatedAt: Date;
}

export interface LowStockEvent {
  itemId: string;
  itemName: string;
  itemCode: string;
  currentStock: number;
  minStock: number;
  reorderLevel: number;
}

export interface EmailNotificationEvent {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface SalesReportEvent {
  startDate: Date;
  endDate: Date;
  requestedBy: string;
  email: string;
}
