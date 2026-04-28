export const formatCurrency = (amount, currency = 'USD', options = { privacyMode: false }) => {
  if (options.privacyMode) {
    return currency === 'USD' ? '$ ••,•••.••' : '₩ ••,•••,•••';
  }
  
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'ko-KR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount);
};
