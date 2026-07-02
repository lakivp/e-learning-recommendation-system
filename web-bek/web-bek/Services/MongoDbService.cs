namespace web_bek.Services
{
    using MongoDB.Driver;
    using web_bek.Models;
    using static System.Net.Mime.MediaTypeNames;

    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService(IConfiguration config)
        {
            var client = new MongoClient(config["MongoDb:ConnectionString"]);
            _database = client.GetDatabase(config["MongoDb:Database"]);
        }

        public IMongoCollection<User> Users =>
         _database.GetCollection<User>("users");
        public IMongoCollection<Profile> Profiles =>
        _database.GetCollection<Profile>("profiles");

        public IMongoCollection<Course> Courses =>
        _database.GetCollection<Course>("course");

        public IMongoCollection<Lesson> Lessons =>
        _database.GetCollection<Lesson>("lessons");
        public IMongoCollection<Comment> Comments =>
        _database.GetCollection<Comment>("comments");

        public IMongoCollection<UserCourse> UserCourses =>
        _database.GetCollection<UserCourse>("userCourses");

        public IMongoCollection<CourseTest> CourseTest =>
        _database.GetCollection<CourseTest>("courseTests");

        public IMongoCollection<TestSubmission> TestSubmissions =>
        _database.GetCollection<TestSubmission>("testSubmissions");
    }
}
