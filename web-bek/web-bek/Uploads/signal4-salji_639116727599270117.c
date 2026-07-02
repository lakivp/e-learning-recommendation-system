#include <signal.h>
#include <stdio.h>
#include <errno.h>

// posiljalac

int main()
{
	int process_id;
	printf("Enter process_id which you want to send a signal:");
	// Unesi pid primaoca
	scanf("%d", &process_id);
	kill(process_id, SIGINT);
	printf("SIGINT sent to %d\n", process_id);

	return 0;
}
