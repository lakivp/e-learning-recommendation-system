namespace web_bek.Dto
{
    public class LecturerDashboardDto
    {
        public List<CourseTopDto> TopCourses { get; set; } = new();
        public List<TopCourseCompletedDto> TopCompletedCourses { get; set; } = new();
        public List<LecturerEnrollmentDto> Enrollments { get; set; } = new();
        public List<TopUserCompletedDto> TopCompletedUsers { get; set; } = new();

    }
}
