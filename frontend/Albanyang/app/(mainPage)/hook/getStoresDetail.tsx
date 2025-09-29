import { getStoreSchedules } from "@/api/schedule/getSchedule";
import { getStores } from "@/api/Stores";
import { getTimesheetsByDate } from "@/api/timesheet/getTimesheetByDate";
import { getToday } from "@/utils/date";

export interface StoreDetail {
  id: number;
  name: string;
  staffs: StaffStatus[];
  totalStaffs: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

export interface StaffStatus {
  id: number;
  name: string;
  nickname: string;
  checkInTime?: string;
  checkOutTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  scheduleDate?: string;
  status: 'present' | 'late' | 'absent' | 'no-schedule';
  isWorking: boolean;
}

export const fetchStoresWithStaffStatus = async (): Promise<StoreDetail[]> => {
  try {
    const today = getToday();
    
    const storesResponse = await getStores();
    const stores = storesResponse.data.stores;
    
    const storesWithStatus = await Promise.all(
      stores.map(async (store) => {
        try {
          console.log('실행');
          const timesheetResponse = await getTimesheetsByDate(store.id, today);
          console.log(timesheetResponse);
          const timesheets = timesheetResponse?.timesheets ?? []; 
          console.log(timesheets);
          
          const scheduleResponse = await getStoreSchedules(store.id, undefined, today);
          const schedules = scheduleResponse?.schedules ?? [];
          console.log(schedules);
          
          const staffsWithStatus: StaffStatus[] = schedules.map(schedule => {
          const timesheet = timesheets.find(t => t.staffId === schedule.staffId);
            
          let status: 'present' | 'late' | 'absent' | 'no-schedule' = 'absent';
          let isWorking = false;
          
          if (timesheet?.arrivedAt) {
            const scheduledTime = new Date(`${today}T${schedule.workStartTime}`);
            const arrivedTime = new Date(`${today}T${timesheet.arrivedAt}`);
            
            if (arrivedTime <= scheduledTime) {
              status = 'present';
            } else {
              status = 'late';
            }
            
            isWorking = !timesheet.leftAt;
          }
          
          return {
            id: schedule.staffId,
            name: schedule.staffNickname,
            nickname: schedule.staffNickname,
            checkInTime: timesheet?.arrivedAt ?? undefined,
            checkOutTime: timesheet?.leftAt ?? undefined,
            scheduledStartTime: schedule.workStartTime,
            scheduledEndTime: schedule.workEndTime,
            scheduleDate: schedule.commuteDate,
            status,
            isWorking
          };
        });
        
        const presentCount = staffsWithStatus.filter(s => s.status === 'present').length;
        const lateCount = staffsWithStatus.filter(s => s.status === 'late').length;
        const absentCount = staffsWithStatus.filter(s => s.status === 'absent').length;
        
        return {
          id: store.id,
          name: store.name,
          staffs: staffsWithStatus,
          totalStaffs: staffsWithStatus.length,
          presentCount,
          lateCount,
          absentCount
        };
        } catch (error) {
          
          return {
            id: store.id,
            name: store.name,
            staffs: [],
            totalStaffs: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0
          };
        }
      })
    );
    
    return storesWithStatus;
  } catch (error) {
    
    return [];
  }
};