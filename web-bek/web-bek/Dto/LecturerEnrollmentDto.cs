namespace web_bek.Dto
{
    public class LecturerEnrollmentDto
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Username { get; set; }
        public string CourseId { get; set; }
        public string CourseName { get; set; }
        public DateTime EnrolledAt { get; set; }
    }
}
