#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <signal.h>
#include <unistd.h>
#include <ctype.h>

// Univerzalni signal handler

void signal_handler(int sig) {
	printf("Broj signala je %d\n", sig);
	printf("Naziv signala je %s\n", sys_siglist[sig]);
	//printf("Program se zavrsava\n");
	//exit(0);
}

int main() {
	
	int i;
	for (i=1; i<=64; i++)
		signal(i, signal_handler);
	
	printf("PID procesa je %d\n", getpid());
	
	/*
	 Iz terminala slati razlicite signale ovom procesu kill naredbom, npr:
	 kill -1 <pid>, kill -2 <pid>, itd.
	*/
	
	while(1) {
		sleep(5);
		printf("Radim\n");
	}

	return 0;
}






