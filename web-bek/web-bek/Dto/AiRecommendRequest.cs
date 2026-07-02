namespace web_bek.Dto
{
    public class AiRecommendRequest
    {
        public List<AiCourseDto> Courses { get; set; }

        public List<string> CompletedCourseIds { get; set; }

        public List<string> EnrolledCourseIds { get; set; }   

        public string Interests { get; set; }                 
    }
}
