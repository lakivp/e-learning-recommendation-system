#include <signal.h>
#include <stdio.h>
#include <unistd.h>

/* User‐defined signal handler function */
void my_handler(int sig)
{
	printf("I got SIGINT, number %d\n", sig);
}

int main(void)
{
	/* Part I: Catch SIGINT */

	signal(SIGINT, my_handler);
	printf ("Catching SIGINT\n");
	sleep(5);
	printf("Catch SIGINT ends\n");

	/*Part II: Ignore SIGINT */
	signal(SIGINT, SIG_IGN);
	printf("Ignoring SIGINT\n");
	sleep(5);
	printf("Ignoring SIGINT ends\n");

	/* Part III: Default action for SIGINT */
	signal(SIGINT, SIG_DFL);
	printf("Default action for SIGINT\n");
	sleep(5);
	printf("No SIGINT within 5 seconds\n");
	return 0;
}


