export const getToday = (): string => {
  const now = new Date();
  return now
    .toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\./g, '-')   // . -> -
    .replace(/\s/g, '')    // 공백 제거
    .replace(/-$/, '');    // 마지막 - 제거
};

export const formatTime = (time?: string | null) => {
  if (!time) return '--:--';
  const [hours, minutes] = time.split(':');
  return `${hours}시 ${minutes}분`;
};

export const formatLocalTime = (time?: string | null) => {
  if (!time) return '----';
  // 초에서 소수점 제거
  const [hours, minutes, secondsWithMs] = time.split(':');
  const seconds = secondsWithMs.split('.')[0]; // 00.000 -> 00
  return `${hours}:${minutes}:${seconds}`;
};

