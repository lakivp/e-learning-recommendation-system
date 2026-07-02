namespace web_bek.Dto
{
    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int DisabledUsers { get; set; }
        public int NewUsersToday { get; set; }

        public List<UserSummaryDto> RecentUsers { get; set; }

        public List<RegistrationStatDto> RegistrationStats { get; set; }
        public List<TopUserDto> TopUsers { get; set; }
        public List<TopCourseDto> TopCourses { get; set; }
        public List<TopCompletedUserDto> TopCompletedUsers { get; set; } = new();

    }
}
