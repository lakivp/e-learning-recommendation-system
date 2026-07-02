#include <signal.h>
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>

// primalac

int main()
{
	printf("This process id is %d. "
		"Waiting for SIGINT.\n", getpid());
	for (;;);
}
