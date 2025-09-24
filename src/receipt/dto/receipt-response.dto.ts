export class ReceiptItemDto {
  description: string;
  price: number;
}

export class ReceiptResponseDto {
  date: string;
  total: number;
  items: ReceiptItemDto[];
  vendorName: string;
}
