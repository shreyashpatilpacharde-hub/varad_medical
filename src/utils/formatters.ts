// Currency, date, and invoice formatting helpers

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Check if a medicine is near expiry (within 180 days)
export const isExpiringSoon = (expiryDateStr: string): boolean => {
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 180 && diffDays > 0;
};

// Check if expired
export const isExpired = (expiryDateStr: string): boolean => {
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  return expiry.getTime() < now.getTime();
};

// Convert number to Indian Rupee Words for formal invoices
export const numberToWords = (num: number): string => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Rupees Zero Only';

  const inWords = (val: number): string => {
    let str = '';
    if (val > 10000000) {
      str += inWords(Math.floor(val / 10000000)) + ' Crore ';
      val %= 10000000;
    }
    if (val > 100000) {
      str += inWords(Math.floor(val / 100000)) + ' Lakh ';
      val %= 100000;
    }
    if (val > 1000) {
      str += inWords(Math.floor(val / 1000)) + ' Thousand ';
      val %= 1000;
    }
    if (val > 100) {
      str += inWords(Math.floor(val / 100)) + ' Hundred ';
      val %= 100;
    }
    if (val > 0) {
      if (val < 20) {
        str += a[val];
      } else {
        str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
      }
    }
    return str.trim();
  };

  return `Rupees ${inWords(n)} Only`;
};
