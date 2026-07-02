using System.Net;
using System.Net.Mail;

namespace web_bek.Services
{
    public class EmailService
    {
        private readonly SmtpClient _smtp;
        private readonly string _from = "zlatanoviclazar898@gmail.com";

        public EmailService()
        {
            _smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(
                    "zlatanoviclazar898@gmail.com",
                    "omvm vajc cutl zrmy"   // app password
                ),
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Timeout = 15000
            };
        }


        public async Task SendResetEmail(string email, string link)
        {
            var message = new MailMessage
            {
                From = new MailAddress(_from),
                Subject = "Reset your password",
                Body = $"Click the link to reset your password:\n\n{link}",
                IsBodyHtml = false
            };

            message.To.Add(email);
            await _smtp.SendMailAsync(message);
        }

        public async Task SendConfirmEmail(string email, string link)
        {
            var message = new MailMessage
            {
                From = new MailAddress(_from),
                Subject = "Confirm your email address",
                Body = $"Welcome!\n\nPlease confirm your email by clicking the link below:\n\n{link}",
                IsBodyHtml = false
            };

            message.To.Add(email);
            await _smtp.SendMailAsync(message);
        }
    }
}