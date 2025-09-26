import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { NAVBAR_BASE_HEIGHT } from "@/components/navBar/NavBar";

const TOP_PADDING = 16;
const SIDE_PADDING = 20;
const SECTION_SPACING = 32;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WorkSession {
    storeId: number;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    isWorking: boolean;
    totalHours: number;
    targetHours: number;
    currentTimesheetId?: number;
}

const TimeSection = ({ workSession }: { workSession: WorkSession | null }) => {
  return (
    <View style={styles.section}>
      <View style={styles.timeCard}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>출근시간</Text>
          <Text style={styles.timeValue}>
            {workSession?.checkInTime || '--:--:--'}
          </Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>퇴근시간</Text>
          <Text style={styles.timeValue}>
            {workSession?.checkOutTime || (workSession?.isWorking ? '근무 중' : '--:--:--')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TimeSection;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
    paddingBottom: NAVBAR_HEIGHT + 120,
  },
  section: {
    marginBottom: SECTION_SPACING,
    paddingHorizontal: SIDE_PADDING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  salaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  salaryContent: {
    flex: 1,
  },
  monthText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  salaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  salaryLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  salaryAmount: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.accent,
  },
  currencyText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  earnedText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  noAccountContainer: {
    flex: 1,
  },
  noAccountTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  noAccountSubtitle: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  storeTabContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  storeTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 100,
    alignItems: 'center',
  },
  activeStoreTab: {
    borderBottomColor: colors.accent,
  },
  storeTabText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  activeStoreTabText: {
    color: colors.accent,
    fontFamily: FONTS.jamsil.medium4,
  },
  detailButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  detailButtonText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse,
  },
  timeCard: {
    flexDirection: 'row',
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-around',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginBottom: 12,
  },
  timeValue: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
  },
  progressCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  progressTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.disable,
    borderRadius: 6,
    position: 'relative',
    marginVertical: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  runningMascot: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: -6,
    resizeMode: 'contain',
  },
  progressText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  fixedButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: NAVBAR_HEIGHT + 40,
  },
  buttonSection: {
    paddingHorizontal: SIDE_PADDING,
  },
  attendanceButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  attendanceButtonPressed: {
    backgroundColor: colors.main,
    transform: [{ scale: 0.98 }],
  },
  attendanceButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
});