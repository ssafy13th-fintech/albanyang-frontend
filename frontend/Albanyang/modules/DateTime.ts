

/**
 * 오늘 날짜를 yyyy-mm-dd 형식으로 구합니다.
 * 
 * @returns 포맷팅 된 오늘 날짜
 */
export function GetTodayDate(){
    const today = new Date();

    // padStart로 두 자리 맞추기
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    console.log(formattedDate); // 예: 2025-09-26
    return formattedDate;
}

/**
 * 특정 날짜(문자열)를 YYYY-MM-DD 포맷으로 반환
 * @param date string | Date - "YYYY-MM-DD" 또는 Date 객체
 */
export function GetOtherDate(date: string | Date): string {
  if (typeof date === "string") {
    // 이미 YYYY-MM-DD 형태라면 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // 문자열이지만 다른 포맷일 경우 Date로 변환
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    throw new Error(`Invalid date string: ${date}`);
  } else if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  throw new Error("Invalid date input");
}



/**
 * 현재 월을 반환하는 함수
 * yyyy-mm 형태로 반홥합니다.
 * 
 * @returns 포맷팅 된 이번 달
 */
export function GetThisMonthDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 두 자리 맞춤
  return `${year}-${month}`;
}


/**
 * 
 * 
 * @param selectedDate 
 * @returns 
 */
export function GetSelectedMonthDate(selectedDate: string): string {
  const date = new Date(selectedDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}