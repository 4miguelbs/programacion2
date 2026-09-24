export const formatMoney = (amount: number, currency = 'COP', symbol = '$'): string => {
  if (isNaN(amount)) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg`;
  }
  return `${grams.toLocaleString('es-CO', { maximumFractionDigits: 0 })} g`;
};

export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const formatDateShort = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};
