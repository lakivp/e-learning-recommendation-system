#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <signal.h>
#include <unistd.h>

void sigint_handler(int sig) {
	printf("Uhvacen SIGINT, signal broj %d\n", sig);
	printf("Program nastavlja dalje.\n");
}

int main(void)
{
	signal(SIGINT, sigint_handler);
	
    printf("PID procesa je %d\n", getpid());
    
	while(1) {
		sleep(5);
		printf("Radim\n");
	}
		
	// Posalji Ctrl-C

	return 0;
}

