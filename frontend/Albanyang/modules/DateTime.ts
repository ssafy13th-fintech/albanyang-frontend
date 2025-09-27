

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