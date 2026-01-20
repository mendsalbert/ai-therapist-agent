/**
 * Weekly Report Local Storage Utility
 * Handles saving, loading, and managing weekly reports in browser localStorage
 */

export interface WeeklyReportData {
  content: string;
  metadata: {
    weekStart: string;
    weekEnd: string;
    generatedAt: string;
    dataPoints: {
      moodEntries: number;
      journalEntries: number;
      meditationSessions: number;
      therapySessions: number;
    };
    isFailover: boolean;
  };
  insights: {
    averageMood: number;
    moodTrend: string;
    topEmotions: string[];
    activityStreak: number;
    progressHighlights: string[];
  };
}

const STORAGE_KEY_PREFIX = 'weekly_report_';
const REPORTS_LIST_KEY = 'weekly_reports_list';
const LATEST_REPORT_KEY = 'weekly_report_latest';

class WeeklyReportStorage {
  /**
   * Save a weekly report to localStorage
   */
  saveReport(report: WeeklyReportData): void {
    try {
      // Create a unique key based on week end date
      const reportKey = `${STORAGE_KEY_PREFIX}${report.metadata.weekEnd}`;
      
      // Save the report
      localStorage.setItem(reportKey, JSON.stringify(report));
      
      // Update the latest report
      localStorage.setItem(LATEST_REPORT_KEY, JSON.stringify(report));
      
      // Add to reports list if not already present
      const reportsList = this.getReportsList();
      if (!reportsList.includes(reportKey)) {
        reportsList.push(reportKey);
        localStorage.setItem(REPORTS_LIST_KEY, JSON.stringify(reportsList));
      }
    } catch (error) {
      console.error('Error saving weekly report to localStorage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some old reports.');
      }
    }
  }

  /**
   * Get the latest weekly report from localStorage
   */
  getLatestReport(): WeeklyReportData | null {
    try {
      const reportJson = localStorage.getItem(LATEST_REPORT_KEY);
      if (!reportJson) {
        return null;
      }
      return JSON.parse(reportJson) as WeeklyReportData;
    } catch (error) {
      console.error('Error loading latest weekly report from localStorage:', error);
      return null;
    }
  }

  /**
   * Get a specific weekly report by week end date
   */
  getReport(weekEnd: string): WeeklyReportData | null {
    try {
      const reportKey = `${STORAGE_KEY_PREFIX}${weekEnd}`;
      const reportJson = localStorage.getItem(reportKey);
      
      if (!reportJson) {
        return null;
      }
      
      return JSON.parse(reportJson) as WeeklyReportData;
    } catch (error) {
      console.error('Error loading weekly report from localStorage:', error);
      return null;
    }
  }

  /**
   * Get all saved weekly reports
   */
  getAllReports(): WeeklyReportData[] {
    try {
      const reportsList = this.getReportsList();
      const reports: WeeklyReportData[] = [];
      
      for (const reportKey of reportsList) {
        const reportJson = localStorage.getItem(reportKey);
        if (reportJson) {
          try {
            const report = JSON.parse(reportJson) as WeeklyReportData;
            reports.push(report);
          } catch (error) {
            console.error(`Error parsing report ${reportKey}:`, error);
          }
        }
      }
      
      // Sort by week end date (most recent first)
      reports.sort((a, b) => {
        const dateA = new Date(a.metadata.weekEnd).getTime();
        const dateB = new Date(b.metadata.weekEnd).getTime();
        return dateB - dateA;
      });
      
      return reports;
    } catch (error) {
      console.error('Error loading all weekly reports from localStorage:', error);
      return [];
    }
  }

  /**
   * Get the list of report keys
   */
  getReportsList(): string[] {
    try {
      const listJson = localStorage.getItem(REPORTS_LIST_KEY);
      if (!listJson) {
        return [];
      }
      return JSON.parse(listJson) as string[];
    } catch (error) {
      console.error('Error loading reports list from localStorage:', error);
      return [];
    }
  }

  /**
   * Delete a specific weekly report
   */
  deleteReport(weekEnd: string): void {
    try {
      const reportKey = `${STORAGE_KEY_PREFIX}${weekEnd}`;
      
      // Remove the report
      localStorage.removeItem(reportKey);
      
      // Remove from reports list
      const reportsList = this.getReportsList();
      const updatedList = reportsList.filter(key => key !== reportKey);
      localStorage.setItem(REPORTS_LIST_KEY, JSON.stringify(updatedList));
      
      // If this was the latest report, update latest report
      const latestReport = this.getLatestReport();
      if (latestReport && latestReport.metadata.weekEnd === weekEnd) {
        // Set the most recent remaining report as latest
        const remainingReports = this.getAllReports();
        if (remainingReports.length > 0) {
          localStorage.setItem(LATEST_REPORT_KEY, JSON.stringify(remainingReports[0]));
        } else {
          localStorage.removeItem(LATEST_REPORT_KEY);
        }
      }
    } catch (error) {
      console.error('Error deleting weekly report from localStorage:', error);
      throw error;
    }
  }

  /**
   * Clear all weekly reports from localStorage
   */
  clearAllReports(): void {
    try {
      const reportsList = this.getReportsList();
      
      // Delete all report keys
      for (const reportKey of reportsList) {
        localStorage.removeItem(reportKey);
      }
      
      // Clear the lists
      localStorage.removeItem(REPORTS_LIST_KEY);
      localStorage.removeItem(LATEST_REPORT_KEY);
    } catch (error) {
      console.error('Error clearing all weekly reports from localStorage:', error);
      throw error;
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const weeklyReportStorage = new WeeklyReportStorage();

